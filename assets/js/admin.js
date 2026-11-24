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
  const creditFor = (inv) => db.all('credit_notes').filter((c) => c.invoiceId === inv.id && c.status === 'Applied').reduce((s, c) => s + Number(c.amount || 0), 0);
  function invState(inv) {
    const t = totals(inv).total, paid = paidFor(inv), credited = creditFor(inv), bal = Math.max(0, t - paid - credited);
    let st;
    if (inv.status === 'Draft') st = 'Draft';
    else if (t > 0 && bal <= 0.005) st = 'Paid';
    else if (dueDate(inv) < today()) st = 'Overdue';
    else if (paid + credited > 0) st = 'Partial';
    else st = 'Sent';
    let label = st;
    if (st === 'Sent') label = dueDate(inv) === today() ? 'Due Today' : 'Due ' + fmtLong(dueDate(inv));
    if (st === 'Partial') label = 'Part paid';
    return { total: t, paid, credited, bal, st, label };
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
  window.addEventListener('hashchange', () => { if (!modalEl.hidden) closeModal(); });

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
    ['', [['overview', 'Business overview']]],
    ['Sales & CRM', [['clients', 'Clients'], ['pipeline', 'Pipeline'], ['quotations', 'Quotations'], ['invoices', 'Invoices'], ['returns', 'Returns & credit notes'], ['payments', 'Payments']]],
    ['Procurement & logistics', [['procurement', 'Procurement'], ['vendors', 'Vendors'], ['warehouses', 'Warehouses'], ['stock', 'Stock & batches'], ['transfers', 'Transfers'], ['deliveries', 'Deliveries'], ['drivers', 'Drivers & routes']]],
    ['Financials', [['expenses', 'Expenses'], ['pnl', 'P&L statement'], ['cashflow', 'Cash flow'], ['vat', 'VAT summary'], ['costledger', 'Cost ledger'], ['reports', 'Reports']]],
    ['HR & payroll', [['employees', 'Staff'], ['attendance', 'Attendance'], ['payroll', 'Payroll']]],
    ['Admin', [['settings', 'Admins & settings']]],
  ];
  function renderNav(active) {
    const newReq = db.all('quotations').filter((q) => q.status === 'Request').length;
    const newEnq = db.all('enquiries').filter((q) => q.status === 'New').length;
    const expiring = db.all('stock').filter((b) => b.expiry && b.expiry <= GT.iso(new Date(Date.now() + 14 * 864e5))).length;
    const badge = { quotations: newReq, clients: newEnq, settings: GT.pendingAdmins, stock: expiring };
    const mb = $('#menuBtn'); if (mb) { const has = Object.keys(badge).some((k) => badge[k] && canSee(k)); mb.querySelector('.dot') ? (!has && mb.querySelector('.dot').remove()) : (has && mb.insertAdjacentHTML('beforeend', '<span class="dot"></span>')); }
    $('#sideNav').innerHTML = NAV.map(([g, items]) => {
      const vis = items.filter(([k]) => canSee(k));
      if (!vis.length) return '';
      return (g ? `<div class="nav-group">${esc(g)}</div>` : '') + vis.map(([k, l]) => `<a href="#/${k}" class="${k === active ? 'active' : ''}" title="${esc(l)}">${ic(k)}<span>${esc(l)}</span>${badge[k] ? `<span class="badge">${badge[k]}</span>` : ''}</a>`).join('');
    }).join('');
  }
  const PAGE_COL = { clients: 'clients', procurement: 'procurement', invoices: 'invoices', quotations: 'quotations', expenses: 'expenses', payments: 'payments', vendors: 'vendors',
    pipeline: 'deals', returns: 'returns', warehouses: 'warehouses', stock: 'stock', transfers: 'transfers', deliveries: 'deliveries', drivers: 'drivers',
    costledger: 'cost_ledger', employees: 'employees', attendance: 'attendance', payroll: 'payroll' };
  function canSee(page) {
    if (page === 'overview') return true;
    if (page === 'reports' || page === 'pnl' || page === 'cashflow' || page === 'vat') return GT.can('reports');
    if (page === 'settings') return GT.can('settings');
    if (page === 'clients') return GT.can('read', 'clients') || GT.can('read', 'enquiries');
    return GT.can('read', PAGE_COL[page]);
  }
  // create = { label, act }: a compact "New …" button in the header on desktop
  // (phones get the full-width bottom bar from fab() instead)
  function head(title, create) {
    const u = GT.user || {};
    const newBtn = create && !(colOfAct(create.act) && !GT.can('write', colOfAct(create.act)))
      ? `<button class="pill-btn solid head-new" data-act="${create.act}">${ic('plus')}${esc(create.label.charAt(0) + create.label.slice(1).toLowerCase())}</button>` : '';
    return `<div class="page-head"><h1>${esc(title)}</h1><div class="head-tools">${newBtn}<button class="round" data-act="search" aria-label="Search">${ic('search')}</button><button class="staff-pill" data-act="me" title="${esc(u.name)} — ${esc(GT.roleLabel(u.role))}">${ic('star', 'i" style="width:15px;height:15px')}${esc(GT.roleLabel(u.role).toUpperCase())}</button></div></div>`;
  }
  const FAB_COL = { 'new-invoices': 'invoices', 'new-quotations': 'quotations', 'add-clients': 'clients', 'add-vendors': 'vendors', 'add-procurement': 'procurement', 'add-expenses': 'expenses', 'add-payments': 'payments', 'run-payroll': 'payroll' };
  const colOfAct = (act) => FAB_COL[act] || (/^add-/.test(act) && act !== 'add-staff' ? act.slice(4) : null);
  function fab(label, act) { if (colOfAct(act) && !GT.can('write', colOfAct(act))) return ''; return `<div class="fab"><button data-act="${act}">${ic('plus')}${esc(label)}</button></div>`; }

  /* ---------------- mobile menu ---------------- */
  const sideEl = $('#side'), menuBtn = $('#menuBtn');
  function setMenu(open) {
    sideEl.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuBtn.addEventListener('click', () => setMenu(!sideEl.classList.contains('open')));
  $('#sideNav').addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  window.addEventListener('hashchange', () => setMenu(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && sideEl.classList.contains('open')) { setMenu(false); menuBtn.focus(); } });
  window.matchMedia('(min-width: 761px)').addEventListener('change', (m) => { if (m.matches) setMenu(false); });

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
      ${GT.pendingAdmins ? `<a class="notice" href="#/settings"><b>${GT.pendingAdmins} admin request${GT.pendingAdmins > 1 ? 's' : ''} waiting for your approval</b><span>Review →</span></a>` : ''}
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
    main.innerHTML = `<div class="page">${head(isInv ? 'Invoices' : 'Quotations', { label: isInv ? 'CREATE INVOICE' : 'CREATE QUOTATION', act: 'new-' + kind })}
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
        ${st ? `<div class="sum-line"><span>Paid</span><span class="val tnum">${money(st.paid)}</span></div>${st.credited ? `<div class="sum-line"><span>Credit notes applied</span><span class="val tnum">−${money(st.credited)}</span></div>` : ''}<div class="sum-line strong"><span>Balance due</span><span class="tnum" style="color:${st.bal > 0 ? 'var(--red)' : 'var(--green)'}">${money(st.bal)}</span></div>` : ''}
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
    main.innerHTML = `<div class="page">${head(title, addLabel ? { label: addLabel, act: 'add-' + col } : null)}${extraTop}
      <div class="toolbar">${tabs}<label class="search">${ic('search')}<input placeholder="Search ${esc(title.toLowerCase())}" value="${esc(TBL[key] || '')}" data-tblq="${key}"></label></div>
      <div class="table-wrap"><table><thead><tr>${columns.map((c) => `<th class="${c.r ? 'r' : ''}">${c.label}</th>`).join('')}</tr></thead>
      <tbody>${list.map((r) => `<tr data-edit="${col}:${r.id}">${columns.map((c) => `<td class="${c.r ? 'r tnum' : ''}" data-label="${esc(c.label)}">${c.html ? c.get(r) : esc(c.get(r))}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${columns.length}" style="text-align:center;color:var(--muted);padding:40px">Nothing here yet.</td></tr>`}</tbody></table></div>
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
    if (!FIELDS[col]) return;
    const rec = id ? db.get(col, id) : (DEF[col] ? DEF[col]() : { date: today(), status: 'Sourcing', ref: col === 'procurement' ? 'PO-' + (1000 + db.all('procurement').length + 1) : '' });
    if (id && !rec) return;
    if (!GT.can('write', col)) return viewRecord(col, rec);
    formModal((id ? 'Edit ' : 'New ') + (TITLES[col] || { vendors: 'vendor', procurement: 'procurement order', expenses: 'expense' }[col]), FIELDS[col], rec, (d) => {
      if (HOOK[col]) HOOK[col](d, id ? db.get(col, id) : null);
      if (id) db.update(col, id, d); else db.insert(col, d); toast('Saved'); route();
    }, id ? { onDelete: () => { db.remove(col, id); route(); } } : {});
  }

  // read-only view for admins who can see but not edit a section
  function viewRecord(col, rec) {
    const rows = FIELDS[col].map((f) => {
      let v = rec[f.name];
      if (f.type === 'select') { const o = (typeof f.options === 'function' ? f.options() : f.options).find((x) => String(Array.isArray(x) ? x[0] : x) === String(v ?? '')); v = o ? (Array.isArray(o) ? o[1] : o) : v; }
      else if (f.type === 'date' && v) v = fmtLong(v);
      else if (f.type === 'number' && /cost|value|amount|salary|vat/i.test(f.name)) v = money(v);
      return `<dt>${esc(f.label)}</dt><dd>${esc(v === undefined || v === '' ? '—' : v)}</dd>`;
    }).join('');
    modal('Details', `<dl class="view-list">${rows}</dl><div class="modal-foot"><button class="pill-btn solid" data-close>Close</button></div>`);
  }

  let clientTab = 'clients';
  PAGES.clients = function () {
    const nNew = db.all('enquiries').filter((e) => e.status === 'New').length;
    if (!GT.can('read', 'clients')) clientTab = 'enquiries';
    if (!GT.can('read', 'enquiries')) clientTab = 'clients';
    const tabs = !(GT.can('read', 'clients') && GT.can('read', 'enquiries')) ? '' : `<div class="seg tabs"><button data-ctab="clients" class="${clientTab === 'clients' ? 'on' : ''}">Clients</button><button data-ctab="enquiries" class="${clientTab === 'enquiries' ? 'on' : ''}">Enquiries${nNew ? ` (${nNew})` : ''}</button></div>`;
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
      extraTop: `<div class="kpis three"><div class="kpi"><small>This month</small><b class="tnum">${moneyShort(sum(ex.filter((e) => e.date.startsWith(ym))))}</b></div><div class="kpi"><small>This year</small><b class="tnum">${moneyShort(sum(ex.filter((e) => e.date.startsWith(ym.slice(0, 4)))))}</b></div><div class="kpi"><small>Entries</small><b class="tnum">${ex.length}</b></div></div>`,
      columns: [{ label: 'Date', get: (r) => fmtD(r.date) }, { label: 'Description', get: (r) => r.desc }, { label: 'Category', get: (r) => r.category }, { label: 'Vendor', get: (r) => (vendor(r.vendorId) || {}).name || '—' }, { label: 'Amount', r: true, get: (r) => money(r.amount) }] });
  };

  PAGES.payments = function () {
    const pays = db.all('payments').slice().sort((a, b) => b.date.localeCompare(a.date));
    const outstanding = db.all('invoices').filter((i) => i.status !== 'Draft').reduce((s, i) => s + invState(i).bal, 0);
    tablePage({ key: 'pa', title: 'Payments', col: 'payments', addLabel: 'RECORD PAYMENT', rows: pays,
      extraTop: `<div class="kpis three"><div class="kpi accent"><small>Received (all time)</small><b class="tnum">${moneyShort(pays.reduce((s, p) => s + p.amount, 0))}</b></div><div class="kpi"><small>Outstanding</small><b class="tnum" style="color:var(--red)">${moneyShort(outstanding)}</b></div><div class="kpi"><small>Payments</small><b class="tnum">${pays.length}</b></div></div>`,
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
    main.innerHTML = `<div class="page">${head('Admins & settings')}
      <div class="grid2">
        <form class="panel" id="setForm"><h3>Business &amp; invoicing</h3>
          <div class="fld-row">${field({ name: 'currency', label: 'Currency', type: 'select', options: [['NGN', 'NGN — Naira (₦)'], ['USD', 'USD — US dollar ($)'], ['GBP', 'GBP — Pound (£)'], ['EUR', 'EUR — Euro (€)']] }, s.currency)}${field({ name: 'taxRate', label: 'Default VAT %', type: 'number', step: 'any' }, s.taxRate)}</div>
          <div class="fld-row">${field({ name: 'invoicePrefix', label: 'Invoice prefix' }, s.invoicePrefix)}${field({ name: 'quotePrefix', label: 'Quotation prefix' }, s.quotePrefix)}</div>
          ${field({ name: 'bankName', label: 'Bank name' }, s.bank.name)}
          <div class="fld-row">${field({ name: 'bankAccount', label: 'Account name' }, s.bank.account)}${field({ name: 'bankNumber', label: 'Account number' }, s.bank.number)}</div>
          ${field({ name: 'defaultNotes', label: 'Default invoice notes', type: 'textarea', rows: 2 }, s.defaultNotes)}
          <div class="fld-row">${field({ name: 'openingCash', label: 'Starting cash balance (Cash flow)', type: 'number', step: 'any' }, s.openingCash || 0)}${field({ name: 'payrollDeductionPct', label: 'Payroll deductions % (PAYE + pension)', type: 'number', step: 'any' }, s.payrollDeductionPct ?? 10)}</div>
          <div class="modal-foot"><button class="pill-btn solid" type="submit">Save settings</button></div>
        </form>
        <div>
          <div class="panel" style="margin-bottom:16px"><h3>Admins <a href="#" data-act="add-staff">How to add admins</a></h3>
            <div id="staffList"><p style="color:var(--muted);font-size:14px">Loading…</p></div>
            <p style="font-size:12.5px;color:var(--muted);margin-top:12px">You are the head admin: only you approve new admins and decide which sections each one can view or edit. The database enforces these limits, not just the menu.<br><br>To add someone, send them the admin link and ask them to choose <b>Request admin access</b>. Once they confirm their email they appear here with a <b>Review</b> button.</p></div>
          <div class="panel"><h3>Company</h3>
            <div style="font-size:14px;line-height:1.6"><b>${esc(COMPANY.name)}</b><br>${COMPANY.headOffice.map(esc).join(', ')}<br>USA: ${COMPANY.usOffice.join(', ')} · ${COMPANY.usPhone}<br>${COMPANY.phones.join(' · ')}<br>${COMPANY.email}</div>
            <div class="modal-foot" style="margin-top:16px"><button class="ghost danger left" data-act="clear-data">Delete all records</button><button class="ghost" data-act="load-demo">Load demo data</button></div></div>
        </div>
      </div></div>`;
    $('#setForm').addEventListener('submit', (e) => {
      e.preventDefault(); const d = Object.fromEntries(new FormData(e.target));
      db.saveSettings({ currency: d.currency, taxRate: Number(d.taxRate) || 0, invoicePrefix: d.invoicePrefix, quotePrefix: d.quotePrefix, defaultNotes: d.defaultNotes, openingCash: Number(d.openingCash) || 0, payrollDeductionPct: Number(d.payrollDeductionPct) || 0, bank: { name: d.bankName, account: d.bankAccount, number: d.bankNumber } }).then(() => toast('Settings saved'));
    });
    loadStaff();
  };
  let STAFF = [];
  const SECTION_LABELS = { clients: 'Clients', enquiries: 'Website enquiries', deals: 'Pipeline', quotations: 'Quotations', invoices: 'Invoices', returns: 'Returns & credit notes', payments: 'Payments',
    procurement: 'Procurement', vendors: 'Vendors', warehouses: 'Warehouses', stock: 'Stock & batches', transfers: 'Transfers', deliveries: 'Deliveries', drivers: 'Drivers & routes',
    expenses: 'Expenses', cost_ledger: 'Cost ledger', reports: 'Reports, P&L, cash flow & VAT', employees: 'Staff (HR)', attendance: 'Attendance', payroll: 'Payroll' };
  const ALL_EDIT = Object.fromEntries(GT.SECTIONS.map((k) => [k, k === 'reports' ? 'view' : 'edit']));
  const PRESETS = [
    ['Full access', ALL_EDIT],
    ['Sales', { clients: 'edit', enquiries: 'edit', deals: 'edit', quotations: 'edit', invoices: 'view', returns: 'edit', deliveries: 'view' }],
    ['Procurement & logistics', { clients: 'view', quotations: 'view', invoices: 'view', procurement: 'edit', vendors: 'edit', warehouses: 'edit', stock: 'edit', transfers: 'edit', deliveries: 'edit', drivers: 'edit', cost_ledger: 'edit' }],
    ['Finance', { clients: 'edit', quotations: 'edit', invoices: 'edit', returns: 'edit', payments: 'edit', procurement: 'view', vendors: 'view', expenses: 'edit', cost_ledger: 'view', reports: 'view', payroll: 'view' }],
    ['HR', { employees: 'edit', attendance: 'edit', payroll: 'edit' }],
    ['View only', Object.fromEntries(GT.SECTIONS.map((k) => [k, 'view']))],
    ['No access', {}],
  ];
  function accessSummary(m) {
    if (m.role === 'Owner') return 'Full access · approves admins';
    if (m.role === 'Pending') return 'Waiting for your approval';
    if (m.role === 'Disabled') return 'No access';
    const a = m.access || {};
    const e = GT.SECTIONS.filter((k) => a[k] === 'edit').length, v = GT.SECTIONS.filter((k) => a[k] === 'view').length;
    return !e && !v ? 'Approved, but no sections yet' : [e && `${e} can edit`, v && `${v} view only`].filter(Boolean).join(' · ');
  }
  async function loadStaff() {
    const el = $('#staffList'); if (!el) return;
    try { STAFF = await GT.staff.list(); } catch (e) { el.textContent = e.message; return; }
    const CH = { Owner: 'Request', Pending: 'Pending', Disabled: 'Declined', Staff: 'Accepted' };
    const order = { Pending: 0, Owner: 1, Staff: 2, Disabled: 3 };
    el.innerHTML = STAFF.slice().sort((a, b) => order[a.role] - order[b.role]).map((m) => `<div class="mini-row" data-staff="${m.id}">
      <div>${esc(m.name || m.email)}${m.id === GT.user.id ? ' <small style="display:inline">(you)</small>' : ''}<small>${esc(m.email)} · ${esc(accessSummary(m))}</small></div>
      ${m.role === 'Pending' ? '<span class="pill-btn solid sm">Review</span>' : chip(CH[m.role] || 'Draft', GT.roleLabel(m.role))}</div>`).join('');
    const n = STAFF.filter((m) => m.role === 'Pending').length;
    if (n !== GT.pendingAdmins) { await GT.load().catch(() => {}); renderNav('settings'); }
  }
  function staffForm(id) {
    if (!id) {
      return modal('Adding admins', `<p style="font-size:14px;line-height:1.6">Admins create their own sign-in, so passwords are never shared:</p>
        <ol style="font-size:14px;line-height:1.7;margin:10px 0 16px 20px"><li>Send them this link: <b>${esc(location.origin + location.pathname)}</b></li><li>They choose <b>Request admin access</b> and confirm their email.</li><li>They appear here as <b>Review</b>. Open them, choose what they can see and edit, then approve.</li></ol>
        <div class="modal-foot"><button class="pill-btn solid" data-close>Got it</button></div>`);
    }
    const m0 = STAFF.find((x) => x.id === id);
    if (!m0) return;
    if (m0.role === 'Owner') {
      return formModal('Head admin', [{ name: 'name', label: 'Name', required: true }], m0, async (d) => {
        try { await GT.staff.update(id, { name: d.name }); toast('Saved'); } catch (e) { toast(e.message); } loadStaff();
      });
    }
    let status = m0.role === 'Pending' ? 'Staff' : m0.role;
    let access = { ...(m0.access || {}) };
    const lvlBtns = (k) => (k === 'reports' ? ['none', 'view'] : ['none', 'view', 'edit'])
      .map((l) => `<button type="button" data-k="${k}" data-l="${l}" class="${(access[k] || 'none') === l ? 'on' : ''}">${{ none: 'No access', view: 'View', edit: 'Edit' }[l]}</button>`).join('');
    const m = modal(m0.role === 'Pending' ? 'Approve admin' : 'Admin access', `
      <form novalidate>
        <p class="acc-who"><b>${esc(m0.name || m0.email)}</b><br><span>${esc(m0.email)}</span></p>
        ${field({ name: 'name', label: 'Name', required: true }, m0.name)}
        <div class="fld">Status<div class="toggle" data-status>
          <button type="button" data-s="Staff" class="${status === 'Staff' ? 'on' : ''}">${m0.role === 'Pending' ? 'Approve' : 'Active'}</button>
          ${m0.role === 'Pending' ? '<button type="button" data-s="Pending" class="">Not yet</button>' : ''}
          <button type="button" data-s="Disabled" class="${status === 'Disabled' ? 'on' : ''}">${m0.role === 'Pending' ? 'Decline' : 'Disabled'}</button></div></div>
        <div class="acc-wrap"${status === 'Staff' ? '' : ' hidden'}>
          <div class="fld" style="margin-bottom:6px">Quick presets</div>
          <div class="seg acc-presets">${PRESETS.map(([n], i) => `<button type="button" data-p="${i}">${n}</button>`).join('')}</div>
          <div class="acc-grid">${GT.SECTIONS.map((k) => `<div class="acc-row"><span>${SECTION_LABELS[k]}</span><div class="acc-lv">${lvlBtns(k)}</div></div>`).join('')}</div>
          <p class="acc-note">View lets them see a section. Edit also lets them add, change and delete. Settings and admin approval stay with you, the head admin.</p>
        </div>
        <div class="modal-foot"><button type="button" class="ghost" data-close>Cancel</button><button class="pill-btn solid" type="submit">${m0.role === 'Pending' ? 'Save decision' : 'Save access'}</button></div>
      </form>`, { wide: true });
    const wrap = $('.acc-wrap', m);
    const paint = () => {
      m.querySelectorAll('.acc-lv button').forEach((b) => b.classList.toggle('on', (access[b.dataset.k] || 'none') === b.dataset.l));
      m.querySelectorAll('[data-s]').forEach((b) => b.classList.toggle('on', b.dataset.s === status));
      wrap.hidden = status !== 'Staff';
    };
    m.addEventListener('click', (e) => {
      const lv = e.target.closest('.acc-lv button'); if (lv) { access[lv.dataset.k] = lv.dataset.l; return paint(); }
      const p = e.target.closest('[data-p]'); if (p) { access = { ...PRESETS[Number(p.dataset.p)][1] }; return paint(); }
      const st = e.target.closest('[data-s]'); if (st) { status = st.dataset.s; return paint(); }
    });
    $('form', m).addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = $('[name=name]', m).value.trim() || m0.name;
      if (status === 'Staff' && !GT.SECTIONS.some((k) => access[k] && access[k] !== 'none') && !confirm('This admin will be approved but can\'t see any section yet. Continue?')) return;
      const clean = {}; GT.SECTIONS.forEach((k) => { if (access[k] && access[k] !== 'none') clean[k] = access[k]; });
      try {
        await GT.staff.update(id, { name, role: status, access: clean });
        closeModal();
        toast(m0.role === 'Pending' ? (status === 'Staff' ? 'Admin approved' : status === 'Disabled' ? 'Request declined' : 'Saved') : 'Access updated');
      } catch (err) { toast(err.message); }
      loadStaff();
    });
  }
  function meMenu() {
    const u = GT.user;
    const m = modal('Your account', `<p style="font-size:14px;margin-bottom:16px"><b>${esc(u.name)}</b><br><span style="color:var(--muted)">${esc(u.email)} · ${esc(GT.roleLabel(u.role))}</span></p>
      <form novalidate>${field({ name: 'current', label: 'Current password', type: 'password' })}${field({ name: 'password', label: 'New password (at least 8 characters)', type: 'password' })}
      <div class="modal-foot"><button type="button" class="ghost danger left" data-signout>Sign out</button><button class="pill-btn solid" type="submit">Change password</button></div></form>`);
    $('[data-signout]', m).addEventListener('click', async () => { await GT.db.flush(); await GT.auth.signOut(); location.hash = ''; location.reload(); });
    $('form', m).addEventListener('submit', async (e) => {
      e.preventDefault(); const d = Object.fromEntries(new FormData(e.target));
      try { await GT.auth.changePassword(d.current, d.password); closeModal(); toast('Password changed'); } catch (err) { toast(err.message); }
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

  /* ================= OPERATIONS MODULES =================
   * Pipeline, Returns & credit notes, Warehouses, Stock & batches, Transfers, Deliveries,
   * Drivers & routes, Cost ledger, P&L, Cash flow, VAT summary, Staff, Attendance, Payroll. */
  Object.assign(P, {
    pipeline: '<path d="M3 4h18l-7 8.5V19l-4 2v-8.5z" fill="currentColor"/>',
    returns: '<path d="M9 4 4 9l5 5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H10" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
    warehouses: '<path d="M2 9.5 12 3l10 6.5V21H2z" fill="currentColor"/><rect x="7" y="13" width="10" height="8" fill="#fbfbfd"/><path d="M7 16.2h10M7 18.8h10" stroke="currentColor" stroke-width="1.3"/>',
    stock: '<rect x="3" y="12.5" width="8" height="8" rx="1.2" fill="currentColor"/><rect x="13" y="12.5" width="8" height="8" rx="1.2" fill="currentColor"/><rect x="8" y="3" width="8" height="8" rx="1.2" fill="currentColor"/>',
    transfers: '<path d="M4 8h15l-4-4M20 16H5l4 4" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>',
    deliveries: '<path d="M2 5h12v11H2zM14 8.5h4.5l3.5 4V16h-8z" fill="currentColor"/><circle cx="6.5" cy="17.5" r="2.3" fill="currentColor" stroke="#fbfbfd" stroke-width="1.4"/><circle cx="17.5" cy="17.5" r="2.3" fill="currentColor" stroke="#fbfbfd" stroke-width="1.4"/><path d="M5 10.5l2 2 4-4" fill="none" stroke="#fbfbfd" stroke-width="1.7" stroke-linecap="round"/>',
    drivers: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="12" cy="12" r="2.4" fill="currentColor"/><path d="M3.8 10.6 9.6 12M14.4 12l5.8-1.4M12 14.4v6" stroke="currentColor" stroke-width="2.2"/>',
    pnl: '<path d="M5 20v-8M11 20V5M17 20v-6M2 20.5h20" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>',
    cashflow: '<path d="M3 17l5.5-5.5 4 4L20 8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M14.5 8H20v5.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
    vat: '<rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor"/><path d="M8 16 16 8" stroke="#fbfbfd" stroke-width="2" stroke-linecap="round"/><circle cx="8.6" cy="8.6" r="1.7" fill="#fbfbfd"/><circle cx="15.4" cy="15.4" r="1.7" fill="#fbfbfd"/>',
    costledger: '<path d="M6 2.5h11.5A1.5 1.5 0 0 1 19 4v17.5H7.5A2.5 2.5 0 0 1 5 19V3.5a1 1 0 0 1 1-1z" fill="currentColor"/><path d="M9 7.5h6.5M9 11.5h6.5M9 15.5h4" stroke="#fbfbfd" stroke-width="1.8"/>',
    employees: '<rect x="4" y="2.5" width="16" height="19" rx="2.5" fill="currentColor"/><circle cx="12" cy="10" r="3" fill="#fbfbfd"/><path d="M7.5 17.5c.9-2.1 2.5-3.1 4.5-3.1s3.6 1 4.5 3.1" fill="none" stroke="#fbfbfd" stroke-width="1.8" stroke-linecap="round"/>',
    attendance: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.2" fill="currentColor"/><path d="M3.5 10h17" stroke="#fbfbfd" stroke-width="2"/><path d="M8 2.8v4M16 2.8v4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M8.6 14.8l2.2 2.2 4.4-4.4" fill="none" stroke="#fbfbfd" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
    payroll: '<rect x="2" y="6" width="20" height="12.5" rx="2.2" fill="currentColor"/><circle cx="12" cy="12.25" r="3.1" fill="#fbfbfd"/><circle cx="5.6" cy="12.25" r="1.1" fill="#fbfbfd"/><circle cx="18.4" cy="12.25" r="1.1" fill="#fbfbfd"/>',
  });

  // small helpers
  const pick = (col, label, empty = '—') => () => [['', empty]].concat(db.all(col).map((r) => [r.id, label(r)]));
  const nm = (col, id, key = 'name') => { const r = id && db.get(col, id); return r ? (typeof key === 'function' ? key(r) : r[key]) || '—' : '—'; };
  const clientLabel = (c) => c.company || c.name;
  const invLabel = (i) => `${i.number} — ${clientName(i)}`;
  const sum = (arr, f) => arr.reduce((s, x) => s + (Number(f(x)) || 0), 0);
  const daysBetween = (a, b) => Math.round((pd(b) - pd(a)) / 864e5);
  const inRange = (date, [a, b]) => !!date && date >= a && date <= b;
  const monthRange = (offset = 0) => { const d = new Date(); const s = new Date(d.getFullYear(), d.getMonth() + offset, 1); return [GT.iso(s), GT.iso(new Date(s.getFullYear(), s.getMonth() + 1, 0))]; };
  const monthName = (ym) => { const [y, m] = ym.split('-').map(Number); return `${MONTHS[m - 1]} ${y}`; };
  const subhead = (t) => `<p class="page-sub">${t}</p>`;
  const num = (n) => (Number(n) || 0).toLocaleString('en-NG');
  function nextRef(col, prefix, pad = 3) {
    const n = db.all(col).map((r) => parseInt(String(r.ref || '').replace(/\D/g, ''), 10) || 0);
    return prefix + String((n.length ? Math.max(...n) : 0) + 1).padStart(pad, '0');
  }
  const kpiRow = (items) => `<div class="kpis${items.length === 3 ? ' three' : ''}">${items.map(([l, v, s, accent]) => `<div class="kpi${accent ? ' accent' : ''}"><small>${l}</small><b class="tnum">${v}</b>${s ? `<span>${s}</span>` : ''}</div>`).join('')}</div>`;
  const TONE = { Pending: 'Pending', Approved: 'Ordered', Credited: 'Paid', Rejected: 'Declined', Draft: 'Draft', Applied: 'Paid', Void: 'Declined',
    Planned: 'Draft', 'In transit': 'In transit', Completed: 'Paid', Cancelled: 'Declined', Scheduled: 'Draft', 'Out for delivery': 'In transit', Delivered: 'Paid', Failed: 'Overdue',
    Available: 'Paid', 'On route': 'In transit', 'Off duty': 'Draft', Active: 'Paid', 'On leave': 'Pending', Exited: 'Declined',
    Present: 'Paid', Late: 'Pending', Absent: 'Overdue', Processing: 'Pending', Paid: 'Paid',
    Healthy: 'Paid', Watch: 'Pending', 'Expiring soon': 'Request', Expired: 'Overdue', 'No expiry': 'Draft',
    Revalued: 'Ordered', 'New supplier': 'In transit', 'New batch': 'Draft', Discount: 'Paid',
    'New lead': 'Draft', Contacted: 'Ordered', Quoted: 'Pending', Negotiation: 'Request', Won: 'Paid', Lost: 'Declined' };
  const sc = (st) => chip(TONE[st] || 'Draft', st || '—');
  const STAGES = ['New lead', 'Contacted', 'Quoted', 'Negotiation', 'Won', 'Lost'];

  /* ---------- forms ---------- */
  Object.assign(FIELDS, {
    deals: [{ name: 'company', label: 'Company / prospect', required: true },
      { name: 'contact', label: 'Contact person', half: true }, { name: 'phone', label: 'Phone', type: 'tel', half: true },
      { name: 'value', label: 'Estimated value', type: 'number', min: 0, step: 'any', half: true }, { name: 'stage', label: 'Stage', type: 'select', options: STAGES, half: true },
      { name: 'source', label: 'Source', type: 'select', options: ['Website', 'Referral', 'Walk-in', 'Tender', 'Existing client', 'Other'], half: true },
      { name: 'clientId', label: 'Linked client', type: 'select', options: pick('clients', clientLabel, 'Not a client yet'), half: true },
      { name: 'email', label: 'Email', type: 'email' }, { name: 'notes', label: 'Notes', type: 'textarea', rows: 2 }],
    returns: [{ name: 'ref', label: 'Return no.', required: true, half: true }, { name: 'date', label: 'Date', type: 'date', half: true },
      { name: 'clientId', label: 'Client', type: 'select', options: pick('clients', clientLabel), half: true },
      { name: 'invoiceId', label: 'Invoice', type: 'select', options: pick('invoices', invLabel), half: true },
      { name: 'item', label: 'Item returned', required: true },
      { name: 'qty', label: 'Quantity', type: 'number', min: 0, step: 'any', half: true },
      { name: 'reason', label: 'Reason', type: 'select', options: ['Damaged in transit', 'Wrong item delivered', 'Near-expiry', 'Faulty', 'Excess quantity', 'Other'], half: true },
      { name: 'status', label: 'Status', type: 'select', options: ['Pending', 'Approved', 'Credited', 'Rejected'] }, { name: 'notes', label: 'Notes', type: 'textarea', rows: 2 }],
    credit_notes: [{ name: 'ref', label: 'Credit note no.', required: true, half: true }, { name: 'date', label: 'Date', type: 'date', half: true },
      { name: 'clientId', label: 'Client', type: 'select', options: pick('clients', clientLabel), half: true },
      { name: 'invoiceId', label: 'Against invoice', type: 'select', options: pick('invoices', invLabel), half: true },
      { name: 'amount', label: 'Amount', type: 'number', min: 0, step: 'any', required: true, half: true },
      { name: 'status', label: 'Status (Applied reduces the invoice balance)', type: 'select', options: ['Draft', 'Approved', 'Applied', 'Void'], half: true },
      { name: 'returnId', label: 'Linked return', type: 'select', options: pick('returns', (r) => `${r.ref} — ${r.item}`) }, { name: 'reason', label: 'Reason', type: 'textarea', rows: 2 }],
    warehouses: [{ name: 'name', label: 'Warehouse name', required: true }, { name: 'location', label: 'Location' },
      { name: 'type', label: 'Type', type: 'select', options: ['Ambient', 'Chilled', 'Bonded', 'Open yard'], half: true }, { name: 'manager', label: 'Manager', half: true },
      { name: 'capacity', label: 'Capacity', type: 'number', min: 0, half: true }, { name: 'unit', label: 'Unit (pallets, crates, units…)', half: true }],
    stock: [{ name: 'item', label: 'Item', required: true }, { name: 'sku', label: 'SKU / code', half: true }, { name: 'batch', label: 'Batch no.', half: true },
      { name: 'warehouseId', label: 'Warehouse', type: 'select', options: pick('warehouses', (w) => w.name), half: true },
      { name: 'vendorId', label: 'Supplier', type: 'select', options: pick('vendors', (v) => v.name), half: true },
      { name: 'qty', label: 'Quantity on hand', type: 'number', min: 0, step: 'any', half: true }, { name: 'unitCost', label: 'Unit cost', type: 'number', min: 0, step: 'any', half: true },
      { name: 'expiry', label: 'Expiry date (optional)', type: 'date', half: true }, { name: 'received', label: 'Received', type: 'date', half: true },
      { name: 'notes', label: 'Notes', type: 'textarea', rows: 2 }],
    transfers: [{ name: 'ref', label: 'Transfer no.', required: true, half: true }, { name: 'date', label: 'Date', type: 'date', half: true },
      { name: 'fromId', label: 'From', type: 'select', options: pick('warehouses', (w) => w.name), half: true },
      { name: 'toId', label: 'To', type: 'select', options: pick('warehouses', (w) => w.name), half: true },
      { name: 'item', label: 'Item', required: true }, { name: 'qty', label: 'Quantity', type: 'number', min: 0, step: 'any', half: true },
      { name: 'status', label: 'Status', type: 'select', options: ['Planned', 'In transit', 'Completed', 'Cancelled'], half: true }, { name: 'notes', label: 'Notes', type: 'textarea', rows: 2 }],
    deliveries: [{ name: 'ref', label: 'Delivery no.', required: true, half: true },
      { name: 'dispatched', label: 'Dispatched', type: 'datetime-local', half: true },
      { name: 'invoiceId', label: 'Invoice', type: 'select', options: pick('invoices', invLabel), half: true },
      { name: 'clientId', label: 'Client (filled from invoice if empty)', type: 'select', options: pick('clients', clientLabel), half: true },
      { name: 'driverId', label: 'Driver', type: 'select', options: pick('drivers', (d) => d.name), half: true }, { name: 'route', label: 'Route / destination', half: true },
      { name: 'status', label: 'Status', type: 'select', options: ['Scheduled', 'Out for delivery', 'Delivered', 'Failed'], half: true },
      { name: 'pod', label: 'Proof of delivery', type: 'select', options: [['', '—'], 'Signed', 'Photo', 'Customer unavailable', 'Refused'], half: true },
      { name: 'receivedBy', label: 'Received by' }, { name: 'notes', label: 'Notes', type: 'textarea', rows: 2 }],
    drivers: [{ name: 'name', label: 'Driver name', required: true }, { name: 'phone', label: 'Phone', type: 'tel', half: true },
      { name: 'status', label: 'Status', type: 'select', options: ['Available', 'On route', 'Off duty'], half: true },
      { name: 'vehicle', label: 'Vehicle', half: true }, { name: 'plate', label: 'Plate number', half: true }, { name: 'route', label: 'Usual route' }],
    cost_ledger: [{ name: 'date', label: 'Date', type: 'date', half: true }, { name: 'change', label: 'Change', type: 'select', options: ['Revalued', 'New supplier', 'New batch', 'Discount'], half: true },
      { name: 'item', label: 'Item', required: true }, { name: 'vendorId', label: 'Supplier', type: 'select', options: pick('vendors', (v) => v.name) },
      { name: 'oldCost', label: 'Old unit cost', type: 'number', min: 0, step: 'any', half: true }, { name: 'newCost', label: 'New unit cost', type: 'number', min: 0, step: 'any', half: true },
      { name: 'reason', label: 'Reason', type: 'textarea', rows: 2 }],
    employees: [{ name: 'name', label: 'Full name', required: true }, { name: 'role', label: 'Job title', half: true },
      { name: 'department', label: 'Department', type: 'select', options: ['Management', 'Procurement', 'Sales', 'Finance', 'Logistics', 'Warehousing', 'Admin'], half: true },
      { name: 'phone', label: 'Phone', type: 'tel', half: true }, { name: 'email', label: 'Email', type: 'email', half: true },
      { name: 'joined', label: 'Date joined', type: 'date', half: true }, { name: 'status', label: 'Status', type: 'select', options: ['Active', 'On leave', 'Exited'], half: true },
      { name: 'salary', label: 'Monthly gross salary', type: 'number', min: 0, step: 'any' }, { name: 'notes', label: 'Notes', type: 'textarea', rows: 2 }],
  });
  FIELDS.expenses.push({ name: 'vat', label: 'VAT paid (input VAT, optional)', type: 'number', min: 0, step: 'any' });
  FIELDS.expenses[1].options = ['Freight & clearing', 'Transport', 'Logistics & fuel', 'Office', 'Rent & utilities', 'Salaries', 'Purchases', 'Marketing', 'Utilities', 'Other'];

  const localNow = () => new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 16);
  const DEF = {
    deals: () => ({ stage: 'New lead', source: 'Website', stageDate: today() }),
    returns: () => ({ ref: nextRef('returns', 'RT-'), date: today(), status: 'Pending', reason: 'Damaged in transit', qty: 1 }),
    credit_notes: () => ({ ref: nextRef('credit_notes', 'CN-', 4), date: today(), status: 'Draft' }),
    warehouses: () => ({ type: 'Ambient', unit: 'units' }),
    stock: () => ({ received: today() }),
    transfers: () => ({ ref: nextRef('transfers', 'TR-'), date: today(), status: 'Planned' }),
    deliveries: () => ({ ref: nextRef('deliveries', 'DEL-'), status: 'Scheduled', dispatched: localNow() }),
    drivers: () => ({ status: 'Available' }),
    cost_ledger: () => ({ date: today(), change: 'Revalued' }),
    employees: () => ({ status: 'Active', joined: today(), department: 'Procurement' }),
  };
  const TITLES = { deals: 'deal', returns: 'return', credit_notes: 'credit note', warehouses: 'warehouse', stock: 'stock batch', transfers: 'transfer', deliveries: 'delivery', drivers: 'driver', cost_ledger: 'cost entry', employees: 'staff member' };
  const fromInvoice = (d) => { if (!d.clientId && d.invoiceId) d.clientId = (db.get('invoices', d.invoiceId) || {}).clientId || ''; };
  const HOOK = {
    deals(d, old) { if (!old || old.stage !== d.stage) d.stageDate = today(); },
    returns: fromInvoice, credit_notes: fromInvoice, deliveries: fromInvoice,
    stock(d, old) {
      // every unit-cost change is written to the cost ledger automatically
      if (old && Number(old.unitCost) !== Number(d.unitCost) && GT.can('write', 'cost_ledger')) {
        db.insert('cost_ledger', { date: today(), item: d.item, vendorId: d.vendorId || '', change: 'Revalued', oldCost: Number(old.unitCost) || 0, newCost: Number(d.unitCost) || 0, reason: `Edited in Stock & batches${d.batch ? ' (batch ' + d.batch + ')' : ''}` });
      }
    },
  };

  /* ---------- Pipeline ---------- */
  PAGES.pipeline = function () {
    const deals = db.all('deals');
    const open = deals.filter((d) => !['Won', 'Lost'].includes(d.stage));
    const canW = GT.can('write', 'deals');
    main.innerHTML = `<div class="page">${head('Pipeline', { label: 'NEW DEAL', act: 'add-deals' })}
      ${subhead(`${open.length} open deal${open.length === 1 ? '' : 's'} · ${moneyShort(sum(open, (d) => d.value))} in play`)}
      <div class="board">${STAGES.map((st) => { const ds = deals.filter((d) => (d.stage || 'New lead') === st); return `<section class="board-col">
        <header><span>${sc(st)}</span><b class="tnum">${ds.length}</b></header><div class="board-sum tnum">${moneyShort(sum(ds, (d) => d.value))}</div>
        ${ds.map((d) => `<article class="deal" data-edit="deals:${d.id}" tabindex="0"><b>${esc(d.company)}</b><small>${esc(d.contact || d.source || '')}</small>
          <div class="deal-foot"><span class="tnum">${moneyShort(d.value)}</span><span class="deal-age">${['Won', 'Lost'].includes(st) ? 'Closed' : Math.max(0, daysBetween(d.stageDate || today(), today())) + 'd in stage'}</span>
          ${canW && !['Won', 'Lost'].includes(st) ? `<button class="deal-adv" data-adv="${d.id}" title="Move to ${STAGES[STAGES.indexOf(st) + 1]}" aria-label="Move ${esc(d.company)} to ${STAGES[STAGES.indexOf(st) + 1]}">${ic('chevR')}</button>` : ''}</div></article>`).join('') || '<p class="board-empty">No deals</p>'}
      </section>`; }).join('')}</div></div>${fab('NEW DEAL', 'add-deals')}`;
  };
  function advanceDeal(id) {
    const d = db.get('deals', id); if (!d) return;
    const next = STAGES[STAGES.indexOf(d.stage || 'New lead') + 1]; if (!next || next === 'Lost') return;
    const patch = { stage: next, stageDate: today() };
    if (next === 'Won' && !d.clientId && GT.can('write', 'clients') && confirm(`${d.company} is won. Add them as a client?`)) {
      const c = db.insert('clients', { company: d.company, name: d.contact || d.company, email: d.email || '', phone: d.phone || '', address: '' });
      patch.clientId = c.id;
    }
    db.update('deals', id, patch); toast(`${d.company} moved to ${next}`); PAGES.pipeline();
  }

  /* ---------- Returns & credit notes ---------- */
  let rTab = 'returns';
  PAGES.returns = function () {
    const tabs = `<div class="seg tabs"><button data-rtab="returns" class="${rTab === 'returns' ? 'on' : ''}">Returns</button><button data-rtab="credit_notes" class="${rTab === 'credit_notes' ? 'on' : ''}">Credit notes</button></div>`;
    const cl = (id) => nm('clients', id, clientLabel), inv = (id) => nm('invoices', id, 'number');
    if (rTab === 'credit_notes') {
      const cns = db.all('credit_notes');
      return tablePage({ key: 'cn', title: 'Returns & credit notes', col: 'credit_notes', tabs, addLabel: 'NEW CREDIT NOTE',
        extraTop: kpiRow([['Applied to invoices', moneyShort(sum(cns.filter((c) => c.status === 'Applied'), (c) => c.amount)), 'reduces balances', true], ['Awaiting', moneyShort(sum(cns.filter((c) => ['Draft', 'Approved'].includes(c.status)), (c) => c.amount))], ['Credit notes', cns.length]]),
        columns: [{ label: 'Credit note', get: (r) => r.ref }, { label: 'Date', get: (r) => fmtD(r.date) }, { label: 'Client', get: (r) => cl(r.clientId) }, { label: 'Invoice', get: (r) => inv(r.invoiceId) },
          { label: 'Amount', r: true, get: (r) => money(r.amount) }, { label: 'Status', html: true, get: (r) => sc(r.status) }] });
    }
    const rts = db.all('returns');
    tablePage({ key: 'rt', title: 'Returns & credit notes', col: 'returns', tabs, addLabel: 'LOG RETURN',
      extraTop: subhead('Damaged, expired or wrongly delivered goods sent back by clients') + kpiRow([['Pending review', rts.filter((r) => r.status === 'Pending').length, '', true], ['Approved', rts.filter((r) => r.status === 'Approved').length], ['Credited', rts.filter((r) => r.status === 'Credited').length], ['Rejected', rts.filter((r) => r.status === 'Rejected').length]]),
      columns: [{ label: 'Return', get: (r) => r.ref }, { label: 'Date', get: (r) => fmtD(r.date) }, { label: 'Client', get: (r) => cl(r.clientId) }, { label: 'Item', get: (r) => r.item },
        { label: 'Qty', r: true, get: (r) => num(r.qty) }, { label: 'Reason', get: (r) => r.reason }, { label: 'Invoice', get: (r) => inv(r.invoiceId) }, { label: 'Status', html: true, get: (r) => sc(r.status) }] });
  };

  /* ---------- Warehouses & stock ---------- */
  const onHand = (wid) => sum(db.all('stock').filter((s) => s.warehouseId === wid), (s) => s.qty);
  function batchState(s) {
    if (!s.expiry) return 'No expiry';
    const d = daysBetween(today(), s.expiry);
    return d < 0 ? 'Expired' : d <= 14 ? 'Expiring soon' : d <= 45 ? 'Watch' : 'Healthy';
  }
  PAGES.warehouses = function () {
    const ws = db.all('warehouses');
    const pctOf = (w) => (Number(w.capacity) ? Math.round(onHand(w.id) / w.capacity * 100) : 0);
    const hot = ws.filter((w) => pctOf(w) >= 90);
    main.innerHTML = `<div class="page">${head('Warehouses', { label: 'NEW WAREHOUSE', act: 'add-warehouses' })}${subhead('Capacity and how full each site is, from the stock recorded in Stock &amp; batches')}
      ${hot.map((w) => `<a class="notice" href="#/transfers"><b>${esc(w.name)} is ${pctOf(w)}% full</b><span>Plan a transfer →</span></a>`).join('')}
      <div class="card-grid">${ws.map((w) => { const oh = onHand(w.id), pct = Math.min(100, pctOf(w)); return `<article class="tile" data-edit="warehouses:${w.id}" tabindex="0">
        <h4>${esc(w.name)}</h4><small>${esc([w.location, w.type].filter(Boolean).join(' · ') || '—')}</small>
        <div class="util"><div class="util-top"><span>Utilisation</span><b class="tnum">${Number(w.capacity) ? pctOf(w) + '%' : '—'}</b></div><div class="util-bar"><i style="width:${pct}%" class="${pct >= 90 ? 'hot' : pct >= 75 ? 'warm' : ''}"></i></div></div>
        <dl class="tile-stats"><div><dt>Capacity</dt><dd class="tnum">${Number(w.capacity) ? num(w.capacity) + ' ' + esc(w.unit || '') : '—'}</dd></div><div><dt>On hand</dt><dd class="tnum">${num(oh)} ${esc(w.unit || '')}</dd></div></dl></article>`; }).join('') || '<div class="empty">No warehouses yet.</div>'}</div>
    </div>${fab('NEW WAREHOUSE', 'add-warehouses')}`;
  };
  PAGES.stock = function () {
    const rows = db.all('stock').slice().sort((a, b) => (a.expiry || '9999').localeCompare(b.expiry || '9999'));
    const soon = rows.filter((s) => batchState(s) === 'Expiring soon').length, gone = rows.filter((s) => batchState(s) === 'Expired').length;
    tablePage({ key: 'st', title: 'Stock & batches', col: 'stock', rows, addLabel: 'ADD BATCH',
      extraTop: subhead('Sorted by expiry date, soonest first, so the oldest stock goes out first. Changing a unit cost is logged in the Cost ledger.')
        + kpiRow([['Stock value', moneyShort(sum(rows, (s) => (s.qty || 0) * (s.unitCost || 0))), `${rows.length} batch${rows.length === 1 ? '' : 'es'}`, true], ['Expiring within 14 days', soon], ['Expired', gone], ['Warehouses', db.all('warehouses').length]]),
      columns: [{ label: 'Item', get: (r) => r.item }, { label: 'Warehouse', get: (r) => nm('warehouses', r.warehouseId) }, { label: 'Batch', get: (r) => r.batch || '—' },
        { label: 'Expiry', get: (r) => (r.expiry ? fmtD(r.expiry) : '—') }, { label: 'Qty', r: true, get: (r) => num(r.qty) }, { label: 'Unit cost', r: true, get: (r) => money(r.unitCost) },
        { label: 'Value', r: true, get: (r) => money((r.qty || 0) * (r.unitCost || 0)) }, { label: 'Status', html: true, get: (r) => sc(batchState(r)) }] });
  };
  PAGES.transfers = function () {
    const ts = db.all('transfers'), wh = (id) => nm('warehouses', id);
    tablePage({ key: 'tr', title: 'Transfers', col: 'transfers', addLabel: 'NEW TRANSFER',
      extraTop: subhead('Stock moved between warehouses. Update quantities in Stock &amp; batches when a transfer completes.')
        + kpiRow([['In transit', ts.filter((t) => t.status === 'In transit').length, '', true], ['Planned', ts.filter((t) => t.status === 'Planned').length], ['Completed', ts.filter((t) => t.status === 'Completed').length]]),
      columns: [{ label: 'Transfer', get: (r) => r.ref }, { label: 'Date', get: (r) => fmtD(r.date) }, { label: 'From', get: (r) => wh(r.fromId) }, { label: 'To', get: (r) => wh(r.toId) },
        { label: 'Item', get: (r) => r.item }, { label: 'Qty', r: true, get: (r) => num(r.qty) }, { label: 'Status', html: true, get: (r) => sc(r.status) }] });
  };

  /* ---------- Deliveries & drivers ---------- */
  const fmtDT = (s) => (s ? `${fmtD(s.slice(0, 10))} ${s.slice(11, 16)}` : '—');
  PAGES.deliveries = function () {
    const ds = db.all('deliveries');
    const delivered = ds.filter((d) => d.status === 'Delivered');
    const pod = delivered.length ? Math.round(delivered.filter((d) => ['Signed', 'Photo'].includes(d.pod)).length / delivered.length * 100) + '%' : '—';
    tablePage({ key: 'dl', title: 'Deliveries', col: 'deliveries', addLabel: 'NEW DELIVERY',
      extraTop: subhead('Dispatch and proof-of-delivery tracking')
        + kpiRow([['Out for delivery', ds.filter((d) => d.status === 'Out for delivery').length, '', true], ['Delivered today', delivered.filter((d) => (d.dispatched || '').slice(0, 10) === today()).length], ['Failed', ds.filter((d) => d.status === 'Failed').length, 'needs a redo'], ['Proof captured', pod, 'of delivered']]),
      columns: [{ label: 'Delivery', get: (r) => r.ref }, { label: 'Invoice', get: (r) => nm('invoices', r.invoiceId, 'number') }, { label: 'Client', get: (r) => nm('clients', r.clientId, clientLabel) },
        { label: 'Driver', get: (r) => nm('drivers', r.driverId) }, { label: 'Route', get: (r) => r.route || '—' }, { label: 'Dispatched', get: (r) => fmtDT(r.dispatched) },
        { label: 'Status', html: true, get: (r) => sc(r.status) }, { label: 'Proof', get: (r) => r.pod || '—' }] });
  };
  PAGES.drivers = function () {
    const drs = db.all('drivers');
    const todayCount = (id) => db.all('deliveries').filter((d) => d.driverId === id && (d.dispatched || '').slice(0, 10) === today()).length;
    main.innerHTML = `<div class="page">${head('Drivers & routes', { label: 'ADD DRIVER', act: 'add-drivers' })}${subhead('Fleet and route assignments')}
      ${kpiRow([['Available', drs.filter((d) => d.status === 'Available').length, '', true], ['On route', drs.filter((d) => d.status === 'On route').length], ['Off duty', drs.filter((d) => d.status === 'Off duty').length]])}
      <div class="card-grid">${drs.map((d) => `<article class="tile" data-edit="drivers:${d.id}" tabindex="0">
        <div class="tile-top"><h4>${esc(d.name)}</h4>${sc(d.status)}</div><small>${esc([d.vehicle, d.plate, d.route].filter(Boolean).join(' · ') || '—')}</small>
        <dl class="tile-stats"><div><dt>Deliveries today</dt><dd class="tnum">${todayCount(d.id)}</dd></div><div><dt>Phone</dt><dd>${d.phone ? `<a href="tel:${esc(d.phone)}" data-stop>${esc(d.phone)}</a>` : '—'}</dd></div></dl></article>`).join('') || '<div class="empty">No drivers yet.</div>'}</div>
    </div>${fab('ADD DRIVER', 'add-drivers')}`;
  };

  /* ---------- Cost ledger ---------- */
  PAGES.costledger = function () {
    const rows = db.all('cost_ledger').slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    const pct = (r) => (Number(r.oldCost) ? ((r.newCost - r.oldCost) / r.oldCost) * 100 : null);
    tablePage({ key: 'cl', title: 'Cost ledger', col: 'cost_ledger', rows, addLabel: 'ADD COST ENTRY',
      extraTop: subhead('Auditable history of item cost changes. Edits to unit cost in Stock &amp; batches are added here automatically.'),
      columns: [{ label: 'Date', get: (r) => fmtD(r.date) }, { label: 'Item', get: (r) => r.item }, { label: 'Change', html: true, get: (r) => sc(r.change) }, { label: 'Supplier', get: (r) => nm('vendors', r.vendorId) },
        { label: 'Old cost', r: true, get: (r) => (r.oldCost ? money(r.oldCost) : '—') }, { label: 'New cost', r: true, get: (r) => money(r.newCost) },
        { label: 'Change %', r: true, html: true, get: (r) => { const p = pct(r); return p === null ? '—' : `<span style="color:${p > 0 ? 'var(--red)' : 'var(--green)'}">${p > 0 ? '+' : ''}${p.toFixed(1)}%</span>`; } },
        { label: 'Reason', get: (r) => r.reason || '—' }] });
  };

  /* ---------- Financial statements ---------- */
  let plPeriod = 'month';
  const periodRange = (p) => (p === 'last' ? monthRange(-1) : p === 'ytd' ? [new Date().getFullYear() + '-01-01', today()] : monthRange(0));
  function plFigures(r) {
    const invs = db.all('invoices').filter((i) => i.status !== 'Draft' && inRange(i.date, r));
    const credits = sum(db.all('credit_notes').filter((c) => c.status === 'Applied' && inRange(c.date, r)), (c) => c.amount);
    const sales = sum(invs, (i) => { const t = totals(i); return t.subtotal - t.discount; });
    const revenue = sales - credits;
    const exps = db.all('expenses').filter((e) => inRange(e.date, r));
    const net = (e) => (Number(e.amount) || 0) - (Number(e.vat) || 0);
    const procured = sum(db.all('procurement').filter((p) => ['Ordered', 'In transit', 'Delivered'].includes(p.status) && inRange(p.date, r)), (p) => p.value);
    const cogs = procured + sum(exps.filter((e) => e.category === 'Purchases'), net);
    const opex = {};
    exps.filter((e) => e.category !== 'Purchases').forEach((e) => { const k = e.category || 'Other'; opex[k] = (opex[k] || 0) + net(e); });
    const opTotal = sum(Object.values(opex), (v) => v);
    return { sales, credits, revenue, procured, cogs, gross: revenue - cogs, opex, opTotal, net: revenue - cogs - opTotal };
  }
  const pctOfRev = (v, f) => (f.revenue ? `${((v / f.revenue) * 100).toFixed(1)}% margin` : '');
  PAGES.pnl = function () {
    const f = plFigures(periodRange(plPeriod));
    const line = (label, v, cls = '') => `<tr class="static ${cls}"><td>${label}</td><td class="r tnum">${v < 0 ? '(' + money(-v) + ')' : money(v)}</td></tr>`;
    main.innerHTML = `<div class="page">${head('P&L statement')}
      <div class="seg pl-seg">${[['month', 'This month'], ['last', 'Last month'], ['ytd', 'Year to date']].map(([k, l]) => `<button data-pl="${k}" class="${plPeriod === k ? 'on' : ''}">${l}</button>`).join('')}</div>
      ${kpiRow([['Revenue', moneyShort(f.revenue), 'excluding VAT', true], ['Gross profit', moneyShort(f.gross), pctOfRev(f.gross, f)], ['Operating expenses', moneyShort(f.opTotal)], ['Net profit', moneyShort(f.net), pctOfRev(f.net, f)]])}
      <div class="panel"><table class="statement"><tbody>
        <tr class="static sec"><td colspan="2">Revenue</td></tr>
        ${line('Invoiced sales (excl. VAT)', f.sales)}${f.credits ? line('Less credit notes applied', -f.credits) : ''}
        ${line('Total revenue', f.revenue, 'sub')}
        <tr class="static sec"><td colspan="2">Cost of sales</td></tr>
        ${line('Procurement orders and purchases', f.cogs)}
        ${line(`Gross profit${f.revenue ? ` <span class="muted">(${((f.gross / f.revenue) * 100).toFixed(1)}%)</span>` : ''}`, f.gross, 'sub')}
        <tr class="static sec"><td colspan="2">Operating expenses</td></tr>
        ${Object.entries(f.opex).sort((a, b) => b[1] - a[1]).map(([k, v]) => line(esc(k), v)).join('') || '<tr class="static"><td class="muted" colspan="2">No operating expenses in this period</td></tr>'}
        ${line('Total operating expenses', f.opTotal, 'sub')}
        ${line(`Net profit${f.revenue ? ` <span class="muted">(${((f.net / f.revenue) * 100).toFixed(1)}%)</span>` : ''}`, f.net, 'grand')}
      </tbody></table>
      <p class="page-sub" style="margin:14px 0 0">Figures exclude VAT. Cost of sales counts procurement orders that are Ordered, In transit or Delivered, plus expenses in the Purchases category.</p></div></div>`;
  };

  PAGES.cashflow = function () {
    const s = db.settings(), opening0 = Number(s.openingCash) || 0;
    const [a, b] = monthRange(0);
    const pays = db.all('payments'), exps = db.all('expenses');
    const openM = opening0 + sum(pays.filter((p) => p.date < a), (p) => p.amount) - sum(exps.filter((e) => e.date < a), (e) => e.amount);
    const cin = sum(pays.filter((p) => inRange(p.date, [a, b])), (p) => p.amount), cout = sum(exps.filter((e) => inRange(e.date, [a, b])), (e) => e.amount);
    const now = new Date(), mon = new Date(now.getFullYear(), now.getMonth(), now.getDate() - ((now.getDay() + 6) % 7));
    const weeks = [];
    for (let k = 5; k >= 0; k--) {
      const st = new Date(mon); st.setDate(mon.getDate() - 7 * k); const en = new Date(st); en.setDate(st.getDate() + 6);
      const r = [GT.iso(st), GT.iso(en)];
      weeks.push({ label: `${st.getDate()} ${MONTHS[st.getMonth()].slice(0, 3)}`, cin: sum(pays.filter((p) => inRange(p.date, r)), (p) => p.amount), cout: sum(exps.filter((e) => inRange(e.date, r)), (e) => e.amount) });
    }
    const max = Math.max(1, ...weeks.map((w) => Math.max(w.cin, w.cout)));
    main.innerHTML = `<div class="page">${head('Cash flow')}${subhead(`${MONTHS[now.getMonth()]} to date. Cash in is payments received; cash out is expenses (including paid payroll).`)}
      ${!opening0 && GT.can('settings') ? '<a class="notice" href="#/settings"><b>Set your starting cash balance for accurate balances</b><span>Settings →</span></a>' : ''}
      ${kpiRow([['Opening balance', moneyShort(openM), `1 ${MONTHS[now.getMonth()]}`], ['Cash in', moneyShort(cin)], ['Cash out', moneyShort(cout)], ['Closing balance', moneyShort(openM + cin - cout), 'today', true]])}
      <div class="panel"><h3>Weekly cash in vs cash out <span class="legend"><span><i style="background:var(--orange)"></i>Cash in</span><span><i style="background:#3b3b44"></i>Cash out</span></span></h3>
        <div class="chart">${weeks.map((w) => `<div class="col"><div class="bars"><div class="bar rev" style="height:${(w.cin / max) * 100}%" data-v="${moneyShort(w.cin)}"></div><div class="bar exp" style="height:${(w.cout / max) * 100}%" data-v="${moneyShort(w.cout)}"></div></div></div>`).join('')}</div>
        <div class="chart-x">${weeks.map((w) => `<span>${w.label}</span>`).join('')}</div></div></div>`;
  };

  let vatYm = null;
  PAGES.vat = function () {
    vatYm = vatYm || today().slice(0, 7);
    const [y, m] = vatYm.split('-').map(Number), r = [vatYm + '-01', GT.iso(new Date(y, m, 0))];
    const out = db.all('invoices').filter((i) => i.status !== 'Draft' && i.taxOn && inRange(i.date, r)).map((i) => { const t = totals(i); return { date: i.date, type: 'Output', ref: i.number, who: clientName(i), base: t.subtotal - t.discount, vat: t.tax }; });
    const inp = db.all('expenses').filter((e) => Number(e.vat) > 0 && inRange(e.date, r)).map((e) => ({ date: e.date, type: 'Input', ref: e.desc, who: nm('vendors', e.vendorId), base: (Number(e.amount) || 0) - Number(e.vat), vat: Number(e.vat) }));
    const rows = out.concat(inp).sort((a, b) => b.date.localeCompare(a.date));
    const o = sum(out, (x) => x.vat), i = sum(inp, (x) => x.vat);
    main.innerHTML = `<div class="page">${head('VAT summary')}
      <div class="month-pill vat-nav"><button data-vatnav="-1" aria-label="Previous month">${ic('chevL', 'i" style="width:16px;height:16px')}</button><span>${ic('cal', 'i" style="width:18px;height:18px')}${monthName(vatYm)}</span><button data-vatnav="1" aria-label="Next month">${ic('chevR', 'i" style="width:16px;height:16px')}</button></div>
      ${subhead(`VAT at ${Number(db.settings().taxRate)}%: output VAT on your invoices vs input VAT on expenses. Enter “VAT paid” when logging an expense to claim input VAT.`)}
      ${kpiRow([['Output VAT (on sales)', money(o)], ['Input VAT (on purchases)', money(i)], ['Net VAT payable', money(o - i), o - i < 0 ? 'refundable' : 'for this month', true]])}
      <div class="table-wrap"><table><thead><tr><th>Date</th><th>Type</th><th>Reference</th><th>Client / supplier</th><th class="r">Base amount</th><th class="r">VAT</th></tr></thead><tbody>
      ${rows.map((x) => `<tr class="static"><td data-label="Date">${fmtD(x.date)}</td><td data-label="Type">${chip(x.type === 'Output' ? 'Request' : 'Ordered', x.type)}</td><td data-label="Reference">${esc(x.ref)}</td><td data-label="Client / supplier">${esc(x.who)}</td><td class="r tnum" data-label="Base amount">${money(x.base)}</td><td class="r tnum" data-label="VAT">${money(x.vat)}</td></tr>`).join('') || '<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:40px">No VAT transactions this month.</td></tr>'}
      </tbody></table></div></div>`;
  };

  /* ---------- HR: staff, attendance, payroll ---------- */
  PAGES.employees = function () {
    const es = db.all('employees'), active = es.filter((e) => e.status !== 'Exited');
    const showPay = GT.can('read', 'payroll') || GT.can('write', 'employees');
    tablePage({ key: 'em', title: 'Staff', col: 'employees', addLabel: 'ADD STAFF',
      extraTop: subhead('Employee directory (separate from admin accounts)')
        + kpiRow([['Headcount', active.length, '', true], ['On leave', es.filter((e) => e.status === 'On leave').length], showPay ? ['Monthly payroll', moneyShort(sum(active, (e) => e.salary)), 'gross'] : ['Departments', new Set(active.map((e) => e.department)).size]]),
      columns: [{ label: 'Name', get: (r) => r.name }, { label: 'Job title', get: (r) => r.role || '—' }, { label: 'Department', get: (r) => r.department || '—' }, { label: 'Phone', get: (r) => r.phone || '—' },
        { label: 'Joined', get: (r) => (r.joined ? fmtD(r.joined) : '—') }].concat(showPay ? [{ label: 'Salary', r: true, get: (r) => money(r.salary) }] : []).concat([{ label: 'Status', html: true, get: (r) => sc(r.status) }]) });
  };

  let attDate = null;
  PAGES.attendance = function () {
    attDate = attDate || today();
    const emps = db.all('employees').filter((e) => e.status !== 'Exited');
    const recs = db.all('attendance').filter((a) => a.date === attDate);
    const recOf = (id) => recs.find((a) => a.employeeId === id);
    const count = (st) => emps.filter((e) => (recOf(e.id) || {}).status === st).length;
    const unmarked = emps.filter((e) => !recOf(e.id)).length;
    const canW = GT.can('write', 'attendance');
    main.innerHTML = `<div class="page">${head('Attendance')}
      <div class="date-nav"><button class="chip-btn" data-attnav="-1" aria-label="Previous day">${ic('chevL')}</button><input type="date" value="${attDate}" data-attdate aria-label="Date"><button class="chip-btn" data-attnav="1" aria-label="Next day">${ic('chevR')}</button>${attDate !== today() ? '<button class="ghost" data-attnav="0">Today</button>' : ''}</div>
      ${kpiRow([['Present', count('Present'), '', true], ['Late', count('Late')], ['On leave', count('On leave')], ['Absent', count('Absent')]])}
      ${unmarked ? subhead(`${unmarked} of ${emps.length} not marked yet${canW ? ' — tap a status to mark them' : ''}`) : ''}
      <div class="table-wrap"><table><thead><tr><th>Staff</th><th>Department</th><th>Clock in</th><th>Clock out</th><th>Status</th>${canW ? '<th>Mark</th>' : ''}</tr></thead><tbody>
      ${emps.map((e) => { const r = recOf(e.id) || {}; return `<tr data-att="${e.id}"><td data-label="Staff">${esc(e.name)}</td><td data-label="Department">${esc(e.department || '—')}</td><td data-label="Clock in" class="tnum">${esc(r.clockIn || '—')}</td><td data-label="Clock out" class="tnum">${esc(r.clockOut || '—')}</td><td data-label="Status">${r.status ? sc(r.status) : '<span class="muted">Not marked</span>'}</td>${canW ? `<td data-label="Mark"><div class="mark-seg">${['Present', 'Late', 'On leave', 'Absent'].map((st) => `<button type="button" data-mark="${e.id}|${st}" class="${r.status === st ? 'on' : ''}">${st}</button>`).join('')}</div></td>` : ''}</tr>`; }).join('') || `<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:40px">Add staff under HR &amp; payroll → Staff first.</td></tr>`}
      </tbody></table></div></div>`;
  };
  function markAttendance(eid, st) {
    const r = db.all('attendance').find((a) => a.date === attDate && a.employeeId === eid);
    const patch = { status: st };
    if ((st === 'Present' || st === 'Late') && !(r && r.clockIn) && attDate === today()) patch.clockIn = new Date().toTimeString().slice(0, 5);
    if (r) db.update('attendance', r.id, patch); else db.insert('attendance', { date: attDate, employeeId: eid, clockIn: '', clockOut: '', note: '', ...patch });
    PAGES.attendance();
  }
  function attendanceModal(eid) {
    const e = db.get('employees', eid); if (!e) return;
    const r = db.all('attendance').find((a) => a.date === attDate && a.employeeId === eid);
    formModal(`${e.name} · ${fmtLong(attDate)}`, [
      { name: 'status', label: 'Status', type: 'select', options: ['Present', 'Late', 'On leave', 'Absent'] },
      { name: 'clockIn', label: 'Clock in', type: 'time', half: true }, { name: 'clockOut', label: 'Clock out', type: 'time', half: true },
      { name: 'note', label: 'Note', type: 'textarea', rows: 2 }],
    r || { status: 'Present' }, (d) => { if (r) db.update('attendance', r.id, d); else db.insert('attendance', { date: attDate, employeeId: eid, ...d }); toast('Attendance saved'); PAGES.attendance(); },
    r ? { onDelete: () => { db.remove('attendance', r.id); PAGES.attendance(); } } : {});
  }

  let payRun = null;
  PAGES.payroll = function () {
    const runs = db.all('payroll').slice().sort((a, b) => (b.period || '').localeCompare(a.period || ''));
    const sel = runs.find((r) => r.id === payRun) || runs[0];
    const canW = GT.can('write', 'payroll');
    const cell = (lbl, v, b) => `<td class="r tnum" data-label="${lbl}">${b ? '<b>' : ''}${money(v)}${b ? '</b>' : ''}</td>`;
    main.innerHTML = `<div class="page">${head('Payroll', { label: 'RUN PAYROLL', act: 'run-payroll' })}${subhead('Monthly runs from staff salaries, with PAYE and pension deductions. Marking a run as paid logs it as a salary expense.')}
      <div class="grid2 payroll-grid"><div class="panel"><h3>Payroll runs</h3>
        ${runs.map((r) => `<div class="mini-row${sel && r.id === sel.id ? ' sel' : ''}" data-run="${r.id}"><div>${monthName(r.period)}<small>${(r.lines || []).length} staff · net ${money(r.net)}</small></div>${sc(r.status)}</div>`).join('') || '<p class="muted" style="padding:8px 0">No payroll runs yet.</p>'}</div>
      <div class="panel">${sel ? `<h3>${monthName(sel.period)} breakdown ${sc(sel.status)}</h3>
        <div class="table-wrap flat"><table><thead><tr><th>Staff</th><th class="r">Gross</th><th class="r">PAYE + pension</th><th class="r">Net</th></tr></thead><tbody>
          ${(sel.lines || []).map((l) => `<tr class="static"><td data-label="Staff">${esc(l.name)}</td>${cell('Gross', l.gross)}${cell('Deductions', l.deductions)}${cell('Net', l.net)}</tr>`).join('')}
          <tr class="static total"><td data-label="Total"><b>Total</b></td>${cell('Gross', sel.gross, 1)}${cell('Deductions', sel.deductions, 1)}${cell('Net', sel.net, 1)}</tr></tbody></table></div>
        ${canW ? `<div class="modal-foot">${sel.status !== 'Paid' ? '<button class="ghost danger left" data-payact="del">Delete run</button><button class="pill-btn solid" data-payact="paid">Mark as paid</button>' : `<span class="muted left">Paid ${fmtLong(sel.paidDate || sel.date)}${sel.expenseId ? ' · logged as a salary expense' : ''}</span>`}</div>` : ''}`
        : '<h3>Breakdown</h3><p class="muted">Run payroll to see a breakdown.</p>'}</div></div></div>${fab('RUN PAYROLL', 'run-payroll')}`;
  };
  function runPayrollModal() {
    if (!GT.can('write', 'payroll')) return toast("Your role doesn't allow this");
    const emps = db.all('employees').filter((e) => e.status !== 'Exited' && Number(e.salary) > 0);
    if (!emps.length) return toast('Add staff with a monthly salary first');
    const m = formModal('Run payroll', [{ name: 'period', label: 'Month', type: 'month', required: true, half: true }, { name: 'pct', label: 'Deductions % (PAYE + pension)', type: 'number', step: 'any', min: 0, half: true }],
      { period: today().slice(0, 7), pct: Number(db.settings().payrollDeductionPct ?? 10) }, (d) => {
        if (db.all('payroll').some((r) => r.period === d.period)) { toast(`There is already a payroll run for ${monthName(d.period)}`); return; }
        const lines = emps.map((e) => { const gross = Number(e.salary) || 0, ded = Math.round(gross * (Number(d.pct) || 0)) / 100; return { employeeId: e.id, name: e.name, gross, deductions: ded, net: gross - ded }; });
        const rec = db.insert('payroll', { period: d.period, date: today(), pct: Number(d.pct) || 0, status: 'Processing', lines, gross: sum(lines, (l) => l.gross), deductions: sum(lines, (l) => l.deductions), net: sum(lines, (l) => l.net) });
        payRun = rec.id; toast('Payroll run created'); PAGES.payroll();
      });
    $('.modal-foot', m).insertAdjacentHTML('beforebegin', `<p class="page-sub" style="margin:-4px 0 12px">${emps.length} active staff with salaries · total gross ${money(sum(emps, (e) => e.salary))}</p>`);
  }
  function payAction(a) {
    const runs = db.all('payroll').slice().sort((x, y) => (y.period || '').localeCompare(x.period || ''));
    const sel = runs.find((r) => r.id === payRun) || runs[0]; if (!sel) return;
    if (a === 'del') { if (confirm(`Delete the ${monthName(sel.period)} payroll run?`)) { db.remove('payroll', sel.id); payRun = null; PAGES.payroll(); } return; }
    if (a === 'paid') {
      const patch = { status: 'Paid', paidDate: today() };
      if (GT.can('write', 'expenses')) {
        const exp = db.insert('expenses', { date: today(), category: 'Salaries', desc: `Payroll — ${monthName(sel.period)}`, amount: sel.gross, vendorId: '', vat: 0, payrollId: sel.id });
        patch.expenseId = exp.id;
      }
      db.update('payroll', sel.id, patch); toast('Payroll marked as paid'); PAGES.payroll();
    }
  }

  /* ---------- module clicks ---------- */
  function moduleClick(e) {
    const t = e.target; let x;
    if (t.closest('[data-stop]')) return true;
    if ((x = t.closest('[data-adv]'))) { advanceDeal(x.dataset.adv); return true; }
    if ((x = t.closest('[data-rtab]'))) { rTab = x.dataset.rtab; PAGES.returns(); return true; }
    if ((x = t.closest('[data-mark]'))) { const [eid, st] = x.dataset.mark.split('|'); markAttendance(eid, st); return true; }
    if ((x = t.closest('[data-attnav]'))) { const n = Number(x.dataset.attnav); if (!n) attDate = today(); else { const d = pd(attDate); d.setDate(d.getDate() + n); attDate = GT.iso(d); } PAGES.attendance(); return true; }
    if ((x = t.closest('[data-att]'))) { if (GT.can('write', 'attendance')) attendanceModal(x.dataset.att); return true; }
    if ((x = t.closest('[data-run]'))) { payRun = x.dataset.run; PAGES.payroll(); return true; }
    if ((x = t.closest('[data-payact]'))) { payAction(x.dataset.payact); return true; }
    if ((x = t.closest('[data-pl]'))) { plPeriod = x.dataset.pl; PAGES.pnl(); return true; }
    if ((x = t.closest('[data-vatnav]'))) { const [y, m] = vatYm.split('-').map(Number); vatYm = GT.iso(new Date(y, m - 1 + Number(x.dataset.vatnav), 1)).slice(0, 7); PAGES.vat(); return true; }
    if (t.closest('[data-act="run-payroll"]')) { runPayrollModal(); return true; }
    return false;
  }
  main.addEventListener('change', (e) => { if (e.target.matches('[data-attdate]') && e.target.value) { attDate = e.target.value; PAGES.attendance(); } });


  /* ================= EVENTS ================= */
  main.addEventListener('click', (e) => {
    if (moduleClick(e)) return;
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
    if (/^add-/.test(act) && act !== 'add-staff' && FIELDS[act.slice(4)]) return editRecord(act.slice(4));
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
        (clear ? GT.clearAll() : GT.loadDemo()).then(() => GT.load()).then(() => { toast(clear ? 'All records deleted' : 'Demo data loaded'); route(); }).catch((err) => toast(err.message));
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

  // Animated brand backdrop for sign-in screens. If GT_CONFIG.signinVideo is set
  // (e.g. a Higgsfield clip in assets/video/), it plays underneath the light effects.
  function authBg() {
    const v = (window.GT_CONFIG && window.GT_CONFIG.signinVideo) || '';
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const src = v && (/^(https?:)?\//.test(v) ? v : '../' + v);
    return `<div class="auth-bg" aria-hidden="true">
      ${src ? `<video class="auth-video" src="${esc(src)}" muted loop playsinline preload="metadata" ${calm ? '' : 'autoplay'}></video>` : ''}
      <div class="ab-glow g1"></div><div class="ab-glow g2"></div><div class="ab-glow g3"></div>
      <div class="ab-grid"></div>
      <img class="ab-mark" src="../assets/mark.svg" alt="">
      <span class="ab-route r1"></span><span class="ab-route r2"></span><span class="ab-route r3"></span><span class="ab-route r4"></span>
      <div class="ab-grain"></div><div class="ab-vignette"></div>
    </div>`;
  }
  const AUTH = {
    setup: { title: 'Set up your admin', sub: 'Create the head admin account. This is a one-time step: the head admin approves every other admin.', fields: ['name', 'email', 'password'], btn: 'Create Owner account' },
    login: { title: 'Staff sign-in', sub: 'Sign in to manage clients, procurement and invoices.', fields: ['email', 'password'], btn: 'Sign in' },
    signup: { title: 'Request admin access', sub: 'After you confirm your email, the head admin reviews your request and decides which sections you can use.', fields: ['name', 'email', 'password'], btn: 'Request access' },
    reset: { title: 'Reset your password', sub: "Enter your email and we'll send you a link to choose a new password.", fields: ['email'], btn: 'Send reset link' },
    newpass: { title: 'Choose a new password', sub: 'Enter a new password for your account.', fields: ['password'], btn: 'Save password' },
  };
  function authScreen(mode, note = '', noteKind = '') {
    booted = false;
    document.body.classList.remove('booting');
    document.body.classList.add('auth-mode');
    const A = AUTH[mode];
    const F = {
      name: field({ name: 'name', label: 'Your name', required: true }),
      email: field({ name: 'email', label: 'Email', type: 'email', required: true }),
      password: field({ name: 'password', label: mode === 'login' ? 'Password' : 'Password (at least 8 characters)', type: 'password', required: true }),
    };
    const links = {
      login: '<a href="#" data-auth="reset">Forgot password?</a><a href="#" data-auth="signup">Request admin access</a>',
      signup: '<a href="#" data-auth="login">Already have an account? Sign in</a>',
      reset: '<a href="#" data-auth="login">Back to sign-in</a>',
    }[mode] || '';
    main.innerHTML = `<div class="auth">${authBg()}<form class="auth-card" novalidate>
      <img src="../assets/logo-black.svg" alt="Gorpat Trading Limited">
      <h1>${A.title}</h1>
      <p class="auth-sub">${A.sub}</p>
      ${note ? `<p class="auth-note ${noteKind}">${esc(note)}</p>` : ''}
      ${A.fields.map((f) => F[f]).join('')}
      <p class="auth-err" role="alert"></p>
      <button class="pill-btn solid auth-btn" type="submit">${A.btn}</button>
      ${links ? `<div class="auth-links">${links}</div>` : ''}
      <a class="auth-back" href="../">← Back to website</a>
    </form></div>`;
    const form = $('.auth-card');
    const em = $('[name=email]', form); if (em) em.setAttribute('autocomplete', 'username');
    const pw = $('[name=password]', form); if (pw) pw.setAttribute('autocomplete', mode === 'login' ? 'current-password' : 'new-password');
    setTimeout(() => { const i = form.querySelector('input'); if (i) i.focus(); }, 30);
    form.addEventListener('click', (e) => { const a = e.target.closest('[data-auth]'); if (a) { e.preventDefault(); authScreen(a.dataset.auth); } });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const d = Object.fromEntries(new FormData(form));
      const err = $('.auth-err', form); const btn = $('.auth-btn', form);
      if ((mode === 'setup' || mode === 'signup' || mode === 'newpass') && String(d.password || '').length < 8) { err.textContent = 'Password must be at least 8 characters'; return; }
      btn.disabled = true; err.textContent = '';
      try {
        if (mode === 'login') { await GT.auth.signIn(d.email.trim(), d.password); return await start(); }
        if (mode === 'setup' || mode === 'signup') {
          const r = await GT.auth.signUp(d.name.trim(), d.email.trim(), d.password);
          if (!r.confirm) return await start();
          return authScreen('login', `We've sent a confirmation link to ${d.email.trim()}. Open it, then sign in here.`, 'ok');
        }
        if (mode === 'reset') { await GT.auth.sendReset(d.email.trim()); return authScreen('login', 'If that email has an account, a reset link is on its way.', 'ok'); }
        if (mode === 'newpass') { await GT.auth.setPassword(d.password); toast('Password updated'); return await start(); }
      } catch (ex) { err.textContent = ex.message; btn.disabled = false; }
    });
  }
  function waitingScreen(me) {
    booted = false;
    document.body.classList.remove('booting');
    document.body.classList.add('auth-mode');
    const disabled = me.role === 'Disabled';
    main.innerHTML = `<div class="auth">${authBg()}<div class="auth-card">
      <img src="../assets/logo-black.svg" alt="Gorpat Trading Limited">
      <h1>${disabled ? 'Account disabled' : 'Waiting for approval'}</h1>
      <p class="auth-sub">${disabled ? 'This account no longer has access. Contact the head admin if you think this is a mistake.' : `You're signed in as <b>${esc(me.email)}</b>. The head admin needs to approve your account and choose what you can access. Once they have, press Check again.`}</p>
      <button class="pill-btn solid auth-btn" data-w="again">Check again</button>
      <div class="auth-links"><a href="#" data-w="out">Sign out</a></div>
    </div></div>`;
    main.querySelector('.auth-card').addEventListener('click', async (e) => {
      const w = e.target.closest('[data-w]'); if (!w) return; e.preventDefault();
      if (w.dataset.w === 'out') { await GT.auth.signOut(); return authScreen('login'); }
      start().catch((ex) => toast(ex.message));
    });
  }

  async function start() {
    const c = await GT.load();
    if (!['Owner', 'Procurement', 'Finance'].includes(c.user.role)) return waitingScreen(c.user);
    document.body.classList.remove('auth-mode', 'booting');
    booted = true;
    if (!location.hash || location.hash === '#') history.replaceState(null, '', '#/overview');
    route();
  }

  (async function boot() {
    try {
      const back = GT.auth.consumeRedirect();
      if (back && back.error) return authScreen('login', back.error);
      if (back && back.type === 'recovery') { await GT.auth.whoami(); return authScreen('newpass'); }
      if (back) { await GT.auth.whoami(); return await start(); }
      if (GT.auth.signedIn) {
        try { return await start(); } catch (e) { if (e.status !== 401) throw e; await GT.auth.signOut(); }
      }
      if (await GT.auth.needsSetup()) return authScreen('setup');
      authScreen('login');
    } catch (e) {
      document.body.classList.remove('booting'); document.body.classList.add('auth-mode');
      main.innerHTML = `<div class="auth">${authBg()}<div class="auth-card"><h1>Can't reach the database</h1><p class="auth-sub">${esc(e.message)}. Check your internet connection and reload this page. If this is a new install, make sure <code>supabase/schema.sql</code> has been run in the Supabase SQL Editor.</p></div></div>`;
    }
  })();
})();
