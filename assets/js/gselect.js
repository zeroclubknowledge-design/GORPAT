/* GORPAT dropdown — replaces the browser's own option picker with the brand's glassy
 * orange card, on the website and in the admin. Every <select> is enhanced automatically,
 * including ones added later. The real <select> stays in the form (hidden), so form
 * submission, validation and FormData keep working unchanged.
 * Phones (≤600px): bottom sheet. Larger screens: dropdown under the field.
 * Keyboard: ↑/↓, Home/End, Enter/Space to choose, Esc/Tab to close, type to jump. */
(function () {
  const MOBILE = window.matchMedia('(max-width: 600px)');
  const CALM = window.matchMedia('(prefers-reduced-motion: reduce)');
  const CHEVRON = '<svg class="gs-chev" viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.5 6 6.5l5-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const CHECK = '<svg class="gs-check" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 10.5 8.5 14 15 6.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  let uid = 0;
  let open = null; // { sel, trig, pop, scrim, items, idx }

  function labelFor(sel) {
    const l = sel.closest('label');
    if (!l) return sel.getAttribute('aria-label') || '';
    const t = Array.from(l.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent).join(' ').trim();
    return t || sel.name || '';
  }

  function sync(sel) {
    const trig = sel._gsTrig; if (!trig) return;
    const opt = sel.options[sel.selectedIndex];
    const v = trig.querySelector('.gs-value');
    v.textContent = opt ? opt.text : '';
    trig.classList.toggle('gs-placeholder', !opt || opt.value === '' && /^(choose|select|—|-)/i.test(opt.text.trim()));
    trig.classList.toggle('invalid', sel.classList.contains('invalid'));
    trig.disabled = sel.disabled;
  }

  function enhance(sel) {
    if (sel._gsTrig || sel.multiple || sel.size > 1 || sel.hasAttribute('data-native')) return;
    const trig = document.createElement('button');
    trig.type = 'button';
    trig.className = 'gs-trigger';
    trig.setAttribute('aria-haspopup', 'listbox');
    trig.setAttribute('aria-expanded', 'false');
    trig.innerHTML = '<span class="gs-value"></span>' + CHEVRON;
    sel.classList.add('gs-native');
    sel.tabIndex = -1;
    sel.setAttribute('aria-hidden', 'true');
    sel.parentNode.insertBefore(trig, sel); // first labelable element → the <label> opens it
    sel._gsTrig = trig;
    trig._gsSel = sel;
    sync(sel);
    sel.addEventListener('change', () => sync(sel));
    new MutationObserver(() => sync(sel)).observe(sel, { attributes: true, attributeFilter: ['class', 'disabled'], childList: true, subtree: true });
    const form = sel.form;
    if (form && !form._gsReset) { form._gsReset = true; form.addEventListener('reset', () => setTimeout(() => form.querySelectorAll('select').forEach(sync))); }
    trig.addEventListener('click', (e) => { e.preventDefault(); open && open.sel === sel ? close() : show(sel); });
    trig.addEventListener('keydown', (e) => {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); show(sel); }
    });
  }

  function show(sel) {
    close(true);
    const trig = sel._gsTrig;
    const id = 'gs-list-' + (++uid);
    const sheet = MOBILE.matches;
    const scrim = document.createElement('div');
    scrim.className = 'gs-scrim' + (sheet ? ' sheet' : '');
    const pop = document.createElement('div');
    pop.className = 'gs-pop' + (sheet ? ' sheet' : '');
    const title = labelFor(sel);
    const opts = Array.from(sel.options);
    pop.innerHTML = `${sheet ? '<span class="gs-grab" aria-hidden="true"></span>' : ''}${sheet && title ? `<div class="gs-title">${escapeHtml(title)}</div>` : ''}
      <ul class="gs-list" role="listbox" id="${id}" tabindex="-1"${title ? ` aria-label="${escapeHtml(title)}"` : ''}>
        ${opts.map((o, i) => `<li role="option" id="${id}-${i}" class="gs-opt${o.disabled ? ' disabled' : ''}" data-i="${i}" aria-selected="${i === sel.selectedIndex}"${o.disabled ? ' aria-disabled="true"' : ''}><span>${escapeHtml(o.text)}</span>${CHECK}</li>`).join('')}
      </ul>`;
    document.body.append(scrim, pop);
    const list = pop.querySelector('.gs-list');
    const items = Array.from(pop.querySelectorAll('.gs-opt'));
    open = { sel, trig, pop, scrim, list, items, idx: Math.max(0, sel.selectedIndex) };
    trig.setAttribute('aria-expanded', 'true');
    trig.setAttribute('aria-controls', id);
    if (sheet) document.documentElement.classList.add('gs-lock'); else place();
    requestAnimationFrame(() => { pop.classList.add('in'); scrim.classList.add('in'); });
    focusItem(open.idx, true);
    list.focus({ preventScroll: true });

    pop.addEventListener('click', (e) => { const li = e.target.closest('.gs-opt'); if (li) choose(Number(li.dataset.i)); });
    pop.addEventListener('mousemove', (e) => { const li = e.target.closest('.gs-opt'); if (li && Number(li.dataset.i) !== open.idx) focusItem(Number(li.dataset.i)); });
    pop.addEventListener('keydown', onKey);
    scrim.addEventListener('click', () => close());
  }

  function place() {
    if (!open || open.pop.classList.contains('sheet')) return;
    const r = open.trig.getBoundingClientRect();
    const pop = open.pop;
    const w = Math.max(r.width, 220);
    pop.style.width = w + 'px';
    pop.style.left = Math.min(Math.max(8, r.left), window.innerWidth - w - 8) + 'px';
    const below = window.innerHeight - r.bottom - 12, above = r.top - 12;
    const max = Math.min(340, Math.max(below, above));
    pop.style.maxHeight = max + 'px';
    if (below >= Math.min(260, pop.scrollHeight) || below >= above) { pop.style.top = (r.bottom + 6) + 'px'; pop.style.bottom = ''; pop.classList.remove('up'); }
    else { pop.style.top = ''; pop.style.bottom = (window.innerHeight - r.top + 6) + 'px'; pop.classList.add('up'); }
  }

  function focusItem(i, center) {
    if (!open) return;
    const n = open.items.length; if (!n) return;
    i = (i + n) % n;
    open.items.forEach((li, k) => li.classList.toggle('active', k === i));
    open.idx = i;
    open.list.setAttribute('aria-activedescendant', open.items[i].id);
    const li = open.items[i];
    const lt = open.list.getBoundingClientRect(), r = li.getBoundingClientRect();
    if (center) open.list.scrollTop = li.offsetTop - open.list.clientHeight / 2 + li.offsetHeight / 2;
    else if (r.top < lt.top) open.list.scrollTop -= lt.top - r.top + 4;
    else if (r.bottom > lt.bottom) open.list.scrollTop += r.bottom - lt.bottom + 4;
  }
  function step(d) {
    let i = open.idx;
    for (let k = 0; k < open.items.length; k++) { i = (i + d + open.items.length) % open.items.length; if (!open.items[i].classList.contains('disabled')) break; }
    focusItem(i);
  }

  let typed = '', typedT;
  function onKey(e) {
    if (!open) return;
    const k = e.key;
    if (k === 'ArrowDown') { e.preventDefault(); step(1); }
    else if (k === 'ArrowUp') { e.preventDefault(); step(-1); }
    else if (k === 'Home') { e.preventDefault(); focusItem(0); }
    else if (k === 'End') { e.preventDefault(); focusItem(open.items.length - 1); }
    else if (k === 'Enter' || k === ' ') { e.preventDefault(); choose(open.idx); }
    else if (k === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
    else if (k === 'Tab') { close(); }
    else if (k.length === 1 && /\S/.test(k)) {
      typed += k.toLowerCase(); clearTimeout(typedT); typedT = setTimeout(() => { typed = ''; }, 600);
      const i = open.items.findIndex((li) => li.textContent.trim().toLowerCase().startsWith(typed));
      if (i >= 0) focusItem(i);
    }
  }

  function choose(i) {
    const { sel, items } = open;
    if (items[i].classList.contains('disabled')) return;
    const changed = sel.selectedIndex !== i;
    sel.selectedIndex = i;
    close();
    sync(sel);
    if (changed) { sel.dispatchEvent(new Event('input', { bubbles: true })); sel.dispatchEvent(new Event('change', { bubbles: true })); }
  }

  function close(instant) {
    if (!open) return;
    const { pop, scrim, trig } = open;
    open = null;
    trig.setAttribute('aria-expanded', 'false');
    trig.removeAttribute('aria-controls');
    document.documentElement.classList.remove('gs-lock');
    if (instant || CALM.matches) { pop.remove(); scrim.remove(); }
    else { pop.classList.remove('in'); scrim.classList.remove('in'); setTimeout(() => { pop.remove(); scrim.remove(); }, 180); }
    if (!instant && document.contains(trig)) trig.focus({ preventScroll: true });
  }

  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  window.addEventListener('resize', () => { if (open) { if (MOBILE.matches !== open.pop.classList.contains('sheet')) close(true); else place(); } });
  window.addEventListener('scroll', (e) => { if (open && !open.pop.contains(e.target)) { if (open.pop.classList.contains('sheet')) return; if (document.contains(open.trig)) place(); else close(true); } }, true);
  window.addEventListener('hashchange', () => close(true));

  function scan(root) { (root.querySelectorAll ? root : document).querySelectorAll('select').forEach(enhance); if (root.tagName === 'SELECT') enhance(root); }
  new MutationObserver((muts) => {
    for (const m of muts) for (const n of m.addedNodes) if (n.nodeType === 1) scan(n);
    if (open && !document.contains(open.trig)) close(true);
  }).observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => scan(document)); else scan(document);
  window.GTSelect = { refresh: (sel) => (sel ? sync(sel) : document.querySelectorAll('select').forEach(sync)) };
})();
