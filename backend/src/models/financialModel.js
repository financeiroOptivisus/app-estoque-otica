const { prepare } = require('../config/db');

function findAll({ status = '', client_id = '', date_from = '', date_to = '', page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  let where = '1=1';
  const params = [];

  if (status) { where += ' AND f.status = ?'; params.push(status); }
  if (client_id) { where += ' AND f.client_id = ?'; params.push(client_id); }
  if (date_from) { where += ' AND f.due_date >= ?'; params.push(date_from); }
  if (date_to) { where += ' AND f.due_date <= ?'; params.push(date_to); }

  const data = prepare(
    `SELECT f.*, c.name AS client_name, c.code AS client_code, so.code AS os_code
     FROM financials f
     JOIN clients c ON c.id = f.client_id
     JOIN service_orders so ON so.id = f.service_order_id
     WHERE ${where}
     ORDER BY f.due_date DESC
     LIMIT ? OFFSET ?`
  ).all(...params, limit, offset);

  const row = prepare(`SELECT COUNT(*) AS total FROM financials f WHERE ${where}`).get(...params);
  return { data, total: row?.total || 0 };
}

function findById(id) {
  const fin = prepare(
    `SELECT f.*, c.name AS client_name, so.code AS os_code
     FROM financials f
     JOIN clients c ON c.id = f.client_id
     JOIN service_orders so ON so.id = f.service_order_id
     WHERE f.id = ?`
  ).get(id);
  if (!fin) return null;
  fin.installments = prepare(
    'SELECT * FROM installments WHERE financial_id = ? ORDER BY installment_num'
  ).all(id);
  return fin;
}

function create(data) {
  const { service_order_id, client_id, total_amount, payment_method, installments_qty, due_date, notes } = data;
  const result = prepare(
    `INSERT INTO financials (service_order_id, client_id, total_amount, balance, payment_method, installments_qty, due_date, notes)
     VALUES (?,?,?,?,?,?,?,?)`
  ).run(service_order_id, client_id, total_amount, total_amount,
    payment_method, installments_qty || 1, due_date || null, notes || null);
  return result.lastInsertRowid;
}

function createInstallments(financial_id, installments) {
  for (const inst of installments) {
    prepare('INSERT INTO installments (financial_id, installment_num, amount, due_date) VALUES (?,?,?,?)')
      .run(financial_id, inst.num, inst.amount, inst.due_date);
  }
}

function payInstallment(installment_id, { payment_date, payment_method }) {
  prepare('UPDATE installments SET status = "Pago", payment_date = ?, payment_method = ? WHERE id = ?')
    .run(payment_date, payment_method, installment_id);
}

function recompute(financial_id) {
  const row = prepare('SELECT SUM(amount) AS total_paid FROM installments WHERE financial_id = ? AND status = "Pago"').get(financial_id);
  const paid = row?.total_paid || 0;
  const fin = prepare('SELECT total_amount FROM financials WHERE id = ?').get(financial_id);
  const balance = fin.total_amount - paid;
  const status = balance <= 0 ? 'Pago' : paid > 0 ? 'Parcial' : 'Pendente';
  const paymentDate = balance <= 0 ? new Date().toISOString().split('T')[0] : null;
  prepare(
    "UPDATE financials SET amount_paid=?, balance=?, status=?, payment_date=?, updated_at=datetime('now') WHERE id=?"
  ).run(paid, balance, status, paymentDate, financial_id);
}

function update(id, data) {
  const { payment_method, due_date, notes } = data;
  prepare(
    "UPDATE financials SET payment_method=?, due_date=?, notes=?, updated_at=datetime('now') WHERE id=?"
  ).run(payment_method, due_date || null, notes || null, id);
}

module.exports = { findAll, findById, create, createInstallments, payInstallment, recompute, update };
