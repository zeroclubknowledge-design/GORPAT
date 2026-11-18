/* Gorpat Trading Limited — backend.
 * Zero dependencies: Node 22.13+ (built-in node:sqlite). Serves the website + admin
 * and a JSON API. Run:  node server/server.js
 *
 * Environment:
 *   PORT           default 5520
 *   DATA_DIR       where gorpat.db lives (default server/data)
 *   COOKIE_SECURE  set to 1 when served over HTTPS (production)
 *   TRUST_PROXY    set to 1 behind a reverse proxy (uses X-Forwarded-For for rate limits)
 */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');
const { demoRecords, DEFAULT_SETTINGS, iso } = require('./seed');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT) || 5520;
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(__dirname, 'data'));
const COOKIE_SECURE = process.env.COOKIE_SECURE === '1';
const TRUST_PROXY = process.env.TRUST_PROXY === '1';
const SESSION_DAYS = 7;
const COOKIE = 'gt_sess';

fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new DatabaseSync(path.join(DATA_DIR, 'gorpat.db'));
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS records (
    col TEXT NOT NULL, id TEXT NOT NULL, data TEXT NOT NULL,
    created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL,
    created_by TEXT, updated_by TEXT,
    PRIMARY KEY (col, id));
  CREATE INDEX IF NOT EXISTS records_col ON records (col, created_at DESC);
  CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    role TEXT NOT NULL, pass_hash TEXT NOT NULL, created_at INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS audit (
    at INTEGER NOT NULL, user_id TEXT, action TEXT NOT NULL, col TEXT, rec_id TEXT);
`);

/* ---------------- roles ---------------- */
const COLS = ['clients', 'vendors', 'invoices', 'quotations', 'procurement', 'payments', 'expenses', 'enquiries'];
const ROLES = {
  Owner: { read: COLS, write: COLS, reports: true, settings: true },
  Procurement: {
    read: ['clients', 'vendors', 'invoices', 'quotations', 'procurement', 'enquiries'],
    write: ['clients', 'vendors', 'quotations', 'procurement', 'enquiries'], reports: false, settings: false,
  },
  Finance: {
    read: ['clients', 'vendors', 'invoices', 'quotations', 'procurement', 'payments', 'expenses', 'enquiries'],
    write: ['clients', 'invoices', 'quotations', 'payments', 'expenses'], reports: true, settings: false,
  },
};

/* ---------------- helpers ---------------- */
const now = () => Date.now();
const uid = (p) => p + '_' + crypto.randomBytes(8).toString('hex');
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');
const str = (v, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const isEmail = (s) => /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(s);
const ID_RE = /^[a-z]{2}_[A-Za-z0-9]{1,40}$/;

function hashPassword(pw) {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(pw, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt.toString('base64')}$${key.toString('base64')}`;
}
function verifyPassword(pw, stored) {
  const [alg, s, k] = String(stored).split('$');
  if (alg !== 'scrypt') return false;
  const key = Buffer.from(k, 'base64');
  const test = crypto.scryptSync(pw, Buffer.from(s, 'base64'), key.length, { N: 16384, r: 8, p: 1 });
  return crypto.timingSafeEqual(key, test);
}
const DUMMY_HASH = hashPassword(crypto.randomBytes(12).toString('hex'));

