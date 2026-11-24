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
    const now = new Date();
    const at = (n, hm) => `${daysAgo(n)}T${hm}`;
    const deals = [
      { id: 'de_1', company: 'Sunrise Hospitals Group', contact: 'Dr. Okoye', phone: '+234 803 222 0101', value: 18500000, stage: 'New lead', source: 'Website', stageDate: daysAgo(2), clientId: '' },
      { id: 'de_2', company: 'Bonny Marine Services', contact: 'Capt. Briggs', phone: '+234 805 222 0102', value: 41000000, stage: 'Contacted', source: 'Referral', stageDate: daysAgo(5), clientId: '' },
      { id: 'de_3', company: 'Everfresh Foods Ltd', contact: 'Emeka N.', value: 9600000, stage: 'Quoted', source: 'Tender', stageDate: daysAgo(6), clientId: '' },
      { id: 'de_4', company: 'Delta Agro Processing', contact: 'Ibrahim Musa', value: 11018750, stage: 'Negotiation', source: 'Existing client', stageDate: daysAgo(4), clientId: 'cl_4' },
      { id: 'de_5', company: 'Rivers Deepwater Services Ltd', contact: 'Adaeze Okafor', value: 5837250, stage: 'Won', source: 'Existing client', stageDate: daysAgo(48), clientId: 'cl_1' },
      { id: 'de_6', company: 'GreenLeaf Eateries', contact: 'Ifeoma B.', value: 2400000, stage: 'Lost', source: 'Walk-in', stageDate: daysAgo(20), clientId: '' },
    ];
    const warehouses = [
      { id: 'wh_1', name: 'Trans-Amadi Main Store', location: 'Trans-Amadi Industrial Layout, Port Harcourt', type: 'Ambient', capacity: 1200, unit: 'pallets', manager: 'Blessing Amadi' },
      { id: 'wh_2', name: 'Onne Bonded Yard', location: 'Onne Port, Rivers State', type: 'Bonded', capacity: 400, unit: 'pallets', manager: 'Kelvin Briggs' },
      { id: 'wh_3', name: 'Aba Road Cold Room', location: 'Aba Road, Port Harcourt', type: 'Chilled', capacity: 100, unit: 'pallets', manager: 'Ngozi Wogu' },
    ];
    const stock = [
      { id: 'sk_1', item: 'Nitrile examination gloves (carton)', sku: 'MED-GLV-01', batch: 'B-2207', warehouseId: 'wh_3', vendorId: 've_3', qty: 92, unitCost: 31000, expiry: daysAgo(-10), received: daysAgo(120) },
      { id: 'sk_2', item: 'Ball valves, 4 inch ANSI 600', sku: 'OG-VLV-4', batch: 'B-1931', warehouseId: 'wh_2', vendorId: 've_2', qty: 140, unitCost: 152000, expiry: '', received: daysAgo(40) },
      { id: 'sk_3', item: 'Reinforcement steel, 16mm (tonne)', sku: 'BLD-STL-16', batch: 'B-2240', warehouseId: 'wh_1', vendorId: 've_1', qty: 310, unitCost: 980000, expiry: '', received: daysAgo(9) },
      { id: 'sk_4', item: 'Cement, 50kg bag', sku: 'BLD-CEM-50', batch: 'B-2251', warehouseId: 'wh_1', vendorId: 've_1', qty: 640, unitCost: 8900, expiry: daysAgo(-35), received: daysAgo(15) },
      { id: 'sk_5', item: 'Patient monitor, 5-parameter', sku: 'MED-MON-5', batch: 'B-2188', warehouseId: 'wh_1', vendorId: 've_3', qty: 12, unitCost: 1150000, expiry: '', received: daysAgo(60) },
      { id: 'sk_6', item: 'Spiral-wound gaskets, 4 inch', sku: 'OG-GSK-4', batch: 'B-1907', warehouseId: 'wh_2', vendorId: 've_2', qty: 220, unitCost: 7400, expiry: daysAgo(-200), received: daysAgo(80) },
    ];
    const transfers = [
      { id: 'tf_1', ref: 'TR-003', date: daysAgo(0), fromId: 'wh_2', toId: 'wh_1', item: 'Ball valves, 4 inch ANSI 600', qty: 40, status: 'In transit' },
      { id: 'tf_2', ref: 'TR-002', date: daysAgo(6), fromId: 'wh_1', toId: 'wh_3', item: 'Nitrile examination gloves (carton)', qty: 30, status: 'Completed' },
      { id: 'tf_3', ref: 'TR-001', date: daysAgo(14), fromId: 'wh_1', toId: 'wh_2', item: 'Spiral-wound gaskets, 4 inch', qty: 60, status: 'Completed' },
    ];
    const drivers = [
      { id: 'dr_1', name: 'Emmanuel Okafor', phone: '+234 803 118 2274', vehicle: 'Toyota Hiace', plate: 'PH-234-XY', route: 'Trans-Amadi / Rumuola', status: 'On route' },
      { id: 'dr_2', name: 'Ifeanyi Kalu', phone: '+234 806 902 4471', vehicle: 'Isuzu NPR truck', plate: 'RV-112-KJ', route: 'Onne / Eleme', status: 'Available' },
      { id: 'dr_3', name: 'Godwin Tamuno', phone: '+234 705 331 8820', vehicle: 'Mazda Bongo', plate: 'PH-891-QA', route: 'Aba Road / GRA', status: 'Off duty' },
    ];
    const deliveries = [
      { id: 'dl_1', ref: 'DEL-004', invoiceId: 'in_3', clientId: 'cl_2', driverId: 'dr_1', route: 'Stadium Road site', dispatched: at(0, '09:40'), status: 'Out for delivery', pod: '' },
      { id: 'dl_2', ref: 'DEL-003', invoiceId: 'in_2', clientId: 'cl_3', driverId: 'dr_2', route: 'Aba Road', dispatched: at(0, '08:15'), status: 'Delivered', pod: 'Signed', receivedBy: 'Stores officer' },
      { id: 'dl_3', ref: 'DEL-002', invoiceId: 'in_2', clientId: 'cl_3', driverId: 'dr_1', route: 'Aba Road', dispatched: at(7, '11:20'), status: 'Failed', pod: 'Customer unavailable' },
      { id: 'dl_4', ref: 'DEL-001', invoiceId: 'in_1', clientId: 'cl_1', driverId: 'dr_2', route: 'Onne Port', dispatched: at(45, '10:00'), status: 'Delivered', pod: 'Signed', receivedBy: 'A. Okafor' },
    ];
    const returns = [
      { id: 'rt_1', ref: 'RT-002', date: daysAgo(4), clientId: 'cl_3', invoiceId: 'in_2', item: 'Nitrile examination gloves (carton)', qty: 4, reason: 'Damaged in transit', status: 'Credited' },
      { id: 'rt_2', ref: 'RT-001', date: daysAgo(1), clientId: 'cl_2', invoiceId: 'in_3', item: 'Reinforcement steel, 16mm (tonne)', qty: 1, reason: 'Wrong item delivered', status: 'Pending' },
    ];
    const credit_notes = [
      { id: 'cn_1', ref: 'CN-0001', date: daysAgo(3), clientId: 'cl_3', invoiceId: 'in_2', returnId: 'rt_1', amount: 152000, status: 'Applied', reason: '4 cartons damaged in transit' },
    ];
    const cost_ledger = [
      { id: 'cg_1', date: daysAgo(9), item: 'Reinforcement steel, 16mm (tonne)', vendorId: 've_1', change: 'Revalued', oldCost: 1040000, newCost: 980000, reason: 'Bulk purchase discount' },
      { id: 'cg_2', date: daysAgo(22), item: 'Nitrile examination gloves (carton)', vendorId: 've_3', change: 'Revalued', oldCost: 28500, newCost: 31000, reason: 'Supplier price increase' },
      { id: 'cg_3', date: daysAgo(40), item: 'Ball valves, 4 inch ANSI 600', vendorId: 've_2', change: 'New batch', oldCost: 0, newCost: 152000, reason: 'Batch B-1931 received' },
    ];
    const employees = [
      { id: 'em_1', name: 'Blessing Amadi', role: 'Operations Manager', department: 'Management', phone: '+234 802 664 1193', joined: '2022-09-15', status: 'Active', salary: 650000 },
      { id: 'em_2', name: 'Chidinma Eze', role: 'Accountant', department: 'Finance', phone: '+234 813 275 6602', joined: '2023-03-01', status: 'Active', salary: 420000 },
      { id: 'em_3', name: 'Kelvin Briggs', role: 'Procurement Officer', department: 'Procurement', phone: '+234 902 447 3315', joined: '2024-11-10', status: 'Active', salary: 380000 },
      { id: 'em_4', name: 'Emmanuel Okafor', role: 'Driver', department: 'Logistics', phone: '+234 803 118 2274', joined: '2024-01-12', status: 'Active', salary: 220000 },
      { id: 'em_5', name: 'Ifeanyi Kalu', role: 'Driver', department: 'Logistics', phone: '+234 806 902 4471', joined: '2024-06-03', status: 'Active', salary: 220000 },
      { id: 'em_6', name: 'Ngozi Wogu', role: 'Storekeeper', department: 'Warehousing', phone: '+234 705 889 2261', joined: '2025-05-05', status: 'On leave', salary: 240000 },
    ];
    const attendance = [
      { id: 'at_1', date: daysAgo(0), employeeId: 'em_1', clockIn: '07:52', clockOut: '', status: 'Present' },
      { id: 'at_2', date: daysAgo(0), employeeId: 'em_2', clockIn: '08:24', clockOut: '', status: 'Late' },
      { id: 'at_3', date: daysAgo(0), employeeId: 'em_3', clockIn: '07:58', clockOut: '', status: 'Present' },
      { id: 'at_4', date: daysAgo(0), employeeId: 'em_4', clockIn: '07:05', clockOut: '', status: 'Present' },
      { id: 'at_5', date: daysAgo(0), employeeId: 'em_6', clockIn: '', clockOut: '', status: 'On leave' },
    ];
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lines = employees.map((e) => ({ employeeId: e.id, name: e.name, gross: e.salary, deductions: e.salary * 0.1, net: e.salary * 0.9 }));
    const g = lines.reduce((s, l) => s + l.gross, 0);
    const payroll = [
      { id: 'py_1', period: `${lm.getFullYear()}-${pad(lm.getMonth() + 1)}`, date: daysAgo(25), pct: 10, status: 'Paid', paidDate: daysAgo(24), lines, gross: g, deductions: g * 0.1, net: g * 0.9 },
    ];
    return { clients, vendors, invoices, quotations, procurement, payments, expenses, enquiries,
      deals, warehouses, stock, transfers, drivers, deliveries, returns, credit_notes, cost_ledger, employees, attendance, payroll };
  }
  window.GT_DEMO = demoRecords;
})();
