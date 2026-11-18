/* GORPAT admin data layer — Supabase (Postgres + Auth) over plain fetch, no libraries.
 * GT.load() fetches everything the signed-in staff member's role may read into an in-memory
 * cache; reads are synchronous from that cache, and every write is applied to the cache straight
 * away and sent to Supabase in order. Row Level Security in the database decides what is allowed.
 * If a write is rejected, a "gt:error" event fires and the admin reloads from the database. */
(function () {
  const CFG = window.GT_CONFIG;
  const URL_ = CFG.supabaseUrl.replace(/\/$/, '');
  const KEY = CFG.supabaseAnonKey;
  const SKEY = 'gt.session';

  const COMPANY = {
    name: 'Gorpat Trading Limited',
    tagline: 'Trading and Procurement Services',
    headOffice: ['East-End Building', 'Bluesteels Boulevard', 'Airforce Market', 'Market Junction, Aba Road', 'Port Harcourt, Rivers State'],
    usOffice: ['6 Carrington Court', 'Hazel Crest, IL 60429'],
    usPhone: '773-808-0138',
    phones: ['+234-08033102870', '+234-07068050167', '+234-08037445722'],
    email: 'Gorpatltd@yahoo.com',
  };
  const DEFAULT_SETTINGS = {
    currency: 'NGN', taxRate: 7.5, invoicePrefix: 'GT-INV-', quotePrefix: 'GT-QT-',
    bank: { name: 'Bank name', account: 'Account name — Gorpat Trading Limited', number: '0000000000' },
    defaultNotes: 'Thank you for choosing Gorpat Trading Limited.',
  };
  // Mirror of can_read / can_write in supabase/schema.sql — used only to shape the UI.
  const COLS = ['clients', 'vendors', 'invoices', 'quotations', 'procurement', 'payments', 'expenses', 'enquiries'];
  // Mirror of can_read / can_write in supabase/002_head_admin_access.sql — shapes the UI only;
  // the database enforces the real rules.
  const SECTIONS = ['clients', 'enquiries', 'procurement', 'quotations', 'invoices', 'payments', 'expenses', 'vendors', 'reports'];
  function permsFor(me) {
    if (!me) return NONE;
    if (me.role === 'Owner') return { read: COLS, write: COLS, reports: true, settings: true, head: true };
    if (ROLES[me.role]) return { ...ROLES[me.role], head: false }; // legacy roles (before migration 002)
    if (me.role !== 'Staff') return NONE;
    const a = me.access || {};
    const lvl = (k) => ({ edit: 2, view: 1 }[a[k]] || 0);
    const read = COLS.filter((c) => lvl(c) >= 1
      || (c === 'clients' && Math.max(lvl('invoices'), lvl('quotations'), lvl('procurement'), lvl('payments')) >= 1)
      || (c === 'vendors' && Math.max(lvl('procurement'), lvl('expenses')) >= 1)
      || (c === 'invoices' && Math.max(lvl('payments'), lvl('reports')) >= 1)
      || ((c === 'payments' || c === 'expenses') && lvl('reports') >= 1));
    return { read, write: COLS.filter((c) => lvl(c) === 2), reports: lvl('reports') >= 1, settings: false, head: false };
  }
  const ROLES = {
    Owner: { read: COLS, write: COLS, reports: true, settings: true },
    Procurement: { read: ['clients', 'vendors', 'invoices', 'quotations', 'procurement', 'enquiries'], write: ['clients', 'vendors', 'quotations', 'procurement', 'enquiries'], reports: false, settings: false },
    Finance: { read: ['clients', 'vendors', 'invoices', 'quotations', 'procurement', 'payments', 'expenses', 'enquiries'], write: ['clients', 'invoices', 'quotations', 'payments', 'expenses'], reports: true, settings: false },
  };
  const NONE = { read: [], write: [], reports: false, settings: false };

  const uid = (p) => p + '_' + Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => b.toString(16).padStart(2, '0')).join('');
  const iso = (d) => { d = new Date(d); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return iso(d); };

  function totals(doc) {
    const subtotal = (doc.items || []).reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.rate) || 0), 0);
    const d = doc.discount || { type: 'percent', value: 0 };
    const discount = d.type === 'percent' ? subtotal * (Number(d.value) || 0) / 100 : Math.min(subtotal, Number(d.value) || 0);
    const taxable = subtotal - discount;
    const tax = doc.taxOn ? taxable * (Number(doc.taxRate) || 0) / 100 : 0;
    return { subtotal, discount, tax, total: taxable + tax };
  }

  /* ---------- session ---------- */
  let session = null;
  try { session = JSON.parse(localStorage.getItem(SKEY)); } catch (e) { session = null; }
  function setSession(s) {
    session = s && s.access_token ? {
      access_token: s.access_token, refresh_token: s.refresh_token,
      expires_at: Number(s.expires_at) || Math.floor(Date.now() / 1000) + (Number(s.expires_in) || 3600),
      user: s.user ? { id: s.user.id, email: s.user.email } : (session && session.user) || null,
    } : null;
    if (session) localStorage.setItem(SKEY, JSON.stringify(session)); else localStorage.removeItem(SKEY);
  }
  let refreshing = null;
  function refresh() {
    if (!refreshing) {
      refreshing = (async () => {
        const r = await fetch(`${URL_}/auth/v1/token?grant_type=refresh_token`, { method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: session.refresh_token }) });
        const d = await r.json().catch(() => ({}));
        if (!r.ok) { setSession(null); throw authError(d, r.status); }
        setSession(d);
      })().finally(() => { refreshing = null; });
    }
    return refreshing;
  }
  async function accessToken() {
    if (!session) return null;
    if (session.expires_at * 1000 - Date.now() < 60e3) await refresh();
    return session && session.access_token;
  }

  /* ---------- HTTP helpers ---------- */
  function friendly(d, status) {
    const m = (d && (d.message || d.msg || d.error_description || d.error)) || `Request failed (${status})`;
    if ((d && d.code === '42501') || /row-level security|permission denied/i.test(m)) return "Your role doesn't allow this";
    if (/JWT expired|invalid JWT/i.test(m)) return 'Your session ended. Please sign in again.';
    return m;
  }
  function authError(d, status) {
    let m = (d && (d.msg || d.error_description || d.message || d.error)) || `Request failed (${status})`;
    if (/invalid login credentials/i.test(m)) m = 'Email or password is incorrect';
    if (/email not confirmed/i.test(m)) m = 'Please confirm your email first — check your inbox for the link from Supabase.';
    if (/rate limit|too many/i.test(m)) m = 'Too many attempts. Please wait a few minutes and try again.';
    const e = new Error(m); e.status = status; return e;
  }
  async function rest(method, path, body, headers = {}) {
    const t = await accessToken();
    const res = await fetch(`${URL_}/rest/v1/${path}`, {
      method,
      headers: { apikey: KEY, Authorization: 'Bearer ' + (t || KEY), 'Content-Type': 'application/json', ...headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    let data = null;
    const text = await res.text();
    if (text) { try { data = JSON.parse(text); } catch (e) { data = text; } }
    if (res.status === 401 && t) { setSession(null); window.dispatchEvent(new CustomEvent('gt:signedout')); }
    if (!res.ok) { const e = new Error(friendly(data, res.status)); e.status = res.status; throw e; }
    return data;
  }
  const rpc = (fn, args = {}) => rest('POST', `rpc/${fn}`, args);
  const RET = { Prefer: 'return=representation' };
  async function authCall(path, body, { bearer = false, method = 'POST' } = {}) {
    const headers = { apikey: KEY, 'Content-Type': 'application/json' };
    if (bearer) headers.Authorization = 'Bearer ' + (await accessToken());
    const res = await fetch(`${URL_}/auth/v1/${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) throw authError(d, res.status);
    return d;
  }

  /* ---------- cache + write queue ---------- */
  let cache = { settings: { ...DEFAULT_SETTINGS }, collections: {}, user: null, perms: NONE };
  let queue = Promise.resolve();
  let pending = 0;
  function enqueue(fn) {
    pending++;
    const p = queue.then(fn).catch((e) => { window.dispatchEvent(new CustomEvent('gt:error', { detail: e })); }).finally(() => { pending--; });
    queue = p;
    return p;
  }

  async function profile() {
    if (!session || !session.user) return null;
    // falls back to the pre-002 columns so the admin keeps working until the migration is run
    const q = `staff?id=eq.${encodeURIComponent(session.user.id)}&select=`;
    const rows = await rest('GET', q + 'id,name,email,role,access').catch((e) => (e.status === 400 ? rest('GET', q + 'id,name,email,role') : Promise.reject(e)));
    return rows[0] || null;
  }

  async function load() {
    await queue;
    const me = await profile();
    if (!me) { const e = new Error('Please sign in'); e.status = 401; throw e; }
    const perms = permsFor(me);
    let pendingAdmins = 0;
    if (perms.head) pendingAdmins = (await rest('GET', 'staff?role=eq.Pending&select=id')).length;
    const collections = {};
    COLS.forEach((c) => { collections[c] = []; });
    let settings = { ...DEFAULT_SETTINGS };
    if (perms.read.length) {
      const s = await rest('GET', 'settings?key=eq.settings&select=value');
      if (s[0]) settings = { ...DEFAULT_SETTINGS, ...s[0].value };
      for (let from = 0; ; from += 1000) {
        const rows = await rest('GET', 'records?select=col,data&order=created_at.desc,id.desc', undefined, { 'Range-Unit': 'items', Range: `${from}-${from + 999}` });
        rows.forEach((r) => { (collections[r.col] = collections[r.col] || []).push(r.data); });
        if (rows.length < 1000) break;
      }
    }
    cache = { settings, collections, user: me, perms, pendingAdmins };
    return cache;
  }

  const db = {
    all(col) { return cache.collections[col] || (cache.collections[col] = []); },
    get(col, id) { return this.all(col).find((r) => r.id === id); },
    insert(col, rec) {
      rec.id = rec.id || uid(col.slice(0, 2));
      this.all(col).unshift(rec);
      const snapshot = JSON.parse(JSON.stringify(rec));
      enqueue(async () => {
        const rows = await rest('POST', 'records?select=data', { col, id: rec.id, data: snapshot }, RET);
        const saved = rows[0].data;
        const changed = saved.number !== rec.number;
        Object.assign(rec, saved);
        if (changed) window.dispatchEvent(new CustomEvent('gt:changed'));
      });
      return rec;
    },
    update(col, id, patch) {
      const r = this.get(col, id);
      if (!r) return null;
      Object.assign(r, patch);
      const snapshot = JSON.parse(JSON.stringify(r));
      enqueue(async () => {
        const rows = await rest('PATCH', `records?col=eq.${col}&id=eq.${encodeURIComponent(id)}&select=id`, { data: snapshot }, RET);
        if (!rows.length) throw new Error("Your role doesn't allow this");
      });
      return r;
    },
    remove(col, id) {
      cache.collections[col] = this.all(col).filter((r) => r.id !== id);
      if (col === 'invoices') cache.collections.payments = this.all('payments').filter((p) => p.invoiceId !== id);
      enqueue(() => rest('DELETE', `records?col=eq.${col}&id=eq.${encodeURIComponent(id)}`));
    },
    settings() { return cache.settings; },
    saveSettings(patch) {
      Object.assign(cache.settings, patch);
      const value = JSON.parse(JSON.stringify(cache.settings));
      return enqueue(async () => {
        const rows = await rest('PATCH', 'settings?key=eq.settings&select=value', { value }, RET);
        if (!rows.length) throw new Error("Your role doesn't allow this");
        cache.settings = { ...DEFAULT_SETTINGS, ...rows[0].value };
      });
    },
    nextNumber(kind) {
      const s = cache.settings;
      const prefix = kind === 'quotations' ? s.quotePrefix : s.invoicePrefix;
      const nums = this.all(kind).map((d) => parseInt(String(d.number).replace(/\D/g, ''), 10) || 0);
      return prefix + String((nums.length ? Math.max(...nums) : 0) + 1).padStart(4, '0');
    },
    flush() { return queue; },
    get pending() { return pending; },
  };

  /* ---------- auth ---------- */
  const adminUrl = () => location.origin + location.pathname;
  const auth = {
    get signedIn() { return !!session; },
    async needsSetup() { return !!(await rpc('needs_setup')); },
    async signIn(email, password) {
      setSession(await authCall('token?grant_type=password', { email, password }));
    },
    // returns { confirm: true } when Supabase has emailed a confirmation link
    async signUp(name, email, password) {
      const d = await authCall(`signup?redirect_to=${encodeURIComponent(adminUrl())}`, { email, password, data: { name } });
      if (d.access_token) { setSession(d); return { confirm: false }; }
      return { confirm: true };
    },
    async signOut() {
      try { if (session) await authCall('logout', null, { bearer: true }); } catch (e) { /* already expired */ }
      setSession(null);
    },
    async changePassword(current, next) {
      if (!next || next.length < 8) throw new Error('New password must be at least 8 characters');
      const email = cache.user && cache.user.email;
      await authCall('token?grant_type=password', { email, password: current }).catch(() => { throw new Error('Current password is incorrect'); });
      await authCall('user', { password: next }, { bearer: true, method: 'PUT' });
    },
    async setPassword(next) {
      if (!next || next.length < 8) throw new Error('Password must be at least 8 characters');
      await authCall('user', { password: next }, { bearer: true, method: 'PUT' });
    },
    async sendReset(email) { await authCall(`recover?redirect_to=${encodeURIComponent(adminUrl())}`, { email }); },
    // Supabase email links come back as #access_token=…&type=signup|recovery
    consumeRedirect() {
      const h = location.hash.replace(/^#/, '');
      if (!/(^|&)(access_token|error_description)=/.test(h)) return null;
      const p = Object.fromEntries(new URLSearchParams(h));
      history.replaceState(null, '', location.pathname + location.search);
      if (p.error_description) return { error: p.error_description.replace(/\+/g, ' ') };
      setSession({ access_token: p.access_token, refresh_token: p.refresh_token, expires_in: p.expires_in, expires_at: p.expires_at });
      return { type: p.type };
    },
    async whoami() {
      const u = await authCall('user', null, { bearer: true, method: 'GET' });
      session.user = { id: u.id, email: u.email }; setSession(session);
      return u;
    },
    profile,
  };

  /* ---------- staff (Owner) ---------- */
  const staff = {
    list: () => rest('GET', 'staff?select=id,name,email,role,access,created_at&order=created_at.asc')
      .catch((e) => (e.status === 400 ? rest('GET', 'staff?select=id,name,email,role,created_at&order=created_at.asc') : Promise.reject(e))),
    async update(id, patch) {
      const rows = await rest('PATCH', `staff?id=eq.${encodeURIComponent(id)}&select=id`, patch, RET);
      if (!rows.length) throw new Error("Your role doesn't allow this");
    },
  };

  /* ---------- Owner tools ---------- */
  async function clearAll() { await queue; await rpc('clear_records'); }
  async function loadDemo() {
    await clearAll();
    const data = window.GT_DEMO();
    const t0 = Date.now();
    let i = 0;
    const rows = [];
    for (const col of COLS) for (const rec of (data[col] || []).slice().reverse()) rows.push({ col, id: rec.id, data: rec, created_at: new Date(t0 + (i++) * 1000).toISOString() });
    // insert invoices before payments (payments must reference an existing invoice)
    rows.sort((a, b) => (a.col === 'payments') - (b.col === 'payments'));
    await rest('POST', 'records', rows, { Prefer: 'return=minimal' });
  }

  const SYM = { NGN: '₦', USD: '$', GBP: '£', EUR: '€' };
  function money(n, cur) {
    cur = cur || cache.settings.currency || 'NGN';
    return (SYM[cur] || cur + ' ') + (Number(n) || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function moneyShort(n, cur) {
    cur = cur || cache.settings.currency || 'NGN';
    return (SYM[cur] || cur + ' ') + (Number(n) || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 });
  }
  function esc(s) { return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  window.GT = {
    db, auth, staff, load, clearAll, loadDemo, COMPANY, totals, money, moneyShort, esc, uid, iso, daysAgo,
    get user() { return cache.user; }, get perms() { return cache.perms; },
    get pendingAdmins() { return cache.pendingAdmins || 0; }, SECTIONS, permsFor,
    roleLabel(r) { return { Owner: 'Head admin', Staff: 'Admin', Pending: 'Awaiting approval', Disabled: 'Disabled' }[r] || r; },
    can(kind, col) { const p = cache.perms || NONE; return !!(kind === 'read' || kind === 'write' ? p[kind].includes(col) : p[kind]); },
  };
})();
