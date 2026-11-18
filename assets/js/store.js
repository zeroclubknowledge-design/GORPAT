/* GORPAT admin data layer.
 * Records live on the server (server/server.js, SQLite). GT.load() fetches everything the
 * signed-in staff member's role may read into an in-memory cache; reads are synchronous from
 * that cache, and every write is applied to the cache straight away and sent to the API in
 * order. If the server rejects a write, a "gt:error" event fires and the admin reloads from
 * the server so the screen never drifts from the database. */
(function () {
  const COMPANY = {
    name: 'Gorpat Trading Limited',
    tagline: 'Trading and Procurement Services',
    headOffice: ['East-End Building', 'Bluesteels Boulevard', 'Airforce Market', 'Market Junction, Aba Road', 'Port Harcourt, Rivers State'],
    usOffice: ['6 Carrington Court', 'Hazel Crest, IL 60429'],
    usPhone: '773-808-0138',
    phones: ['+234-08033102870', '+234-07068050167', '+234-08037445722'],
    email: 'Gorpatltd@yahoo.com',
  };

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

  /* ---------- API ---------- */
  async function api(method, path, body) {
    const res = await fetch('/api/' + path, {
      method, credentials: 'same-origin',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : {},
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    let data = null;
    if (res.status !== 204) { try { data = await res.json(); } catch (e) { data = null; } }
    if (res.status === 401 && !path.startsWith('auth/')) window.dispatchEvent(new CustomEvent('gt:signedout'));
    if (!res.ok) { const err = new Error((data && data.error) || `Request failed (${res.status})`); err.status = res.status; throw err; }
    return data;
  }

  /* ---------- cache + write queue ---------- */
  let cache = { settings: {}, collections: {}, user: null, perms: null };
  let queue = Promise.resolve();
  let pending = 0;
  function enqueue(fn) {
    pending++;
    const p = queue.then(fn).catch((e) => { window.dispatchEvent(new CustomEvent('gt:error', { detail: e })); }).finally(() => { pending--; });
    queue = p;
    return p;
  }

  async function load() {
    await queue;
    const d = await api('GET', 'data');
    cache = { settings: d.settings, collections: d.collections, user: d.user, perms: d.perms };
    return cache;
  }

  const db = {
    all(col) { return cache.collections[col] || (cache.collections[col] = []); },
    get(col, id) { return this.all(col).find((r) => r.id === id); },
    insert(col, rec) {
      rec.id = rec.id || uid(col.slice(0, 2));
      this.all(col).unshift(rec);
      enqueue(async () => {
        const saved = await api('POST', `records/${col}`, rec);
        const changed = saved.id !== rec.id || saved.number !== rec.number;
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
      enqueue(() => api('PUT', `records/${col}/${id}`, snapshot));
      return r;
    },
    remove(col, id) {
      cache.collections[col] = this.all(col).filter((r) => r.id !== id);
      if (col === 'invoices') cache.collections.payments = this.all('payments').filter((p) => p.invoiceId !== id);
      enqueue(() => api('DELETE', `records/${col}/${id}`));
    },
    settings() { return cache.settings; },
    saveSettings(patch) {
      Object.assign(cache.settings, patch);
      return enqueue(async () => { cache.settings = await api('PUT', 'settings', cache.settings); });
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
    db, api, load, COMPANY, totals, money, moneyShort, esc, uid, iso, daysAgo,
    get user() { return cache.user; }, get perms() { return cache.perms; },
    can(kind, col) { return !!(cache.perms && (kind === 'read' || kind === 'write' ? cache.perms[kind].includes(col) : cache.perms[kind])); },
  };
})();
