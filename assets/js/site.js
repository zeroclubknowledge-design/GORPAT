(function () {
  const $ = (s, el = document) => el.querySelector(s);
  $('#yr').textContent = new Date().getFullYear();

  // mobile menu
  const toggle = $('.menu-toggle'), pill = $('.navpill');
  toggle.addEventListener('click', () => { const o = pill.classList.toggle('open'); toggle.setAttribute('aria-expanded', o); });
  pill.addEventListener('click', (e) => { if (e.target.tagName === 'A') { pill.classList.remove('open'); toggle.setAttribute('aria-expanded', false); } });

  // hero image fallback
  const hero = $('.hero-bg');
  hero.addEventListener('error', () => hero.remove());

  // reveal on scroll
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
  document.querySelectorAll('.split, .spec, .cond, .ind, .panel').forEach((el, i) => { el.classList.add('reveal'); el.style.transitionDelay = (i % 3) * 70 + 'ms'; io.observe(el); });

  // quantity stepper
  document.querySelectorAll('.stepper').forEach((st) => {
    const inp = $('input', st);
    st.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; inp.value = Math.max(1, (parseInt(inp.value, 10) || 1) + Number(b.dataset.step)); });
  });

  function validate(form) {
    let ok = true;
    form.querySelectorAll('[required]').forEach((f) => {
      const bad = f.type === 'checkbox' ? !f.checked : !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
      (f.closest('.phone') || f).classList.toggle('invalid', bad);
      if (bad) ok = false;
    });
    return ok;
  }
  function msg(form, text, cls) { const m = $('.form-msg', form); m.textContent = text; m.className = 'form-msg ' + cls; }

  async function submit(f, endpoint, data, okText) {
    const btn = $('.submit', f);
    btn.disabled = true; msg(f, 'Sending…', '');
    try {
      const C = window.GT_CONFIG;
      const res = await fetch(`${C.supabaseUrl}/rest/v1/rpc/submit_${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: C.supabaseAnonKey, Authorization: 'Bearer ' + C.supabaseAnonKey },
        body: JSON.stringify({ p: data }),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((out && out.message) || 'Something went wrong.');
      f.reset();
      msg(f, okText, 'ok');
    } catch (err) {
      msg(f, (err.message && err.message !== 'Failed to fetch' ? err.message : 'We could not send this right now.') + ' You can also call +234-08033102870 or email Gorpatltd@yahoo.com.', 'err');
    } finally { btn.disabled = false; }
  }

  // quotation request → admin "Quotations" (as a website request)
  $('#quoteForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    if (!validate(f)) return msg(f, 'Please fill in the highlighted fields.', 'err');
    const d = Object.fromEntries(new FormData(f));
    d.phone = '+234 ' + d.phone;
    submit(f, 'quote', d, 'Thank you. Your request has been received and our team will send a quotation shortly.');
  });

  // client enquiry → admin "Clients › Enquiries"
  $('#enquiryForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    if (!validate(f)) return msg(f, 'Please fill in the highlighted fields.', 'err');
    submit(f, 'enquiry', Object.fromEntries(new FormData(f)), 'Thank you. We will reply to your enquiry within one business day.');
  });
})();