function getSettings() {
  const row = db.prepare('SELECT value FROM kv WHERE key = ?').get('settings');
  return Object.assign({}, DEFAULT_SETTINGS, row ? JSON.parse(row.value) : {});
}
function putSettings(s) { db.prepare('INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run('settings', JSON.stringify(s)); }

function list(col) {
  return db.prepare('SELECT data FROM records WHERE col = ? ORDER BY created_at DESC, rowid DESC').all(col).map((r) => JSON.parse(r.data));
}
function getRec(col, id) { const r = db.prepare('SELECT data FROM records WHERE col = ? AND id = ?').get(col, id); return r ? JSON.parse(r.data) : null; }
function insertRec(col, rec, userId, at = now()) {
  db.prepare('INSERT INTO records (col, id, data, created_at, updated_at, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(col, rec.id, JSON.stringify(rec), at, at, userId || null, userId || null);
}
function audit(userId, action, col, id) { db.prepare('INSERT INTO audit (at, user_id, action, col, rec_id) VALUES (?, ?, ?, ?, ?)').run(now(), userId || null, action, col || null, id || null); }

function nextNumber(col) {
  const s = getSettings();
  const prefix = col === 'quotations' ? s.quotePrefix : s.invoicePrefix;
  const nums = list(col).map((d) => parseInt(String(d.number).replace(/\D/g, ''), 10) || 0);
  return prefix + String((nums.length ? Math.max(...nums) : 0) + 1).padStart(4, '0');
}
function numberTaken(col, number, exceptId) { return list(col).some((d) => d.number === number && d.id !== exceptId); }

function tx(fn) { db.exec('BEGIN'); try { const r = fn(); db.exec('COMMIT'); return r; } catch (e) { db.exec('ROLLBACK'); throw e; } }

function loadDemo(userId) {
  const data = demoRecords();
  tx(() => {
    db.prepare('DELETE FROM records').run();
    let t = now();
    for (const col of COLS) for (const rec of (data[col] || []).slice().reverse()) insertRec(col, rec, userId, t++);
  });
}

/* ---------------- rate limiting (in memory) ---------------- */
const buckets = new Map();
function limited(key, max, windowMs) {
  const t = now(); const b = buckets.get(key) || [];
  const recent = b.filter((x) => t - x < windowMs);
  recent.push(t); buckets.set(key, recent);
  return recent.length > max;
}
setInterval(() => { const t = now(); for (const [k, v] of buckets) if (!v.some((x) => t - x < 3600e3)) buckets.delete(k); db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(t); }, 600e3).unref();

/* ---------------- http plumbing ---------------- */
const SEC_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; img-src 'self' data: https://images.unsplash.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'",
};
class HttpError extends Error { constructor(status, msg) { super(msg); this.status = status; } }
function send(res, status, body, headers = {}) {
  const json = body === undefined ? '' : JSON.stringify(body);
  res.writeHead(status, { ...SEC_HEADERS, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
  res.end(json);
}
function readJson(req) {
  return new Promise((resolve, reject) => {
    if (!/^application\/json/i.test(req.headers['content-type'] || '')) return reject(new HttpError(415, 'Expected JSON'));
    let size = 0; const chunks = [];
    req.on('data', (c) => { size += c.length; if (size > 512 * 1024) { reject(new HttpError(413, 'Request too large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); } catch { reject(new HttpError(400, 'Invalid JSON')); } });
    req.on('error', reject);
  });
}
function clientIp(req) { return (TRUST_PROXY && String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()) || req.socket.remoteAddress || '?'; }
function parseCookies(req) { const out = {}; String(req.headers.cookie || '').split(';').forEach((p) => { const i = p.indexOf('='); if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim()); }); return out; }
function sessionCookie(token, maxAge) { return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${COOKIE_SECURE ? '; Secure' : ''}`; }

function currentUser(req) {
  const token = parseCookies(req)[COOKIE];
  if (!token) return null;
  const row = db.prepare('SELECT u.id, u.name, u.email, u.role, s.expires_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?').get(sha256(token));
  if (!row || row.expires_at < now()) return null;
  // sliding expiry, refreshed at most once an hour
  if (row.expires_at - now() < SESSION_DAYS * 864e5 - 3600e3) db.prepare('UPDATE sessions SET expires_at = ? WHERE token_hash = ?').run(now() + SESSION_DAYS * 864e5, sha256(token));
  return { id: row.id, name: row.name, email: row.email, role: row.role };
}
function startSession(res, userId) {
  const token = crypto.randomBytes(32).toString('base64url');
  db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').run(sha256(token), userId, now() + SESSION_DAYS * 864e5);
  return { 'Set-Cookie': sessionCookie(token, SESSION_DAYS * 86400) };
}
const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role });
const userCount = () => db.prepare('SELECT COUNT(*) n FROM users').get().n;
const ownerCount = () => db.prepare("SELECT COUNT(*) n FROM users WHERE role = 'Owner'").get().n;

function need(user, check) {
  if (!user) throw new HttpError(401, 'Please sign in');
  if (check && !check(ROLES[user.role] || {})) throw new HttpError(403, "Your role doesn't allow this");
}

/* ---------------- validation ---------------- */
function cleanRecord(col, body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new HttpError(400, 'Invalid record');
  const rec = JSON.parse(JSON.stringify(body)); // drop functions/prototypes
  if (JSON.stringify(rec).length > 200000) throw new HttpError(413, 'Record too large');
  if (col === 'invoices' || col === 'quotations') {
    if (!Array.isArray(rec.items)) rec.items = [];
    rec.items = rec.items.slice(0, 200).map((i) => ({ desc: str(i.desc, 1000), qty: Number(i.qty) || 0, rate: Number(i.rate) || 0 }));
    rec.number = str(rec.number, 40);
    rec.date = /^\d{4}-\d{2}-\d{2}$/.test(rec.date) ? rec.date : iso(new Date());
  }
  if (col === 'payments') {
    rec.amount = Number(rec.amount) || 0;
    if (!getRec('invoices', rec.invoiceId)) throw new HttpError(400, 'Payment must belong to an existing invoice');
  }
  if (col === 'expenses') rec.amount = Number(rec.amount) || 0;
  return rec;
}
function validPassword(pw) { if (typeof pw !== 'string' || pw.length < 8 || pw.length > 200) throw new HttpError(400, 'Password must be at least 8 characters'); return pw; }

/* ---------------- API ---------------- */
async function api(req, res, url) {
  const method = req.method;
  const parts = url.pathname.split('/').filter(Boolean).slice(1); // after "api"
  const ip = clientIp(req);

  // Same-origin check for anything that changes state (defence in depth on top of SameSite cookies).
  if (method !== 'GET') {
    const origin = req.headers.origin;
    if (origin && new URL(origin).host !== req.headers.host) throw new HttpError(403, 'Cross-origin request blocked');
  }

  /* ----- public website endpoints ----- */
  if (parts[0] === 'public' && method === 'POST') {
    if (limited('pub:' + ip, 8, 3600e3)) throw new HttpError(429, 'Too many submissions. Please try again later or call us.');
    const b = await readJson(req);
    if (str(b.website)) return send(res, 200, { ok: true }); // honeypot: bots fill hidden field
    const name = str(b.name, 120), email = str(b.email, 200), phone = str(b.phone, 40);
    if (!name || !isEmail(email)) throw new HttpError(400, 'Please enter your name and a valid email.');
    if (parts[1] === 'quote') {
      const item = str(b.item, 1000), category = str(b.category, 80), condition = str(b.condition, 40) || 'New', city = str(b.city, 120);
      const qty = Math.max(1, Math.min(1e6, parseInt(b.qty, 10) || 1));
      if (!item || !category || !phone) throw new HttpError(400, 'Please fill in the item, category and phone number.');
      const s = getSettings();
      tx(() => insertRec('quotations', {
        id: uid('qt'), number: nextNumber('quotations'), clientId: '', date: iso(new Date()), terms: 'Valid 30 days', status: 'Request', source: 'Website',
        request: { name, email, phone, city, category, condition, qty: String(qty), item },
        items: [{ desc: `${item} (${category}, ${condition})`, qty, rate: 0 }],
        discount: { type: 'percent', value: 0 }, taxOn: true, taxRate: s.taxRate, notes: '',
      }));
      return send(res, 201, { ok: true });
    }
    if (parts[1] === 'enquiry') {
      const message = str(b.message, 4000);
      if (!message) throw new HttpError(400, 'Please write a message.');
      insertRec('enquiries', { id: uid('en'), name, email, phone, subject: str(b.subject, 200), message, date: iso(new Date()), status: 'New' });
      return send(res, 201, { ok: true });
    }
    throw new HttpError(404, 'Not found');
  }

  /* ----- auth ----- */
  if (parts[0] === 'auth') {
    if (parts[1] === 'state' && method === 'GET') {
      const u = currentUser(req);
      return send(res, 200, { needsSetup: userCount() === 0, user: u, perms: u ? ROLES[u.role] : null });
    }
    if (parts[1] === 'setup' && method === 'POST') {
      if (limited('setup:' + ip, 10, 900e3)) throw new HttpError(429, 'Too many attempts');
      const b = await readJson(req);
      const name = str(b.name, 120), email = str(b.email, 200).toLowerCase();
      if (!name || !isEmail(email)) throw new HttpError(400, 'Enter your name and a valid email');
      validPassword(b.password);
      const id = uid('us');
      const created = tx(() => {
        if (userCount() !== 0) return false; // only the very first account can be created this way
        db.prepare('INSERT INTO users (id, name, email, role, pass_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(id, name, email, 'Owner', hashPassword(b.password), now());
        if (!db.prepare('SELECT 1 FROM kv WHERE key = ?').get('settings')) putSettings(DEFAULT_SETTINGS);
        return true;
      });
      if (!created) throw new HttpError(409, 'Setup has already been completed. Please sign in.');
      if (b.demo) loadDemo(id);
      audit(id, 'setup');
      return send(res, 201, { ok: true }, startSession(res, id));
    }
    if (parts[1] === 'login' && method === 'POST') {
      const b = await readJson(req);
      const email = str(b.email, 200).toLowerCase();
      if (limited('login:' + ip, 20, 900e3) || limited('login:' + email, 8, 900e3)) throw new HttpError(429, 'Too many sign-in attempts. Wait 15 minutes and try again.');
      const u = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      const ok = verifyPassword(String(b.password || ''), u ? u.pass_hash : DUMMY_HASH) && !!u;
      if (!ok) throw new HttpError(401, 'Email or password is incorrect');
      audit(u.id, 'login');
      return send(res, 200, { ok: true }, startSession(res, u.id));
    }
    if (parts[1] === 'logout' && method === 'POST') {
      const token = parseCookies(req)[COOKIE];
      if (token) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha256(token));
      return send(res, 200, { ok: true }, { 'Set-Cookie': sessionCookie('', 0) });
    }
    if (parts[1] === 'password' && method === 'POST') {
      const user = currentUser(req); need(user);
      const b = await readJson(req);
      const row = db.prepare('SELECT pass_hash FROM users WHERE id = ?').get(user.id);
      if (!verifyPassword(String(b.current || ''), row.pass_hash)) throw new HttpError(400, 'Current password is incorrect');
      db.prepare('UPDATE users SET pass_hash = ? WHERE id = ?').run(hashPassword(validPassword(b.password)), user.id);
      const token = parseCookies(req)[COOKIE];
      db.prepare('DELETE FROM sessions WHERE user_id = ? AND token_hash != ?').run(user.id, sha256(token)); // sign out other devices
      return send(res, 200, { ok: true });
    }
    throw new HttpError(404, 'Not found');
  }

  const user = currentUser(req);
  need(user);
  const perms = ROLES[user.role];

  /* ----- bootstrap: everything this role may read ----- */
  if (parts[0] === 'data' && method === 'GET') {
    const collections = {};
    for (const c of COLS) collections[c] = perms.read.includes(c) ? list(c) : [];
    return send(res, 200, { user, perms, settings: getSettings(), collections });
  }

  /* ----- settings ----- */
  if (parts[0] === 'settings' && method === 'PUT') {
    need(user, (p) => p.settings);
    const b = await readJson(req);
    const cur = getSettings();
    const s = {
      currency: ['NGN', 'USD', 'GBP', 'EUR'].includes(b.currency) ? b.currency : cur.currency,
      taxRate: Math.max(0, Math.min(100, Number(b.taxRate))) || 0,
      invoicePrefix: str(b.invoicePrefix, 20) || cur.invoicePrefix,
      quotePrefix: str(b.quotePrefix, 20) || cur.quotePrefix,
      defaultNotes: str(b.defaultNotes, 1000),
      bank: { name: str(b.bank && b.bank.name, 120), account: str(b.bank && b.bank.account, 160), number: str(b.bank && b.bank.number, 40) },
    };
    putSettings(s); audit(user.id, 'settings');
    return send(res, 200, s);
  }
  if (parts[0] === 'demo' && method === 'POST') {
    need(user, (p) => p.settings);
    const b = await readJson(req);
    if (b.mode === 'clear') tx(() => db.prepare('DELETE FROM records').run()); else loadDemo(user.id);
    audit(user.id, b.mode === 'clear' ? 'clear-data' : 'load-demo');
    return send(res, 200, { ok: true });
  }

  /* ----- staff (owner only) ----- */
  if (parts[0] === 'staff') {
    need(user, (p) => p.settings);
    const id = parts[1];
    if (method === 'GET' && !id) return send(res, 200, db.prepare('SELECT id, name, email, role FROM users ORDER BY created_at').all());
    if (method === 'POST' && !id) {
      const b = await readJson(req);
      const name = str(b.name, 120), email = str(b.email, 200).toLowerCase(), role = ROLES[b.role] ? b.role : null;
      if (!name || !isEmail(email) || !role) throw new HttpError(400, 'Name, valid email and role are required');
      validPassword(b.password);
      if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(email)) throw new HttpError(409, 'A staff member with that email already exists');
      const nid = uid('us');
      db.prepare('INSERT INTO users (id, name, email, role, pass_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(nid, name, email, role, hashPassword(b.password), now());
      audit(user.id, 'staff-add', 'users', nid);
      return send(res, 201, { id: nid, name, email, role });
    }
    const target = id && db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!target) throw new HttpError(404, 'Staff member not found');
    if (method === 'PUT') {
      const b = await readJson(req);
      const name = str(b.name, 120) || target.name, email = (str(b.email, 200) || target.email).toLowerCase(), role = ROLES[b.role] ? b.role : target.role;
      if (!isEmail(email)) throw new HttpError(400, 'Enter a valid email');
      if (target.role === 'Owner' && role !== 'Owner' && ownerCount() <= 1) throw new HttpError(400, 'There must be at least one Owner');
      const clash = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, id);
      if (clash) throw new HttpError(409, 'Another staff member uses that email');
      db.prepare('UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?').run(name, email, role, id);
      if (b.password) { db.prepare('UPDATE users SET pass_hash = ? WHERE id = ?').run(hashPassword(validPassword(b.password)), id); db.prepare('DELETE FROM sessions WHERE user_id = ?').run(id); }
      if (role !== target.role) db.prepare('DELETE FROM sessions WHERE user_id = ? ').run(id);
      audit(user.id, 'staff-edit', 'users', id);
      return send(res, 200, { id, name, email, role });
    }
    if (method === 'DELETE') {
      if (id === user.id) throw new HttpError(400, "You can't remove your own account");
      if (target.role === 'Owner' && ownerCount() <= 1) throw new HttpError(400, 'There must be at least one Owner');
      db.prepare('DELETE FROM users WHERE id = ?').run(id);
      audit(user.id, 'staff-remove', 'users', id);
      return send(res, 204);
    }
  }

  /* ----- business records ----- */
  if (parts[0] === 'records') {
    const col = parts[1], id = parts[2];
    if (!COLS.includes(col)) throw new HttpError(404, 'Unknown collection');
    if (method === 'GET') { need(user, (p) => p.read.includes(col)); return send(res, 200, id ? getRec(col, id) : list(col)); }
    need(user, (p) => p.write.includes(col));

    if (method === 'POST' && !id) {
      const rec = cleanRecord(col, await readJson(req));
      const saved = tx(() => {
        if (!ID_RE.test(String(rec.id || '')) || getRec(col, rec.id)) rec.id = uid(col.slice(0, 2));
        if ((col === 'invoices' || col === 'quotations') && (!rec.number || numberTaken(col, rec.number))) rec.number = nextNumber(col);
        insertRec(col, rec, user.id);
        return rec;
      });
      audit(user.id, 'create', col, saved.id);
      return send(res, 201, saved);
    }
    if (method === 'PUT' && id) {
      const rec = cleanRecord(col, await readJson(req));
      rec.id = id;
      if (!getRec(col, id)) throw new HttpError(404, 'Record not found');
      if ((col === 'invoices' || col === 'quotations') && numberTaken(col, rec.number, id)) throw new HttpError(409, `Number ${rec.number} is already used`);
      db.prepare('UPDATE records SET data = ?, updated_at = ?, updated_by = ? WHERE col = ? AND id = ?').run(JSON.stringify(rec), now(), user.id, col, id);
      audit(user.id, 'update', col, id);
      return send(res, 200, rec);
    }
    if (method === 'DELETE' && id) {
      tx(() => {
        db.prepare('DELETE FROM records WHERE col = ? AND id = ?').run(col, id);
        if (col === 'invoices') for (const p of list('payments').filter((p) => p.invoiceId === id)) db.prepare('DELETE FROM records WHERE col = ? AND id = ?').run('payments', p.id);
      });
      audit(user.id, 'delete', col, id);
      return send(res, 204);
    }
  }
  throw new HttpError(404, 'Not found');
}

/* ---------------- static files ---------------- */
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.json': 'application/json', '.txt': 'text/plain; charset=utf-8', '.woff2': 'font/woff2' };
const PUBLIC_DIRS = ['assets', 'admin'];
function serveStatic(req, res, url) {
  let rel = decodeURIComponent(url.pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  const segs = rel.split('/').filter(Boolean);
  const allowed = (segs.length === 1 && segs[0] === 'index.html') || (segs.length > 1 && PUBLIC_DIRS.includes(segs[0]));
  const file = path.resolve(ROOT, '.' + path.posix.normalize('/' + segs.join('/')));
  if (!allowed || !file.startsWith(ROOT + path.sep) || segs.some((s) => s.startsWith('.'))) return notFound(res);
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) {
      // "/admin" without slash → redirect
      if (segs.length === 1 && segs[0] === 'admin') { res.writeHead(301, { Location: '/admin/' }); return res.end(); }
      return notFound(res);
    }
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, { ...SEC_HEADERS, 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': ['.html', '.js', '.css'].includes(ext) ? 'no-cache' : 'public, max-age=86400' });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).pipe(res);
  });
}
function notFound(res) { res.writeHead(404, { ...SEC_HEADERS, 'Content-Type': 'text/plain' }); res.end('Not found'); }

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://local');
  try {
    if (url.pathname === '/admin') { res.writeHead(301, { Location: '/admin/' }); return res.end(); }
    if (url.pathname.startsWith('/api/')) return await api(req, res, url);
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error: 'Method not allowed' });
    serveStatic(req, res, url);
  } catch (e) {
    if (e instanceof HttpError) return send(res, e.status, { error: e.message });
    console.error(e);
    send(res, 500, { error: 'Server error' });
  }
});
server.listen(PORT, () => console.log(`Gorpat server on http://localhost:${PORT}  (admin: /admin/, data: ${DATA_DIR})`));
