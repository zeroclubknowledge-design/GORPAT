/* Demo business records for exploring the admin (Owner → Staff & settings → Load demo data). */
(function () {
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return iso(d); };

  function totals(doc) {
    const subtotal = (doc.items || []).reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.rate) || 0), 0);
    const d = doc.discount || { type: 'percent', value: 0 };
    const discount = d.type === 'percent' ? subtotal * (Number(d.value) || 0) / 100 : Math.min(subtotal, Number(d.value) || 0);
    const tax = doc.taxOn ? (subtotal - discount) * (Number(doc.taxRate) || 0) / 100 : 0;
    return { subtotal, discount, tax, total: subtotal - discount + tax };
  }

  function demoRecords() {
    const clients = [
      { id: 'cl_1', name: 'Adaeze Okafor', company: 'Rivers Deepwater Services Ltd', email: 'procurement@riversdeepwater.example', phone: '+234 803 000 1101', address: '14 Trans-Amadi Industrial Layout, Port Harcourt' },
      { id: 'cl_2', name: 'Tunde Bakare', company: 'Greenline Construction Co.', email: 'tunde@greenline.example', phone: '+234 806 000 2202', address: '7 Stadium Road, Port Harcourt' },
      { id: 'cl_3', name: 'Ngozi Eze', company: 'St. Luke Specialist Hospital', email: 'stores@stluke.example', phone: '+234 809 000 3303', address: '22 Aba Road, Port Harcourt' },
      { id: 'cl_4', name: 'Ibrahim Musa', company: 'Delta Agro Processing', email: 'imusa@deltaagro.example', phone: '+234 802 000 4404', address: 'Km 5 East-West Road, Eleme' },
    ];
    const vendors = [
      { id: 've_1', name: 'Coastline Industrial Supplies', category: 'Industrial equipment', contact: 'Emeka Nwosu', phone: '+234 803 111 0001', email: 'sales@coastline.example' },
      { id: 've_2', name: 'Harbor Steel & Pipes', category: 'Oil & gas materials', contact: 'Bola Adeyemi', phone: '+234 805 111 0002', email: 'orders@harborsteel.example' },
      { id: 've_3', name: 'MedSource Distributors', category: 'Medical supplies', contact: 'Chioma Obi', phone: '+234 807 111 0003', email: 'chioma@medsource.example' },
      { id: 've_4', name: 'Midwest Tech Imports (USA)', category: 'IT & office', contact: 'Daniel Price', phone: '+1 773 555 0104', email: 'dprice@midwesttech.example' },
    ];
    const invoices = [
      { id: 'in_1', number: 'GT-INV-0001', clientId: 'cl_1', date: daysAgo(48), terms: 'Net 30', status: 'Sent',
        items: [{ desc: 'Ball valves, 4" ANSI 600 (forged steel)', qty: 24, rate: 185000 }, { desc: 'Spiral-wound gaskets, 4"', qty: 60, rate: 9500 }, { desc: 'Logistics & clearing (Onne Port)', qty: 1, rate: 420000 }],
        discount: { type: 'percent', value: 0 }, taxOn: true, taxRate: 7.5, notes: 'Thank you for your business.' },
      { id: 'in_2', number: 'GT-INV-0002', clientId: 'cl_3', date: daysAgo(20), terms: 'Net 14', status: 'Sent',
        items: [{ desc: 'Patient monitors, 5-parameter', qty: 6, rate: 1350000 }, { desc: 'Nitrile examination gloves (carton of 1,000)', qty: 40, rate: 38000 }],
        discount: { type: 'percent', value: 5 }, taxOn: true, taxRate: 7.5, notes: '' },
      { id: 'in_3', number: 'GT-INV-0003', clientId: 'cl_2', date: daysAgo(3), terms: 'Net 14', status: 'Sent',
        items: [{ desc: 'Reinforcement steel bars, 16mm (tonne)', qty: 12, rate: 1120000 }, { desc: 'Haulage to site', qty: 1, rate: 350000 }],
        discount: { type: 'amount', value: 0 }, taxOn: true, taxRate: 7.5, notes: '' },
    ];
    const quotations = [
      { id: 'qt_1', number: 'GT-QT-0001', clientId: 'cl_4', date: daysAgo(6), terms: 'Valid 30 days', status: 'Sent',
        items: [{ desc: 'Industrial cassava grater, 2 t/hr', qty: 2, rate: 4800000 }, { desc: 'Installation & commissioning', qty: 1, rate: 650000 }],
        discount: { type: 'percent', value: 0 }, taxOn: true, taxRate: 7.5, notes: 'Lead time: 6–8 weeks from order confirmation.' },
    ];
    const procurement = [
      { id: 'pr_1', ref: 'PO-1001', clientId: 'cl_1', item: 'Ball valves & gaskets', category: 'Oil & gas materials', vendorId: 've_2', qty: 84, value: 5430000, status: 'Delivered', date: daysAgo(55) },
      { id: 'pr_2', ref: 'PO-1002', clientId: 'cl_3', item: 'Patient monitors', category: 'Medical supplies', vendorId: 've_3', qty: 6, value: 7020000, status: 'In transit', date: daysAgo(18) },
      { id: 'pr_3', ref: 'PO-1003', clientId: 'cl_2', item: 'Reinforcement steel, 16mm', category: 'Building materials', vendorId: 've_1', qty: 12, value: 12100000, status: 'Ordered', date: daysAgo(4) },
      { id: 'pr_4', ref: 'PO-1004', clientId: 'cl_4', item: 'Cassava graters', category: 'Industrial equipment', vendorId: 've_1', qty: 2, value: 8200000, status: 'Sourcing', date: daysAgo(2) },
    ];
    const payments = [
      { id: 'pa_1', invoiceId: 'in_1', date: daysAgo(30), amount: totals(invoices[0]).total, method: 'Bank transfer', ref: 'TRF-88214' },
      { id: 'pa_2', invoiceId: 'in_2', date: daysAgo(8), amount: 4000000, method: 'Bank transfer', ref: 'TRF-90155' },
    ];
    const expenses = [
      { id: 'ex_1', date: daysAgo(40), category: 'Freight & clearing', vendorId: 've_2', desc: 'Port clearing — Onne', amount: 310000 },
      { id: 'ex_2', date: daysAgo(25), category: 'Office', vendorId: '', desc: 'Office internet & power', amount: 145000 },
      { id: 'ex_3', date: daysAgo(10), category: 'Transport', vendorId: '', desc: 'Site delivery truck hire', amount: 220000 },
      { id: 'ex_4', date: daysAgo(70), category: 'Freight & clearing', vendorId: 've_4', desc: 'Air freight — Chicago to Lagos', amount: 980000 },
    ];
    const enquiries = [
      { id: 'en_1', name: 'Samuel Ike', email: 'samuel@example.com', phone: '+234 810 000 5505', subject: 'Generator procurement', message: 'Do you source 500kVA diesel generators with installation in Bayelsa?', date: daysAgo(1), status: 'New' },
    ];
    return { clients, vendors, invoices, quotations, procurement, payments, expenses, enquiries };
  }
  window.GT_DEMO = demoRecords;
})();
