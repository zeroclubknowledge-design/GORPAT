(function () {
  const { db, money, moneyShort, esc, totals, COMPANY } = GT;
  const $ = (s, el = document) => el.querySelector(s);
  const main = $('#main');

  /* ---------------- icons ---------------- */
  const P = {
    overview: '<path d="M3 3h8v8H3zM13 3h8v5h-8zM13 10h8v11h-8zM3 13h8v8H3z" fill="currentColor"/>',
    clients: '<circle cx="9" cy="7.5" r="3.5" fill="currentColor"/><circle cx="17" cy="8.5" r="2.8" fill="currentColor"/><path d="M2 20c0-4 3.1-6.5 7-6.5s7 2.5 7 6.5zM16.5 13.6c3 .2 5.5 2.3 5.5 5.4v1h-4.6c0-2.6-.3-4.7-.9-6.4z" fill="currentColor"/>',
    procurement: '<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z" fill="currentColor"/><path d="M3 7.5 12 12l9-4.5M12 12v9" stroke="#fbfbfd" stroke-width="1.6" fill="none"/>',
    invoices: '<path d="M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="currentColor"/><path d="M14 2v6h6M8 13h8M8 17h5" stroke="#fbfbfd" stroke-width="1.8" fill="none"/>',
    quotations: '<rect x="4" y="2" width="16" height="20" rx="2.5" fill="currentColor"/><rect x="7" y="5" width="10" height="4" rx="1" fill="#fbfbfd"/><circle cx="8.5" cy="13" r="1.2" fill="#fbfbfd"/><circle cx="12" cy="13" r="1.2" fill="#fbfbfd"/><circle cx="15.5" cy="13" r="1.2" fill="#fbfbfd"/><circle cx="8.5" cy="17" r="1.2" fill="#fbfbfd"/><rect x="11" y="15.8" width="5.7" height="2.4" rx="1.2" fill="#fbfbfd"/>',
    expenses: '<path d="M5 2h14v20l-3.5-2-3.5 2-3.5-2L5 22z" fill="currentColor"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4" stroke="#fbfbfd" stroke-width="1.8" fill="none"/>',
    payments: '<rect x="2" y="5" width="20" height="14" rx="2.5" fill="currentColor"/><path d="M2 9.5h20" stroke="#fbfbfd" stroke-width="2.2"/><rect x="5" y="13.5" width="5" height="2" rx="1" fill="#fbfbfd"/>',
    vendors: '<path d="M2 6h12v10H2zM14 9h4.5l3.5 4v3h-8z" fill="currentColor"/><circle cx="6" cy="17.5" r="2.3" fill="currentColor" stroke="#fbfbfd" stroke-width="1.4"/><circle cx="17.5" cy="17.5" r="2.3" fill="currentColor" stroke="#fbfbfd" stroke-width="1.4"/>',
    reports: '<path d="M3 21h18" stroke="currentColor" stroke-width="2"/><rect x="4" y="12" width="3.2" height="7" fill="currentColor"/><rect x="9" y="8" width="3.2" height="11" fill="currentColor"/><rect x="14" y="10" width="3.2" height="9" fill="currentColor"/><path d="M4 9l5-4 5 3 6-5" stroke="currentColor" stroke-width="1.8" fill="none"/>',
    settings: '<path d="M10.3 2h3.4l.5 2.6 1.8.8 2.2-1.5 2.4 2.4-1.5 2.2.8 1.8 2.6.5v3.4l-2.6.5-.8 1.8 1.5 2.2-2.4 2.4-2.2-1.5-1.8.8-.5 2.6h-3.4l-.5-2.6-1.8-.8-2.2 1.5-2.4-2.4 1.5-2.2-.8-1.8L2 13.7v-3.4l2.6-.5.8-1.8-1.5-2.2 2.4-2.4 2.2 1.5 1.8-.8z" fill="currentColor"/><circle cx="12" cy="12" r="3.2" fill="#fbfbfd"/>',
    doc: '<path d="M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 13h8M8 17h5" stroke="currentColor" stroke-width="1.8"/>',
    search: '<circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="m16 16 4.5 4.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>',
    plus: '<path d="M12 4v16M4 12h16" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
    plusC: '<circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M12 7v10M7 12h10" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>',
    plusO: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    user: '<circle cx="12" cy="12" r="9.5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="10" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6.5 18.5c1.3-2 3.2-3 5.5-3s4.2 1 5.5 3" fill="none" stroke="currentColor" stroke-width="2"/>',
    back: '<path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
    pen: '<path d="M4 20h4L19 9l-4-4L4 16z" fill="currentColor"/>',
    filter: '<path d="M4 7h16M7 12h10M10 17h4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" stroke-width="2"/>',
    chevL: '<path d="M14 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
    chevR: '<path d="M10 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
    star: '<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z" fill="currentColor"/>',
  };
  const ic = (n, cls = 'i') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[n]}</svg>`;

  /* ---------------- helpers ---------------- */
  const pd = (s) => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); };
  const today = () => GT.iso(new Date());
  const fmtD = (s) => { if (!s) return ''; const d = pd(s); return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`; };
  const fmtLong = (s) => pd(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const client = (id) => db.get('clients', id);
  const vendor = (id) => db.get('vendors', id);
  const clientName = (doc) => { const c = client(doc.clientId); return c ? (c.company || c.name) : (doc.request ? doc.request.name : 'No client'); };

  function dueDate(doc) {
    const m = /(\d+)/.exec(doc.terms || '');
    const d = pd(doc.date);
    if (/net/i.test(doc.terms) && m) d.setDate(d.getDate() + Number(m[1]));
    return GT.iso(d);
  }
  const paidFor = (inv) => db.all('payments').filter((p) => p.invoiceId === inv.id).reduce((s, p) => s + Number(p.amount || 0), 0);
  function invState(inv) {
    const t = totals(inv).total, paid = paidFor(inv), bal = Math.max(0, t - paid);
    let st;
    if (inv.status === 'Draft') st = 'Draft';
    else if (t > 0 && bal <= 0.005) st = 'Paid';
    else if (dueDate(inv) < today()) st = 'Overdue';
    else if (paid > 0) st = 'Partial';
    else st = 'Sent';
    let label = st;
    if (st === 'Sent') label = dueDate(inv) === today() ? 'Due Today' : 'Due ' + fmtLong(dueDate(inv));
    if (st === 'Partial') label = 'Part paid';
    return { total: t, paid, bal, st, label };
  }
  const chip = (st, label) => `<span class="st st-${esc(String(st).replace(/\s+/g, '-'))}">${esc(label || st)}</span>`;

  function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 2200); }

  /* ---------------- modal ---------------- */
  const modalEl = $('#modal');
  function modal(title, body, { wide = false, onOpen } = {}) {
    modalEl.innerHTML = `<div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><h3>${esc(title)}<button type="button" data-close aria-label="Close">×</button></h3>${body}</div>`;
    modalEl.hidden = false;
    const m = $('.modal', modalEl);
    const first = m.querySelector('input:not([type=hidden]),select,textarea');
    if (first) setTimeout(() => first.focus(), 30);
    if (onOpen) onOpen(m);
    return m;
  }
  function closeModal() { modalEl.hidden = true; modalEl.innerHTML = ''; }
  modalEl.addEventListener('mousedown', (e) => { if (e.target === modalEl) closeModal(); });
  modalEl.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modalEl.hidden) closeModal(); });

  function field(f, v) {
    const val = v ?? f.default ?? '';
    const req = f.required ? 'required' : '';
    let input;
    if (f.type === 'select') input = `<select name="${f.name}" ${req}>${(typeof f.options === 'function' ? f.options() : f.options).map((o) => { const [ov, ol] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(ov)}" ${String(ov) === String(val) ? 'selected' : ''}>${esc(ol)}</option>`; }).join('')}</select>`;
    else if (f.type === 'textarea') input = `<textarea name="${f.name}" rows="${f.rows || 3}" ${req}>${esc(val)}</textarea>`;
    else input = `<input name="${f.name}" type="${f.type || 'text'}" value="${esc(val)}" ${f.step ? `step="${f.step}"` : ''} ${f.min != null ? `min="${f.min}"` : ''} placeholder="${esc(f.placeholder || '')}" ${req}>`;
    return `<label class="fld">${esc(f.label)}${input}</label>`;
  }
  function formModal(title, fields, rec, onSave, { onDelete, extraLeft = '' } = {}) {
    const rows = [];
    for (let i = 0; i < fields.length; i++) {
      const f = fields[i];
      if (f.half && fields[i + 1] && fields[i + 1].half) { rows.push(`<div class="fld-row">${field(f, rec[f.name])}${field(fields[i + 1], rec[fields[i + 1].name])}</div>`); i++; }
      else rows.push(field(f, rec[f.name]));
    }
    const m = modal(title, `<form novalidate>${rows.join('')}<div class="modal-foot">${onDelete ? '<button type="button" class="ghost danger left" data-del>Delete</button>' : extraLeft}<button type="button" class="ghost" data-close>Cancel</button><button class="pill-btn solid" type="submit">Save</button></div></form>`);
    const form = $('form', m);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;
      form.querySelectorAll('[required]').forEach((el) => { const bad = !el.value.trim(); el.style.borderColor = bad ? 'var(--red)' : ''; if (bad) ok = false; });
      if (!ok) return;
      const data = Object.fromEntries(new FormData(form));
      fields.forEach((f) => { if (f.type === 'number') data[f.name] = Number(data[f.name]) || 0; });
      onSave(data); closeModal();
    });
    if (onDelete) $('[data-del]', m).addEventListener('click', () => { if (confirm('Delete this record? This cannot be undone.')) { onDelete(); closeModal(); } });
    return m;
  }

  /* ---------------- shell ---------------- */
  const NAV = [
    ['overview', 'Business overview'], ['clients', 'Clients'], ['procurement', 'Procurement'], ['invoices', 'Invoices'],
    ['quotations', 'Quotations'], ['expenses', 'Expenses'], ['payments', 'Payments'], ['vendors', 'Vendors'],
    ['reports', 'Reports'], ['settings', 'Staff & settings'],
  ];
  function renderNav(active) {
    const newReq = db.all('quotations').filter((q) => q.status === 'Request').length;
    const newEnq = db.all('enquiries').filter((q) => q.status === 'New').length;
    const badge = { quotations: newReq, clients: newEnq };
    $('#sideNav').innerHTML = NAV.filter(([k]) => canSee(k)).map(([k, l]) => `<a href="#/${k}" class="${k === active ? 'active' : ''}" title="${l}">${ic(k)}<span>${l}</span>${badge[k] ? `<span class="badge">${badge[k]}</span>` : ''}</a>`).join('');
  }
  const PAGE_COL = { clients: 'clients', procurement: 'procurement', invoices: 'invoices', quotations: 'quotations', expenses: 'expenses', payments: 'payments', vendors: 'vendors' };
  function canSee(page) {
    if (page === 'overview') return true;
    if (page === 'reports') return GT.can('reports');
    if (page === 'settings') return GT.can('settings');
    return GT.can('read', PAGE_COL[page]);
  }
  function head(title) {
    const u = GT.user || {};
    return `<div class="page-head"><h1>${esc(title)}</h1><div class="head-tools"><button class="round" data-act="search" aria-label="Search">${ic('search')}</button><button class="staff-pill" data-act="me" title="${esc(u.name)} — ${esc(u.role)}">${ic('star', 'i" style="width:15px;height:15px')}${esc(String(u.role || 'Staff').toUpperCase())}</button></div></div>`;
  }
  const FAB_COL = { 'new-invoices': 'invoices', 'new-quotations': 'quotations', 'add-clients': 'clients', 'add-vendors': 'vendors', 'add-procurement': 'procurement', 'add-expenses': 'expenses', 'add-payments': 'payments' };
  function fab(label, act) { if (FAB_COL[act] && !GT.can('write', FAB_COL[act])) return ''; return `<div class="fab"><button data-act="${act}">${ic('plus')}${esc(label)}</button></div>`; }

  /* ---------------- router ---------------- */
  let ED = null; // editor working state
  function route() {
    const parts = (location.hash.replace(/^#\/?/, '') || 'overview').split('/');
    const [page, id] = parts;
    if (ED && ED.dirty && !(page === ED.kind && (id === ED.doc.id || (id === 'new' && !ED.saved)))) {
      if (!confirm('You have unsaved changes. Leave without saving?')) { history.replaceState(null, '', ED.url); return; }
    }
    if (!(page === (ED && ED.kind) && id)) ED = null;
    if (!canSee(page)) { location.replace('#/overview'); return; }
    renderNav(page);
    window.scrollTo(0, 0);
    if ((page === 'invoices' || page === 'quotations') && id) return editor(page, id);
    (PAGES[page] || PAGES.overview)();
  }
  window.addEventListener('hashchange', route);
  window.addEventListener('beforeunload', (e) => { if (ED && ED.dirty) { e.preventDefault(); e.returnValue = ''; } });

  /* ================= OVERVIEW ================= */
  const PAGES = {};
  PAGES.overview = function () {
    const now = new Date(), ym = GT.iso(now).slice(0, 7);
    const invs = db.all('invoices').map((i) => ({ i, s: invState(i) }));
    const collected = db.all('payments').filter((p) => p.date.startsWith(ym)).reduce((s, p) => s + p.amount, 0);
    const outstanding = invs.filter((x) => x.s.st !== 'Draft').reduce((s, x) => s + x.s.bal, 0);
    const overdue = invs.filter((x) => x.s.st === 'Overdue');
    const exp = db.all('expenses').filter((e) => e.date.startsWith(ym)).reduce((s, e) => s + e.amount, 0);
    const proc = db.all('procurement'), open = proc.filter((p) => p.status !== 'Delivered');
    const reqs = db.all('quotations').filter((q) => q.status === 'Request');
    const enq = db.all('enquiries').filter((e) => e.status === 'New');
    main.innerHTML = `<div class="page">${head('Business overview')}
      <div class="kpis">
        <div class="kpi accent"><small>Collected in ${MONTHS[now.getMonth()]}</small><b class="tnum">${moneyShort(collected)}</b><span>from ${db.all('payments').filter((p) => p.date.startsWith(ym)).length} payment(s)</span></div>
        <div class="kpi"><small>Outstanding receivables</small><b class="tnum">${moneyShort(outstanding)}</b><span style="color:${overdue.length ? 'var(--red)' : ''}">${overdue.length} overdue invoice(s)</span></div>
        <div class="kpi"><small>Expenses in ${MONTHS[now.getMonth()]}</small><b class="tnum">${moneyShort(exp)}</b><span>${db.all('expenses').filter((e) => e.date.startsWith(ym)).length} entries</span></div>
        <div class="kpi"><small>Open procurement</small><b class="tnum">${open.length}</b><span>${moneyShort(open.reduce((s, p) => s + p.value, 0))} in progress</span></div>
      </div>
      <div class="grid2">
        <div class="panel"><h3>Recent invoices <a href="#/invoices">View all</a></h3>
          ${invs.slice(0, 5).map(({ i, s }) => `<div class="mini-row" data-go="#/invoices/${i.id}"><div>${esc(clientName(i))}<small>${esc(i.number)} · ${fmtD(i.date)}</small></div><div style="text-align:right"><b class="tnum">${money(s.total)}</b><br>${chip(s.st === 'Sent' ? 'due' : s.st, s.label)}</div></div>`).join('') || '<p class="empty">No invoices yet</p>'}
        </div>
        <div class="panel"><h3>Website requests &amp; enquiries <a href="#/quotations">Quotations</a></h3>
          ${reqs.map((q) => `<div class="mini-row" data-go="#/quotations/${q.id}"><div>${esc(q.request.name)}<small>Quotation request · ${esc(q.request.category || '')} · qty ${esc(q.request.qty)}</small></div>${chip('Request')}</div>`).join('')}
          ${enq.map((e) => `<div class="mini-row" data-enq="${e.id}"><div>${esc(e.name)}<small>Enquiry · ${esc(e.subject || e.message.slice(0, 40))}</small></div>${chip('New')}</div>`).join('')}
          ${!reqs.length && !enq.length ? '<p style="color:var(--muted);font-size:14px;padding:10px 0">Nothing new from the website.</p>' : ''}
        </div>
        <div class="panel"><h3>Procurement pipeline <a href="#/procurement">Open</a></h3>
          ${['Sourcing', 'Ordered', 'In transit', 'Delivered'].map((st) => { const n = proc.filter((p) => p.status === st); return `<div class="mini-row" data-go="#/procurement"><div>${chip(st)}<small style="margin-top:4px">${n.map((p) => esc(p.item)).slice(0, 2).join(', ') || '—'}</small></div><b class="tnum">${n.length}</b></div>`; }).join('')}
        </div>
        <div class="panel"><h3>Quick actions</h3>
          ${GT.can("write", "invoices") ? `<div class="mini-row" data-go="#/invoices/new"><div>Create an invoice<small>Branded, printable, saves to records</small></div>${ic('plusO', 'i" style="color:var(--orange)')}</div>` : ""}
          ${GT.can("write", "quotations") ? `<div class="mini-row" data-go="#/quotations/new"><div>Create a quotation<small>Convert to invoice when accepted</small></div>${ic('plusO', 'i" style="color:var(--orange)')}</div>` : ""}
          ${GT.can("write", "payments") ? `<div class="mini-row" data-act="pay"><div>Record a payment<small>Updates invoice balance</small></div>${ic('plusO', 'i" style="color:var(--orange)')}</div>` : ""}
          ${GT.can("write", "expenses") ? `<div class="mini-row" data-act="exp"><div>Log an expense<small>Freight, clearing, office…</small></div>${ic('plusO', 'i" style="color:var(--orange)')}</div>` : ""}
        </div>
      </div></div>`;
  };

  /* ================= INVOICES / QUOTATIONS LISTS ================= */
  const LIST = { invoices: { mode: 'month', ym: GT.iso(new Date()).slice(0, 7), filter: 'All' }, quotations: { mode: 'all', ym: GT.iso(new Date()).slice(0, 7), filter: 'All' } };
  function docList(kind) {
    const L = LIST[kind];
    const isInv = kind === 'invoices';
    const [y, m] = L.ym.split('-').map(Number);
    let docs = db.all(kind).slice().sort((a, b) => (b.date + b.number).localeCompare(a.date + a.number));
    if (L.mode === 'month') docs = docs.filter((d) => d.date.startsWith(L.ym));
    if (L.mode === 'year') docs = docs.filter((d) => d.date.startsWith(String(y)));
    const rows = docs.map((d) => {
      if (isInv) { const s = invState(d); return { d, s, st: s.st, label: s.label, chipSt: s.st === 'Sent' ? 'due' : s.st }; }
      return { d, s: { total: totals(d).total }, st: d.status, label: d.status === 'Request' ? 'Website request' : d.status, chipSt: d.status };
    });
    const FILTERS = isInv ? ['All', 'Unpaid', 'Overdue', 'Paid', 'Draft'] : ['All', 'Request', 'Draft', 'Sent', 'Accepted', 'Declined'];
    const shown = rows.filter((r) => L.filter === 'All' || (L.filter === 'Unpaid' ? ['Sent', 'Partial', 'Overdue'].includes(r.st) : r.st === L.filter));
    const total = shown.reduce((s, r) => s + r.s.total, 0);
    const second = isInv ? shown.reduce((s, r) => s + (r.st === 'Draft' ? 0 : r.s.bal), 0) : shown.filter((r) => r.st === 'Accepted').reduce((s, r) => s + r.s.total, 0);
    const period = L.mode === 'month' ? `${MONTHS[m - 1]} ${y}` : L.mode === 'year' ? String(y) : 'All time';
    main.innerHTML = `<div class="page">${head(isInv ? 'Invoices' : 'Quotations')}
      <div style="text-align:center"><div class="month-pill">${L.mode !== 'all' ? `<button data-act="prev" aria-label="Previous">${ic('chevL', 'i" style="width:16px;height:16px')}</button>` : ''}<span>${ic('cal', 'i" style="width:18px;height:18px')}${period}</span>${L.mode !== 'all' ? `<button data-act="next" aria-label="Next">${ic('chevR', 'i" style="width:16px;height:16px')}</button>` : ''}</div></div>
      <div class="totals-hero"><div class="lbl">Total</div><div class="big tnum">${moneyShort(total)}</div>
        <div class="due">${isInv ? `Balance Due: <b class="tnum">${moneyShort(second)}</b>` : `Accepted: <b class="tnum" style="color:var(--green)">${moneyShort(second)}</b>`}</div></div>
      <div class="list-tools">
        <div class="seg">${['month', 'year', 'all'].map((md) => `<button data-mode="${md}" class="${L.mode === md ? 'on' : ''}">${md === 'all' ? 'All time' : md[0].toUpperCase() + md.slice(1)}</button>`).join('')}</div>
        <div class="seg">${FILTERS.map((f) => `<button data-filter="${f}" class="${L.filter === f ? 'on' : ''}">${f}</button>`).join('')}</div>
      </div>
      <div class="rows">${shown.map((r) => `<div class="row-card" data-go="#/${kind}/${r.d.id}" tabindex="0"><span class="row-ico">${ic('doc')}</span><div class="row-main"><b>${esc(clientName(r.d))}</b><small>${esc(r.d.number)}${r.d.source ? ' · from website' : ''}</small></div><div class="row-end"><b class="tnum">${money(r.s.total)}</b>${chip(r.chipSt, r.label)}</div></div>`).join('') || `<div class="empty">No ${isInv ? 'invoices' : 'quotations'} for ${period.toLowerCase()}.</div>`}</div>
    </div>${fab(isInv ? 'CREATE INVOICE' : 'CREATE QUOTATION', 'new-' + kind)}`;
  }
  PAGES.invoices = () => docList('invoices');
  PAGES.quotations = () => docList('quotations');

  /* ================= EDITOR ================= */
  function blankDoc(kind) {
    const s = db.settings();
    return { id: '', number: db.nextNumber(kind), clientId: '', date: today(), terms: kind === 'invoices' ? 'Due on receipt' : 'Valid 30 days', status: kind === 'invoices' ? 'Sent' : 'Draft', items: [], discount: { type: 'percent', value: 0 }, taxOn: false, taxRate: s.taxRate, notes: s.defaultNotes || '' };
  }
  function editor(kind, id, fresh) {
    if (!ED || ED.kind !== kind || (id !== 'new' && ED.doc.id !== id) || fresh) {
      const existing = id !== 'new' && db.get(kind, id);
      if (id !== 'new' && !existing) { location.hash = '#/' + kind; return; }
      ED = { kind, doc: existing ? clone(existing) : blankDoc(kind), dirty: false, saved: !!existing, url: location.hash };
    }
    const { doc } = ED;
    const isInv = kind === 'invoices';
    const t = totals(doc);
    const c = client(doc.clientId);
    const st = isInv && ED.saved ? invState(db.get(kind, doc.id)) : null;
    const pays = isInv && ED.saved ? db.all('payments').filter((p) => p.invoiceId === doc.id) : [];
    main.innerHTML = `<div class="ed">
      <div class="ed-top"><a class="back" href="#/${kind}" aria-label="Back">${ic('back', 'i" style="width:18px;height:18px')}</a>
        <div class="ed-actions"><button class="pill-btn" data-act="preview">Preview</button><button class="pill-btn" data-act="save" ${ED.dirty || !ED.saved ? '' : 'disabled'}>Save</button></div></div>
      ${doc.request ? `<div class="card req-card"><div class="card-lbl" style="color:var(--orange-d);font-weight:600">Website quotation request · ${fmtD(doc.date)}</div>
        <dl><dt>Name</dt><dd>${esc(doc.request.name)}</dd><dt>Email</dt><dd>${esc(doc.request.email)}</dd><dt>Phone</dt><dd>${esc(doc.request.phone)}</dd><dt>Delivery city</dt><dd>${esc(doc.request.city || '—')}</dd><dt>Category</dt><dd>${esc(doc.request.category)} · ${esc(doc.request.condition)}</dd><dt>Quantity</dt><dd>${esc(doc.request.qty)}</dd><dt>Item</dt><dd>${esc(doc.request.item)}</dd></dl>
        ${!doc.clientId ? '<button class="ghost" data-act="req-client" style="background:#fff">Create client from request</button>' : ''} <span style="font-size:13px;color:var(--muted)">Price the item below, then set status to Sent.</span></div>` : ''}
      <div class="card"><div class="num-line"><h2>${esc(doc.number)} <button data-act="number" aria-label="Edit number">${ic('pen')}</button></h2><span class="terms-chip">${esc(doc.terms)}</span></div>
        <div class="sub-line"><button class="link" data-act="details">Details</button><span>${st ? chip(st.st === 'Sent' ? 'due' : st.st, st.label) + ' &nbsp;' : isInv ? '' : chip(doc.status) + ' &nbsp;'}${fmtD(doc.date)}</span></div></div>
      <div class="card"><div class="card-lbl">Client</div>
        ${c ? `<div class="client-box" data-act="client"><span class="row-ico">${ic('user', 'i" style="width:22px;height:22px')}</span><div class="row-main"><b>${esc(c.company || c.name)}</b><small>${esc([c.name !== c.company ? c.name : '', c.email].filter(Boolean).join(' · '))}</small></div><span class="link">Change</span></div>` : `<button class="bar-btn" data-act="client">${ic('user')}Add client</button>`}</div>
      <div class="card"><div class="card-lbl">Items</div>
        ${doc.items.map((it, i) => `<div class="item-line" data-item="${i}"><b>${esc(it.desc)}</b><small class="tnum">${Number(it.qty)} × ${money(it.rate)}</small><span class="amt tnum">${money(it.qty * it.rate)}</span></div>`).join('')}
        <div class="sum-line strong"><span>Subtotal</span><span class="tnum">${money(t.subtotal)}</span></div>
        <button class="bar-btn" data-act="item">${ic('plusO')}Add item</button></div>
      <div class="card">
        <div class="sum-line"><button class="add" data-act="discount">${ic('plusC')}Discount${doc.discount.value ? ` (${doc.discount.type === 'percent' ? doc.discount.value + '%' : money(doc.discount.value)})` : ''}</button><span class="val tnum">${t.discount ? '−' : ''}${money(t.discount)}</span></div>
        <div class="sum-line"><button class="add" data-act="tax">${ic('plusC')}${doc.taxOn ? 'VAT' : 'Add VAT'} (${Number(doc.taxRate)}%)</button><span class="val tnum">${money(t.tax)}</span></div>
        <div class="divider"></div>
        <div class="sum-line strong"><span>Total</span><span class="tnum">${money(t.total)}</span></div>
        ${st ? `<div class="sum-line"><span>Paid</span><span class="val tnum">${money(st.paid)}</span></div><div class="sum-line strong"><span>Balance due</span><span class="tnum" style="color:${st.bal > 0 ? 'var(--red)' : 'var(--green)'}">${money(st.bal)}</span></div>` : ''}
      </div>
      <div class="card"><div class="card-lbl" style="color:var(--ink)">Notes</div><textarea class="notes" data-notes placeholder="Comments will appear at the bottom of your ${isInv ? 'invoice' : 'quotation'}">${esc(doc.notes)}</textarea></div>
      ${pays.length ? `<div class="card"><div class="card-lbl">Payments</div><div class="pay-list">${pays.map((p) => `<div><span>${fmtD(p.date)} · ${esc(p.method)} ${p.ref ? '· ' + esc(p.ref) : ''}</span><b class="tnum">${money(p.amount)}</b></div>`).join('')}</div></div>` : ''}
      ${ED.saved ? `<div class="ed-foot">
        ${isInv ? (st.bal > 0 && st.st !== 'Draft' ? '<button class="ghost" data-act="record-pay">Record payment</button>' : '') + (doc.status === 'Draft' ? '<button class="ghost" data-act="mark-sent">Mark as sent</button>' : '') : '<button class="ghost" data-act="convert">Convert to invoice</button>'}
        <button class="ghost" data-act="duplicate">Duplicate</button><button class="ghost danger" data-act="delete">Delete</button></div>` : ''}
    </div>`;
  }
  function dirty() { ED.dirty = true; editor(ED.kind, ED.doc.id || 'new'); }

  function saveDoc() {
    const { kind, doc } = ED;
    if (!doc.items.length) { toast('Add at least one item first'); return false; }
    if (ED.saved) db.update(kind, doc.id, clone(doc));
    else { const rec = db.insert(kind, clone(doc)); doc.id = rec.id; ED.saved = true; }
    ED.dirty = false; ED.url = `#/${kind}/${doc.id}`;
    history.replaceState(null, '', ED.url);
    renderNav(kind);
    editor(kind, doc.id); toast(kind === 'invoices' ? 'Invoice saved' : 'Quotation saved');
    return true;
  }

  function itemModal(i) {
    const it = i != null ? ED.doc.items[i] : { desc: '', qty: 1, rate: 0 };
    const past = [...new Set([].concat(...db.all('invoices').map((d) => d.items), ...db.all('quotations').map((d) => d.items)).map((x) => x.desc))].slice(0, 40);
    const m = formModal(i != null ? 'Edit item' : 'Add item', [
      { name: 'desc', label: 'Description', required: true, placeholder: 'e.g. Reinforcement steel bars, 16mm (tonne)' },
      { name: 'qty', label: 'Quantity', type: 'number', min: 0, step: 'any', half: true },
      { name: 'rate', label: `Unit price (${db.settings().currency})`, type: 'number', min: 0, step: 'any', half: true },
    ], it, (d) => { if (i != null) ED.doc.items[i] = d; else ED.doc.items.push(d); dirty(); },
    i != null ? { onDelete: () => { ED.doc.items.splice(i, 1); dirty(); } } : {});
    const inp = $('input[name=desc]', m);
    inp.setAttribute('list', 'pastItems');
    m.insertAdjacentHTML('beforeend', `<datalist id="pastItems">${past.map((p) => `<option value="${esc(p)}">`).join('')}</datalist>`);
    const amt = document.createElement('div'); amt.className = 'sum-line strong'; amt.style.margin = '0 0 6px';
    const upd = () => { amt.innerHTML = `<span>Amount</span><span class="tnum">${money((Number($('[name=qty]', m).value) || 0) * (Number($('[name=rate]', m).value) || 0))}</span>`; };
    $('.modal-foot', m).before(amt); upd(); m.addEventListener('input', upd);
  }

  function clientPicker(onPick) {
    const list = db.all('clients');
    const m = modal('Select client', `<div class="search" style="background:#f4f4f7;margin-bottom:10px">${ic('search', 'i')}<input placeholder="Search clients" data-q></div>
      <div class="pick-list">${list.map((c) => `<button class="pick" data-id="${c.id}"><span class="row-ico">${ic('user', 'i" style="width:20px;height:20px')}</span><span><b>${esc(c.company || c.name)}</b><small>${esc(c.name)} · ${esc(c.email || c.phone || '')}</small></span></button>`).join('')}</div>
      <button class="bar-btn" style="height:44px" data-new>${ic('plusO')}New client</button>`);
    $('[data-q]', m).addEventListener('input', (e) => { const q = e.target.value.toLowerCase(); m.querySelectorAll('.pick').forEach((p) => { p.hidden = !p.textContent.toLowerCase().includes(q); }); });
    m.addEventListener('click', (e) => {
      const p = e.target.closest('.pick'); if (p) { closeModal(); onPick(p.dataset.id); }
      if (e.target.closest('[data-new]')) clientForm({}, (c) => onPick(c.id));
    });
  }
  const CLIENT_FIELDS = [
    { name: 'company', label: 'Company', placeholder: 'Company or organisation' },
    { name: 'name', label: 'Contact name', required: true },
    { name: 'email', label: 'Email', type: 'email', half: true }, { name: 'phone', label: 'Phone', type: 'tel', half: true },
    { name: 'address', label: 'Address', type: 'textarea', rows: 2 },
  ];
  function clientForm(rec, after) {
    formModal(rec.id ? 'Edit client' : 'New client', CLIENT_FIELDS, rec, (d) => {
      const saved = rec.id ? db.update('clients', rec.id, d) : db.insert('clients', d);
      toast('Client saved'); if (after) after(saved); else route();
    }, rec.id ? { onDelete: () => { db.remove('clients', rec.id); route(); } } : {});
  }

  function previewDoc() {
    const { kind, doc } = ED;
    const m = modal(kind === 'invoices' ? 'Invoice preview' : 'Quotation preview', `
      <div class="modal-foot" style="margin:-6px 0 14px">${ED.dirty || !ED.saved ? '<span class="left" style="font-size:13px;color:var(--muted)">Unsaved changes — saving before you print is recommended.</span>' : ''}<button class="ghost" data-close>Close</button><button class="pill-btn solid" data-print>Print / Save as PDF</button></div>
      <div class="preview-scroll"><div class="doc-fit">${docHTML(kind, doc)}</div></div>`, { wide: true });
    const fit = $('.doc-fit', m), d = $('.doc', m);
    const scale = Math.min(1, (fit.clientWidth) / 794);
    d.style.transform = `scale(${scale})`; fit.style.height = d.offsetHeight * scale + 'px';
    $('[data-print]', m).addEventListener('click', () => printDoc(kind, doc));
  }
  function printDoc(kind, doc) {
    if (ED && ED.dirty) saveDoc();
    $('#printRoot').innerHTML = docHTML(kind, doc);
    const old = document.title; document.title = `${doc.number} — ${clientName(doc)}`;
    setTimeout(() => { window.print(); document.title = old; }, 150);
  }

  function docHTML(kind, doc) {
    const s = db.settings(); const t = totals(doc); const c = client(doc.clientId);
    const isInv = kind === 'invoices';
    const st = isInv && doc.id && db.get('invoices', doc.id) ? invState(doc) : null;
    const billTo = c ? [c.company, c.name !== c.company ? c.name : '', c.address, c.email, c.phone] : doc.request ? [doc.request.name, doc.request.email, doc.request.phone, doc.request.city] : ['—'];
    return `<div class="doc">
      <img class="doc-mark" src="../assets/mark.svg" alt="">
      <div class="doc-head"><img src="../assets/logo-black.svg" alt="Gorpat Trading Limited"><div class="doc-office"><em>HEAD OFFICE:</em>${COMPANY.headOffice.map(esc).join('<br>')}</div></div>
      <div class="doc-band">TRADING AND PROCUREMENT SERVICES</div>
      <div class="doc-body">
        ${st && st.st === 'Paid' ? '<div class="doc-paid">PAID</div>' : ''}
        <div class="doc-title"><h2>${isInv ? 'INVOICE' : 'QUOTATION'}</h2><div class="meta">
          <div><b>${isInv ? 'Invoice no.' : 'Quote no.'}</b> ${esc(doc.number)}</div>
          <div><b>Date</b> ${fmtLong(doc.date)}</div>
          <div><b>${isInv ? 'Due' : 'Validity'}</b> ${isInv ? (doc.terms === 'Due on receipt' ? 'On receipt' : fmtLong(dueDate(doc))) : esc(doc.terms)}</div></div></div>
        <div class="doc-parties">
          <div><h6>${isInv ? 'Bill to' : 'Prepared for'}</h6>${billTo.filter(Boolean).map(esc).join('<br>')}</div>
          <div><h6>From</h6>${esc(COMPANY.name)}<br>${esc(COMPANY.headOffice.slice(0, 2).join(', '))}<br>${esc(COMPANY.headOffice.slice(2).join(', '))}<br>${esc(COMPANY.email)}</div>
        </div>
        <table><thead><tr><th style="width:36px">#</th><th>Description</th><th class="r">Qty</th><th class="r">Unit price</th><th class="r">Amount</th></tr></thead>
          <tbody>${doc.items.map((it, i) => `<tr><td>${i + 1}</td><td>${esc(it.desc)}</td><td class="r tnum">${Number(it.qty)}</td><td class="r tnum">${money(it.rate)}</td><td class="r tnum">${money(it.qty * it.rate)}</td></tr>`).join('') || '<tr><td colspan="5" style="color:#999">No items</td></tr>'}</tbody></table>
        <div class="doc-sum">
          <div class="notes-box">
            ${isInv ? `<h6>Payment details</h6>${esc(s.bank.name)}<br>${esc(s.bank.account)}<br>Account no. ${esc(s.bank.number)}<br><br>` : ''}
            ${doc.notes ? `<h6>Notes</h6>${esc(doc.notes).replace(/\n/g, '<br>')}` : ''}
          </div>
          <div class="tot tnum">
            <div><span>Subtotal</span><span>${money(t.subtotal)}</span></div>
            ${t.discount ? `<div><span>Discount${doc.discount.type === 'percent' ? ` (${doc.discount.value}%)` : ''}</span><span>−${money(t.discount)}</span></div>` : ''}
            ${doc.taxOn ? `<div><span>VAT (${Number(doc.taxRate)}%)</span><span>${money(t.tax)}</span></div>` : ''}
            <div class="grand"><span>Total</span><span>${money(t.total)}</span></div>
            ${st && st.paid ? `<div><span>Paid</span><span>${money(st.paid)}</span></div><div class="bal"><span>Balance due</span><span>${money(st.bal)}</span></div>` : ''}
          </div>
        </div>
      </div>
      <div class="doc-foot">
        <div class="tel">Tel: ${COMPANY.phones.join('<br>')}</div>
        <div class="us"><em>USA LIAISON OFFICE:</em>${COMPANY.usOffice.join('<br>')}<br>Phone: ${COMPANY.usPhone}</div>
        <div class="stripe"></div><div class="stripe-o"></div>
        <div class="black">Email: ${esc(COMPANY.email)}</div>
      </div>
    </div>`;
  }

  function paymentForm(rec, after) {
    const unpaid = db.all('invoices').filter((i) => { const s = invState(i); return s.st !== 'Draft' && (s.bal > 0 || i.id === rec.invoiceId); });
    const def = rec.invoiceId ? db.get('invoices', rec.invoiceId) : unpaid[0];
    if (!def) { toast('No unpaid invoices'); return; }
    const r = Object.assign({ invoiceId: def.id, date: today(), amount: rec.id ? rec.amount : invState(def).bal, method: 'Bank transfer', ref: '' }, rec);
    const m = formModal(rec.id ? 'Edit payment' : 'Record payment', [
      { name: 'invoiceId', label: 'Invoice', type: 'select', options: () => unpaid.map((i) => [i.id, `${i.number} — ${clientName(i)} (bal ${moneyShort(invState(i).bal)})`]) },
      { name: 'amount', label: 'Amount', type: 'number', min: 0, step: 'any', required: true, half: true }, { name: 'date', label: 'Date', type: 'date', half: true },
      { name: 'method', label: 'Method', type: 'select', options: ['Bank transfer', 'Cash', 'Cheque', 'POS / card', 'Wire (USD)'], half: true }, { name: 'ref', label: 'Reference', half: true },
    ], r, (d) => { if (rec.id) db.update('payments', rec.id, d); else db.insert('payments', d); toast('Payment recorded'); (after || route)(); },
    rec.id ? { onDelete: () => { db.remove('payments', rec.id); route(); } } : {});
    if (!rec.id) $('[name=invoiceId]', m).addEventListener('change', (e) => { $('[name=amount]', m).value = invState(db.get('invoices', e.target.value)).bal.toFixed(2); });
  }

  /* ================= GENERIC TABLE PAGES ================= */
  const TBL = {};
  function tablePage({ key, title, col, columns, fields, addLabel, rows, extraTop = '', tabs = '' }) {
    const q = (TBL[key] || '').toLowerCase();
    const list = (rows || db.all(col)).filter((r) => !q || JSON.stringify(r).toLowerCase().includes(q) || columns.some((c) => String(c.get(r)).toLowerCase().includes(q)));
    main.innerHTML = `<div class="page">${head(title)}${extraTop}
      <div class="toolbar">${tabs}<label class="search">${ic('search')}<input placeholder="Search ${esc(title.toLowerCase())}" value="${esc(TBL[key] || '')}" data-tblq="${key}"></label></div>
      <div class="table-wrap"><table><thead><tr>${columns.map((c) => `<th class="${c.r ? 'r' : ''}">${c.label}</th>`).join('')}</tr></thead>
      <tbody>${list.map((r) => `<tr data-edit="${col}:${r.id}">${columns.map((c) => `<td class="${c.r ? 'r tnum' : ''}">${c.html ? c.get(r) : esc(c.get(r))}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${columns.length}" style="text-align:center;color:var(--muted);padding:40px">Nothing here yet.</td></tr>`}</tbody></table></div>
    </div>${addLabel ? fab(addLabel, 'add-' + col) : ''}`;
    const inp = $(`[data-tblq="${key}"]`); if (TBL[key]) { inp.focus(); inp.setSelectionRange(99, 99); }
  }
  const FIELDS = {
    vendors: [{ name: 'name', label: 'Vendor name', required: true }, { name: 'category', label: 'Category', type: 'select', options: ['Oil & gas materials', 'Industrial equipment', 'Building materials', 'Medical supplies', 'IT & office', 'General merchandise', 'Logistics'] },
      { name: 'contact', label: 'Contact person', half: true }, { name: 'phone', label: 'Phone', half: true }, { name: 'email', label: 'Email', type: 'email' }],
    procurement: [{ name: 'ref', label: 'PO / reference', required: true, half: true }, { name: 'date', label: 'Date', type: 'date', half: true },
      { name: 'item', label: 'Item(s)', required: true },
      { name: 'clientId', label: 'Client', type: 'select', options: () => [['', '—']].concat(db.all('clients').map((c) => [c.id, c.company || c.name])), half: true },
      { name: 'vendorId', label: 'Vendor', type: 'select', options: () => [['', '—']].concat(db.all('vendors').map((v) => [v.id, v.name])), half: true },
      { name: 'category', label: 'Category', type: 'select', options: ['Oil & gas materials', 'Industrial equipment', 'Building materials', 'Medical supplies', 'IT & office', 'General merchandise'], half: true },
      { name: 'status', label: 'Status', type: 'select', options: ['Sourcing', 'Ordered', 'In transit', 'Delivered'], half: true },
      { name: 'qty', label: 'Quantity', type: 'number', min: 0, half: true }, { name: 'value', label: 'Order value', type: 'number', min: 0, step: 'any', half: true }],
    expenses: [{ name: 'desc', label: 'Description', required: true }, { name: 'category', label: 'Category', type: 'select', options: ['Freight & clearing', 'Transport', 'Office', 'Salaries', 'Purchases', 'Utilities', 'Other'], half: true },
      { name: 'vendorId', label: 'Vendor', type: 'select', options: () => [['', '—']].concat(db.all('vendors').map((v) => [v.id, v.name])), half: true },
      { name: 'amount', label: 'Amount', type: 'number', min: 0, step: 'any', required: true, half: true }, { name: 'date', label: 'Date', type: 'date', half: true }],
  };
  function editRecord(col, id) {
    if (col === 'clients') return clientForm(id ? db.get('clients', id) : {});
    if (col === 'payments') return paymentForm(id ? db.get('payments', id) : {});
    if (col === 'enquiries') return enquiryModal(id);
    const rec = id ? db.get(col, id) : { date: today(), status: 'Sourcing', ref: col === 'procurement' ? 'PO-' + (1000 + db.all('procurement').length + 1) : '' };
    formModal((id ? 'Edit ' : 'New ') + ({ vendors: 'vendor', procurement: 'procurement order', expenses: 'expense' }[col]), FIELDS[col], rec, (d) => {
      if (id) db.update(col, id, d); else db.insert(col, d); toast('Saved'); route();
    }, id ? { onDelete: () => { db.remove(col, id); route(); } } : {});
  }

  let clientTab = 'clients';
  PAGES.clients = function () {
    const nNew = db.all('enquiries').filter((e) => e.status === 'New').length;
    const tabs = `<div class="seg tabs"><button data-ctab="clients" class="${clientTab === 'clients' ? 'on' : ''}">Clients</button><button data-ctab="enquiries" class="${clientTab === 'enquiries' ? 'on' : ''}">Enquiries${nNew ? ` (${nNew})` : ''}</button></div>`;
    if (clientTab === 'enquiries') return tablePage({ key: 'enq', title: 'Clients', col: 'enquiries', tabs, columns: [
      { label: 'Date', get: (r) => fmtD(r.date) }, { label: 'Name', get: (r) => r.name }, { label: 'Subject', get: (r) => r.subject || r.message.slice(0, 50) }, { label: 'Email', get: (r) => r.email }, { label: 'Status', get: (r) => chip(r.status), html: true }] });
    tablePage({ key: 'cl', title: 'Clients', col: 'clients', tabs, addLabel: 'ADD CLIENT', columns: [
      { label: 'Company', get: (r) => r.company || '—' }, { label: 'Contact', get: (r) => r.name }, { label: 'Email', get: (r) => r.email }, { label: 'Phone', get: (r) => r.phone },
      { label: 'Invoiced', r: true, get: (r) => money(db.all('invoices').filter((i) => i.clientId === r.id).reduce((s, i) => s + totals(i).total, 0)) },
      { label: 'Balance', r: true, get: (r) => money(db.all('invoices').filter((i) => i.clientId === r.id && i.status !== 'Draft').reduce((s, i) => s + invState(i).bal, 0)) }] });
  };
  function enquiryModal(id) {
    const e = db.get('enquiries', id);
    const m = modal('Client enquiry', `<dl class="req-card" style="display:grid;grid-template-columns:90px 1fr;gap:6px 10px;font-size:14px;padding:14px;border-radius:12px;margin-bottom:14px">
      <dt style="color:var(--muted)">From</dt><dd>${esc(e.name)}</dd><dt style="color:var(--muted)">Email</dt><dd>${esc(e.email)}</dd><dt style="color:var(--muted)">Phone</dt><dd>${esc(e.phone || '—')}</dd>
      <dt style="color:var(--muted)">Date</dt><dd>${fmtLong(e.date)}</dd><dt style="color:var(--muted)">Subject</dt><dd>${esc(e.subject || '—')}</dd><dt style="color:var(--muted)">Message</dt><dd style="white-space:pre-wrap">${esc(e.message)}</dd></dl>
      <div class="modal-foot"><button class="ghost danger left" data-x="del">Delete</button><button class="ghost" data-x="client">Save as client</button>
      <a class="ghost" href="mailto:${esc(e.email)}?subject=${encodeURIComponent('Re: ' + (e.subject || 'Your enquiry'))}" data-x="mail">Reply by email</a><button class="pill-btn solid" data-x="done">${e.status === 'New' ? 'Mark replied' : 'Mark new'}</button></div>`);
    m.addEventListener('click', (ev) => {
      const x = ev.target.closest('[data-x]'); if (!x) return;
      const a = x.dataset.x;
      if (a === 'del') { if (confirm('Delete this enquiry?')) { db.remove('enquiries', id); closeModal(); route(); } }
      if (a === 'done') { db.update('enquiries', id, { status: e.status === 'New' ? 'Replied' : 'New' }); closeModal(); route(); }
      if (a === 'mail') db.update('enquiries', id, { status: 'Replied' });
      if (a === 'client') clientForm({ name: e.name, email: e.email, phone: e.phone }, () => { db.update('enquiries', id, { status: 'Replied' }); route(); });
    });
  }

  PAGES.vendors = () => tablePage({ key: 've', title: 'Vendors', col: 'vendors', addLabel: 'ADD VENDOR', columns: [
    { label: 'Vendor', get: (r) => r.name }, { label: 'Category', get: (r) => r.category }, { label: 'Contact', get: (r) => r.contact }, { label: 'Phone', get: (r) => r.phone },
    { label: 'Orders', r: true, get: (r) => db.all('procurement').filter((p) => p.vendorId === r.id).length }] });

  PAGES.procurement = function () {
    const proc = db.all('procurement');
    const pipe = ['Sourcing', 'Ordered', 'In transit', 'Delivered'].map((s, i) => { const n = proc.filter((p) => p.status === s); return `<div class="pipe p${i + 1}"><small>${s}</small><b class="tnum">${n.length}</b><small class="tnum">${moneyShort(n.reduce((a, p) => a + p.value, 0))}</small></div>`; }).join('');
    tablePage({ key: 'pr', title: 'Procurement', col: 'procurement', addLabel: 'NEW PROCUREMENT ORDER', extraTop: `<div class="pipeline">${pipe}</div>`, columns: [
      { label: 'Ref', get: (r) => r.ref }, { label: 'Date', get: (r) => fmtD(r.date) }, { label: 'Item', get: (r) => r.item }, { label: 'Client', get: (r) => (client(r.clientId) || {}).company || '—' },
      { label: 'Vendor', get: (r) => (vendor(r.vendorId) || {}).name || '—' }, { label: 'Value', r: true, get: (r) => money(r.value) }, { label: 'Status', html: true, get: (r) => chip(r.status) }] });
  };

  PAGES.expenses = function () {
    const ex = db.all('expenses'), ym = today().slice(0, 7);
    const sum = (a) => a.reduce((s, e) => s + e.amount, 0);
    tablePage({ key: 'ex', title: 'Expenses', col: 'expenses', addLabel: 'ADD EXPENSE', rows: ex.slice().sort((a, b) => b.date.localeCompare(a.date)),
      extraTop: `<div class="kpis" style="grid-template-columns:repeat(3,1fr)"><div class="kpi"><small>This month</small><b class="tnum">${moneyShort(sum(ex.filter((e) => e.date.startsWith(ym))))}</b></div><div class="kpi"><small>This year</small><b class="tnum">${moneyShort(sum(ex.filter((e) => e.date.startsWith(ym.slice(0, 4)))))}</b></div><div class="kpi"><small>Entries</small><b class="tnum">${ex.length}</b></div></div>`,
      columns: [{ label: 'Date', get: (r) => fmtD(r.date) }, { label: 'Description', get: (r) => r.desc }, { label: 'Category', get: (r) => r.category }, { label: 'Vendor', get: (r) => (vendor(r.vendorId) || {}).name || '—' }, { label: 'Amount', r: true, get: (r) => money(r.amount) }] });
  };

  PAGES.payments = function () {
    const pays = db.all('payments').slice().sort((a, b) => b.date.localeCompare(a.date));
    const outstanding = db.all('invoices').filter((i) => i.status !== 'Draft').reduce((s, i) => s + invState(i).bal, 0);
    tablePage({ key: 'pa', title: 'Payments', col: 'payments', addLabel: 'RECORD PAYMENT', rows: pays,
      extraTop: `<div class="kpis" style="grid-template-columns:repeat(3,1fr)"><div class="kpi accent"><small>Received (all time)</small><b class="tnum">${moneyShort(pays.reduce((s, p) => s + p.amount, 0))}</b></div><div class="kpi"><small>Outstanding</small><b class="tnum" style="color:var(--red)">${moneyShort(outstanding)}</b></div><div class="kpi"><small>Payments</small><b class="tnum">${pays.length}</b></div></div>`,
      columns: [{ label: 'Date', get: (r) => fmtD(r.date) }, { label: 'Invoice', get: (r) => (db.get('invoices', r.invoiceId) || {}).number || '—' }, { label: 'Client', get: (r) => { const i = db.get('invoices', r.invoiceId); return i ? clientName(i) : '—'; } }, { label: 'Method', get: (r) => r.method }, { label: 'Reference', get: (r) => r.ref }, { label: 'Amount', r: true, get: (r) => money(r.amount) }] });
  };

  /* ================= REPORTS ================= */
  PAGES.reports = function () {
    const now = new Date(); const months = [];
    for (let k = 5; k >= 0; k--) { const d = new Date(now.getFullYear(), now.getMonth() - k, 1); months.push(GT.iso(d).slice(0, 7)); }
    const rev = months.map((m) => db.all('payments').filter((p) => p.date.startsWith(m)).reduce((s, p) => s + p.amount, 0));
    const exp = months.map((m) => db.all('expenses').filter((e) => e.date.startsWith(m)).reduce((s, e) => s + e.amount, 0));
    const max = Math.max(1, ...rev, ...exp);
    const yr = String(now.getFullYear());
    const invs = db.all('invoices').filter((i) => i.status !== 'Draft');
    const invoicedY = invs.filter((i) => i.date.startsWith(yr)).reduce((s, i) => s + totals(i).total, 0);
    const collectedY = db.all('payments').filter((p) => p.date.startsWith(yr)).reduce((s, p) => s + p.amount, 0);
    const expY = db.all('expenses').filter((e) => e.date.startsWith(yr)).reduce((s, e) => s + e.amount, 0);
    const aging = { Current: 0, '1–30 days': 0, '31–60 days': 0, '60+ days': 0 };
    invs.forEach((i) => { const s = invState(i); if (s.bal <= 0) return; const late = Math.floor((pd(today()) - pd(dueDate(i))) / 864e5); aging[late <= 0 ? 'Current' : late <= 30 ? '1–30 days' : late <= 60 ? '31–60 days' : '60+ days'] += s.bal; });
    const byClient = {}; invs.forEach((i) => { const n = clientName(i); byClient[n] = (byClient[n] || 0) + totals(i).total; });
    const top = Object.entries(byClient).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topMax = Math.max(1, ...top.map((t) => t[1]));
    main.innerHTML = `<div class="page">${head('Reports')}
      <div class="kpis">
        <div class="kpi accent"><small>Invoiced ${yr}</small><b class="tnum">${moneyShort(invoicedY)}</b></div>
        <div class="kpi"><small>Collected ${yr}</small><b class="tnum">${moneyShort(collectedY)}</b></div>
        <div class="kpi"><small>Expenses ${yr}</small><b class="tnum">${moneyShort(expY)}</b></div>
        <div class="kpi"><small>Net cash ${yr}</small><b class="tnum" style="color:${collectedY - expY < 0 ? 'var(--red)' : 'var(--green)'}">${moneyShort(collectedY - expY)}</b></div>
      </div>
      <div class="panel" style="margin-bottom:16px"><h3>Cash in vs expenses, last 6 months <span class="legend"><span><i style="background:var(--orange)"></i>Collected</span><span><i style="background:#3b3b44"></i>Expenses</span></span></h3>
        <div class="chart">${months.map((m, i) => `<div class="col"><div class="bars"><div class="bar rev" style="height:${(rev[i] / max) * 100}%" data-v="${moneyShort(rev[i])}"></div><div class="bar exp" style="height:${(exp[i] / max) * 100}%" data-v="${moneyShort(exp[i])}"></div></div></div>`).join('')}</div>
        <div class="chart-x">${months.map((m) => `<span>${MONTHS[Number(m.slice(5)) - 1].slice(0, 3)}</span>`).join('')}</div></div>
      <div class="grid2">
        <div class="panel"><h3>Receivables aging</h3>${Object.entries(aging).map(([k, v]) => `<div class="mini-row" style="cursor:default"><span>${k}</span><b class="tnum" style="color:${k !== 'Current' && v ? 'var(--red)' : ''}">${money(v)}</b></div>`).join('')}</div>
        <div class="panel"><h3>Top clients by invoiced value</h3>${top.map(([n, v]) => `<div style="padding:8px 0;font-size:14px"><div style="display:flex;justify-content:space-between"><span>${esc(n)}</span><b class="tnum">${moneyShort(v)}</b></div><div style="height:6px;background:#f1f1f5;border-radius:3px;margin-top:6px"><div style="height:100%;width:${(v / topMax) * 100}%;background:var(--orange);border-radius:3px"></div></div></div>`).join('') || '<p style="color:var(--muted)">No data yet</p>'}</div>
      </div></div>`;
  };

  /* ================= SETTINGS ================= */
  PAGES.settings = function () {
    const s = db.settings();
    main.innerHTML = `<div class="page">${head('Staff & settings')}
      <div class="grid2">
        <form class="panel" id="setForm"><h3>Business &amp; invoicing</h3>
          <div class="fld-row">${field({ name: 'currency', label: 'Currency', type: 'select', options: [['NGN', 'NGN — Naira (₦)'], ['USD', 'USD — US dollar ($)'], ['GBP', 'GBP — Pound (£)'], ['EUR', 'EUR — Euro (€)']] }, s.currency)}${field({ name: 'taxRate', label: 'Default VAT %', type: 'number', step: 'any' }, s.taxRate)}</div>
          <div class="fld-row">${field({ name: 'invoicePrefix', label: 'Invoice prefix' }, s.invoicePrefix)}${field({ name: 'quotePrefix', label: 'Quotation prefix' }, s.quotePrefix)}</div>
          ${field({ name: 'bankName', label: 'Bank name' }, s.bank.name)}
          <div class="fld-row">${field({ name: 'bankAccount', label: 'Account name' }, s.bank.account)}${field({ name: 'bankNumber', label: 'Account number' }, s.bank.number)}</div>
          ${field({ name: 'defaultNotes', label: 'Default invoice notes', type: 'textarea', rows: 2 }, s.defaultNotes)}
          <div class="modal-foot"><button class="pill-btn solid" type="submit">Save settings</button></div>
        </form>
        <div>
          <div class="panel" style="margin-bottom:16px"><h3>Staff <a href="#" data-act="add-staff">+ Add staff</a></h3>
            <div id="staffList"><p style="color:var(--muted);font-size:14px">Loading…</p></div>
            <p style="font-size:12.5px;color:var(--muted);margin-top:12px">Owner: everything, including staff and settings. Procurement: clients, enquiries, quotations, procurement and vendors. Finance: invoices, quotations, payments, expenses and reports. The server enforces these permissions.</p></div>
          <div class="panel"><h3>Company</h3>
            <div style="font-size:14px;line-height:1.6"><b>${esc(COMPANY.name)}</b><br>${COMPANY.headOffice.map(esc).join(', ')}<br>USA: ${COMPANY.usOffice.join(', ')} · ${COMPANY.usPhone}<br>${COMPANY.phones.join(' · ')}<br>${COMPANY.email}</div>
            <div class="modal-foot" style="margin-top:16px"><button class="ghost danger left" data-act="clear-data">Delete all records</button><button class="ghost" data-act="load-demo">Load demo data</button></div></div>
        </div>
      </div></div>`;
    $('#setForm').addEventListener('submit', (e) => {
      e.preventDefault(); const d = Object.fromEntries(new FormData(e.target));
      db.saveSettings({ currency: d.currency, taxRate: Number(d.taxRate) || 0, invoicePrefix: d.invoicePrefix, quotePrefix: d.quotePrefix, defaultNotes: d.defaultNotes, bank: { name: d.bankName, account: d.bankAccount, number: d.bankNumber } }).then(() => toast('Settings saved'));
    });
    loadStaff();
  };
  let STAFF = [];
  async function loadStaff() {
    const el = $('#staffList'); if (!el) return;
    try { STAFF = await GT.api('GET', 'staff'); } catch (e) { el.textContent = e.message; return; }
    el.innerHTML = STAFF.map((m) => `<div class="mini-row" data-staff="${m.id}"><div>${esc(m.name)}${m.id === GT.user.id ? ' <small style="display:inline">(you)</small>' : ''}<small>${esc(m.email)}</small></div>${chip(m.role === 'Owner' ? 'Request' : 'Draft', m.role)}</div>`).join('');
  }
  function staffForm(id) {
    const rec = id ? STAFF.find((x) => x.id === id) : { role: 'Procurement' };
    formModal(id ? 'Edit staff' : 'Add staff', [
      { name: 'name', label: 'Name', required: true }, { name: 'email', label: 'Email (used to sign in)', type: 'email', required: true },
      { name: 'role', label: 'Role', type: 'select', options: ['Owner', 'Procurement', 'Finance'] },
      { name: 'password', label: id ? 'New password (leave blank to keep the current one)' : 'Temporary password (at least 8 characters)', type: 'password', required: !id },
    ], rec, async (d) => {
      if (!d.password) delete d.password;
      try { await GT.api(id ? 'PUT' : 'POST', 'staff' + (id ? '/' + id : ''), d); toast(id ? 'Staff updated' : 'Staff account created'); } catch (e) { toast(e.message); }
      loadStaff();
    }, id && id !== GT.user.id ? { onDelete: async () => { try { await GT.api('DELETE', 'staff/' + id); toast('Staff removed'); } catch (e) { toast(e.message); } loadStaff(); } } : {});
  }
  function meMenu() {
    const u = GT.user;
    const m = modal('Your account', `<p style="font-size:14px;margin-bottom:16px"><b>${esc(u.name)}</b><br><span style="color:var(--muted)">${esc(u.email)} · ${esc(u.role)}</span></p>
      <form novalidate>${field({ name: 'current', label: 'Current password', type: 'password' })}${field({ name: 'password', label: 'New password (at least 8 characters)', type: 'password' })}
      <div class="modal-foot"><button type="button" class="ghost danger left" data-signout>Sign out</button><button class="pill-btn solid" type="submit">Change password</button></div></form>`);
    $('[data-signout]', m).addEventListener('click', async () => { await GT.db.flush(); await GT.api('POST', 'auth/logout'); location.reload(); });
    $('form', m).addEventListener('submit', async (e) => {
      e.preventDefault(); const d = Object.fromEntries(new FormData(e.target));
      try { await GT.api('POST', 'auth/password', d); closeModal(); toast('Password changed'); } catch (err) { toast(err.message); }
    });
  }

  function searchModal() {
    const m = modal('Search', `<div class="search" style="background:#f4f4f7;margin-bottom:10px">${ic('search')}<input data-q placeholder="Clients, invoice numbers, quotations…"></div><div class="pick-list" data-res></div>`);
    const res = $('[data-res]', m);
    $('[data-q]', m).addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim(); if (!q) { res.innerHTML = ''; return; }
      const hits = [];
      db.all('clients').forEach((c) => { if ((c.name + c.company + c.email).toLowerCase().includes(q)) hits.push(['#/clients', c.company || c.name, 'Client', 'c:' + c.id]); });
      ['invoices', 'quotations'].forEach((k) => db.all(k).forEach((d) => { if ((d.number + clientName(d)).toLowerCase().includes(q)) hits.push([`#/${k}/${d.id}`, `${d.number} — ${clientName(d)}`, k === 'invoices' ? 'Invoice' : 'Quotation']); }));
      res.innerHTML = hits.slice(0, 20).map((h) => `<a class="pick" href="${h[0]}" ${h[3] ? `data-cl="${h[3].slice(2)}"` : ''}><span><b>${esc(h[1])}</b><small>${h[2]}</small></span></a>`).join('') || '<p style="color:var(--muted);padding:10px">No matches</p>';
    });
    res.addEventListener('click', (e) => { const a = e.target.closest('a'); if (!a) return; closeModal(); if (a.dataset.cl) { e.preventDefault(); location.hash = '#/clients'; setTimeout(() => clientForm(db.get('clients', a.dataset.cl)), 50); } });
  }

  /* ================= EVENTS ================= */
  main.addEventListener('click', (e) => {
    const go = e.target.closest('[data-go]'); if (go) { location.hash = go.dataset.go; return; }
    const enq = e.target.closest('[data-enq]'); if (enq) return enquiryModal(enq.dataset.enq);
    const ed = e.target.closest('[data-edit]'); if (ed) { const [c, id] = ed.dataset.edit.split(':'); return editRecord(c, id); }
    const md = e.target.closest('[data-mode]'); if (md) { const k = location.hash.includes('quotations') ? 'quotations' : 'invoices'; LIST[k].mode = md.dataset.mode; return docList(k); }
    const fl = e.target.closest('[data-filter]'); if (fl) { const k = location.hash.includes('quotations') ? 'quotations' : 'invoices'; LIST[k].filter = fl.dataset.filter; return docList(k); }
    const ct = e.target.closest('[data-ctab]'); if (ct) { clientTab = ct.dataset.ctab; return PAGES.clients(); }
    const sf = e.target.closest('[data-staff]'); if (sf) return staffForm(sf.dataset.staff);
    const it = e.target.closest('[data-item]'); if (it) return itemModal(Number(it.dataset.item));
    const a = e.target.closest('[data-act]'); if (!a) return;
    const act = a.dataset.act;
    const k = location.hash.includes('quotations') ? 'quotations' : 'invoices';
    switch (act) {
      case 'search': return searchModal();
      case 'prev': case 'next': { const L = LIST[k]; const [y, m] = L.ym.split('-').map(Number); const d = L.mode === 'year' ? new Date(y + (act === 'next' ? 1 : -1), m - 1, 1) : new Date(y, m - 1 + (act === 'next' ? 1 : -1), 1); L.ym = GT.iso(d).slice(0, 7); return docList(k); }
      case 'new-invoices': location.hash = '#/invoices/new'; return;
      case 'new-quotations': location.hash = '#/quotations/new'; return;
      case 'add-clients': case 'add-vendors': case 'add-procurement': case 'add-expenses': case 'add-payments': return editRecord(act.slice(4));
      case 'pay': return paymentForm({});
      case 'exp': return editRecord('expenses');
      case 'add-staff': e.preventDefault(); return staffForm();
      case 'me': return meMenu();
      case 'load-demo': case 'clear-data': {
        const clear = act === 'clear-data';
        if (!confirm(clear ? 'Delete ALL clients, invoices, quotations, payments and other records? Staff accounts and settings are kept. This cannot be undone.' : 'Replace all records with the demo data? Everything currently entered will be removed.')) return;
        GT.api('POST', 'demo', { mode: clear ? 'clear' : 'demo' }).then(() => GT.load()).then(() => { toast(clear ? 'All records deleted' : 'Demo data loaded'); route(); }).catch((err) => toast(err.message));
        return;
      }
      // editor
      case 'save': return saveDoc();
      case 'preview': return previewDoc();
      case 'item': return itemModal();
      case 'client': return clientPicker((id) => { ED.doc.clientId = id; dirty(); });
      case 'req-client': return clientForm({ name: ED.doc.request.name, company: ED.doc.request.name, email: ED.doc.request.email, phone: ED.doc.request.phone, address: ED.doc.request.city }, (c) => { ED.doc.clientId = c.id; dirty(); });
      case 'number': return formModal('Document number', [{ name: 'number', label: 'Number', required: true }], ED.doc, (d) => { ED.doc.number = d.number.trim(); dirty(); });
      case 'details': {
        const isInv = ED.kind === 'invoices';
        return formModal('Details', [
          { name: 'number', label: 'Number', required: true, half: true }, { name: 'date', label: 'Issue date', type: 'date', half: true },
          { name: 'terms', label: isInv ? 'Payment terms' : 'Validity', type: 'select', options: isInv ? ['Due on receipt', 'Net 7', 'Net 14', 'Net 30', 'Net 60'] : ['Valid 7 days', 'Valid 14 days', 'Valid 30 days', 'Valid 60 days'], half: true },
          { name: 'status', label: 'Status', type: 'select', options: isInv ? [['Draft', 'Draft'], ['Sent', 'Sent / issued']] : ['Request', 'Draft', 'Sent', 'Accepted', 'Declined'], half: true },
        ], ED.doc, (d) => { Object.assign(ED.doc, d); dirty(); });
      }
      case 'discount': {
        const m = formModal('Discount', [{ name: 'type', label: 'Type', type: 'select', options: [['percent', 'Percentage (%)'], ['amount', 'Fixed amount']] }, { name: 'value', label: 'Value', type: 'number', min: 0, step: 'any' }], ED.doc.discount, (d) => { ED.doc.discount = d; dirty(); });
        return m;
      }
      case 'tax': if (!ED.doc.taxOn) { ED.doc.taxOn = true; return dirty(); }
        return formModal('VAT', [{ name: 'taxOn', label: 'Apply VAT', type: 'select', options: [['1', 'Yes'], ['', 'No']] }, { name: 'taxRate', label: 'Rate %', type: 'number', step: 'any', min: 0 }], { taxOn: ED.doc.taxOn ? '1' : '', taxRate: ED.doc.taxRate }, (d) => { ED.doc.taxOn = !!d.taxOn; ED.doc.taxRate = d.taxRate; dirty(); });
      case 'record-pay': return paymentForm({ invoiceId: ED.doc.id }, () => editor(ED.kind, ED.doc.id));
      case 'mark-sent': ED.doc.status = 'Sent'; ED.dirty = true; return saveDoc();
      case 'duplicate': { const c = clone(ED.doc); delete c.id; delete c.request; delete c.source; c.number = db.nextNumber(ED.kind); c.date = today(); c.status = ED.kind === 'invoices' ? 'Draft' : 'Draft'; ED = null; const rec = db.insert(k, c); toast('Duplicated as ' + rec.number); location.hash = `#/${k}/${rec.id}`; return; }
      case 'convert': {
        if (ED.dirty && !saveDoc()) return;
        const q = ED.doc; const inv = clone(q); delete inv.id; delete inv.request; delete inv.source;
        if (!inv.clientId) { toast('Add a client before converting'); return; }
        inv.number = db.nextNumber('invoices'); inv.date = today(); inv.terms = 'Due on receipt'; inv.status = 'Draft';
        db.update('quotations', q.id, { status: 'Accepted' });
        const rec = db.insert('invoices', inv); ED = null; toast('Invoice ' + rec.number + ' created'); location.hash = '#/invoices/' + rec.id; return;
      }
      case 'delete': if (confirm(`Delete ${ED.doc.number}? This cannot be undone.`)) { db.remove(ED.kind, ED.doc.id); const kk = ED.kind; ED = null; toast('Deleted'); location.hash = '#/' + kk; } return;
    }
  });
  main.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches('[data-go]')) location.hash = e.target.dataset.go; });
  main.addEventListener('input', (e) => {
    if (e.target.matches('[data-notes]')) { ED.doc.notes = e.target.value; if (!ED.dirty) { ED.dirty = true; const b = $('[data-act=save]'); if (b) b.disabled = false; } }
    if (e.target.matches('[data-tblq]')) { TBL[e.target.dataset.tblq] = e.target.value; route(); }
  });
  document.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 's' && ED) { e.preventDefault(); saveDoc(); } });

  /* ================= SYNC + SIGN-IN ================= */
  let booted = false;
  window.addEventListener('gt:error', async (e) => {
    toast(e.detail && e.detail.message ? e.detail.message : 'Could not save. Reloading.');
    if (e.detail && e.detail.status === 401) return;
    try { await GT.load(); ED = null; route(); } catch (err) { /* offline */ }
  });
  window.addEventListener('gt:changed', () => {
    if (ED && ED.saved && !ED.dirty) { const fresh = db.get(ED.kind, ED.doc.id); if (fresh) { ED.doc = clone(fresh); editor(ED.kind, fresh.id); } }
    else if (!ED) route();
  });
  window.addEventListener('gt:signedout', () => { if (booted) authScreen('login', 'Your session ended. Please sign in again.'); });
  // pick up changes made by other staff when you come back to the tab
  window.addEventListener('focus', async () => {
    if (!booted || !modalEl.hidden || (ED && ED.dirty) || db.pending) return;
    try { await GT.load(); if (ED && ED.saved) ED = null; route(); } catch (e) { /* ignore */ }
  });

  function authScreen(mode, note = '') {
    booted = false;
    document.body.classList.add('auth-mode');
    const setup = mode === 'setup';
    main.innerHTML = `<div class="auth"><form class="auth-card" novalidate>
      <img src="../assets/logo-black.svg" alt="Gorpat Trading Limited">
      <h1>${setup ? 'Set up your admin' : 'Staff sign-in'}</h1>
      <p class="auth-sub">${setup ? 'Create the Owner account. You can add other staff from Staff &amp; settings afterwards.' : 'Sign in to manage clients, procurement and invoices.'}</p>
      ${note ? `<p class="auth-note">${esc(note)}</p>` : ''}
      ${setup ? field({ name: 'name', label: 'Your name', required: true }) : ''}
      ${field({ name: 'email', label: 'Email', type: 'email', required: true })}
      ${field({ name: 'password', label: setup ? 'Password (at least 8 characters)' : 'Password', type: 'password', required: true })}
      ${setup ? '<label class="auth-check"><input type="checkbox" name="demo"> Start with demo data so you can explore</label>' : ''}
      <p class="auth-err" role="alert"></p>
      <button class="pill-btn solid auth-btn" type="submit">${setup ? 'Create account' : 'Sign in'}</button>
      <a class="auth-back" href="../">← Back to website</a>
    </form></div>`;
    const form = $('.auth-card');
    $('[name=email]', form).setAttribute('autocomplete', 'username');
    $('[name=password]', form).setAttribute('autocomplete', setup ? 'new-password' : 'current-password');
    setTimeout(() => form.querySelector('input').focus(), 30);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(form)); d.demo = !!d.demo;
      const btn = $('.auth-btn', form); btn.disabled = true;
      try { await GT.api('POST', setup ? 'auth/setup' : 'auth/login', d); await start(); }
      catch (err) { $('.auth-err', form).textContent = err.message; btn.disabled = false; }
    });
  }

  async function start() {
    await GT.load();
    document.body.classList.remove('auth-mode');
    booted = true;
    route();
  }

  (async function boot() {
    try {
      const st = await GT.api('GET', 'auth/state');
      if (st.needsSetup) return authScreen('setup');
      if (!st.user) return authScreen('login');
      await start();
    } catch (e) {
      main.innerHTML = '<div class="auth"><div class="auth-card"><h1>Can\'t reach the server</h1><p class="auth-sub">Start it with <code>node server/server.js</code> and reload this page.</p></div></div>';
    }
  })();
})();
