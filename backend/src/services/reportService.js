const { prepare } = require('../config/db');

function getDashboard() {
  const { monthly_revenue } = prepare(
    `SELECT COALESCE(SUM(amount_paid), 0) AS monthly_revenue
     FROM financials
     WHERE strftime('%Y-%m', payment_date) = strftime('%Y-%m', 'now') AND status = 'Pago'`
  ).get();

  const { count: open_os } = prepare(
    `SELECT COUNT(*) AS count FROM service_orders WHERE status NOT IN ('Entregue')`
  ).get();

  const { count: debtors } = prepare(
    `SELECT COUNT(DISTINCT client_id) AS count FROM financials WHERE status IN ('Pendente','Parcial')`
  ).get();

  const { count: low_stock } = prepare(
    `SELECT COUNT(*) AS count FROM lenses WHERE stock_qty <= low_stock_alert AND active = 1`
  ).get();

  const revenue_chart = prepare(
    `SELECT strftime('%Y-%m', payment_date) AS month, SUM(amount_paid) AS revenue
     FROM financials
     WHERE status = 'Pago' AND payment_date >= date('now', '-6 months')
     GROUP BY strftime('%Y-%m', payment_date)
     ORDER BY month`
  ).all();

  const top_lenses = prepare(
    `SELECT l.code, l.brand, l.type, l.index_value, SUM(oi.qty) AS total_sold
     FROM os_items oi
     JOIN lenses l ON l.id = oi.lens_id
     GROUP BY oi.lens_id
     ORDER BY total_sold DESC
     LIMIT 5`
  ).all();

  return { monthly_revenue, open_os, debtors, low_stock, revenue_chart, top_lenses };
}

function getRevenue({ date_from, date_to }) {
  return prepare(
    `SELECT strftime('%Y-%m', payment_date) AS month, SUM(amount_paid) AS revenue, COUNT(*) AS count
     FROM financials
     WHERE status = 'Pago'
       AND (? IS NULL OR payment_date >= ?)
       AND (? IS NULL OR payment_date <= ?)
     GROUP BY strftime('%Y-%m', payment_date)
     ORDER BY month`
  ).all(date_from || null, date_from || null, date_to || null, date_to || null);
}

function getDebtors() {
  return prepare(
    `SELECT c.id, c.code, c.name, c.phone,
            SUM(f.balance) AS total_debt, COUNT(f.id) AS os_count
     FROM financials f
     JOIN clients c ON c.id = f.client_id
     WHERE f.status IN ('Pendente','Parcial')
     GROUP BY f.client_id
     ORDER BY total_debt DESC`
  ).all();
}

function getLowStock() {
  return prepare(
    `SELECT id, code, type, brand, index_value, stock_qty, low_stock_alert
     FROM lenses WHERE stock_qty <= low_stock_alert AND active = 1
     ORDER BY stock_qty ASC`
  ).all();
}

function getTopLenses({ date_from, date_to }) {
  return prepare(
    `SELECT l.id, l.code, l.brand, l.type, l.index_value,
            SUM(oi.qty) AS total_sold, SUM(oi.subtotal) AS total_revenue
     FROM os_items oi
     JOIN lenses l ON l.id = oi.lens_id
     JOIN service_orders so ON so.id = oi.service_order_id
     WHERE (? IS NULL OR so.entry_date >= ?)
       AND (? IS NULL OR so.entry_date <= ?)
     GROUP BY oi.lens_id
     ORDER BY total_sold DESC
     LIMIT 10`
  ).all(date_from || null, date_from || null, date_to || null, date_to || null);
}

module.exports = { getDashboard, getRevenue, getDebtors, getLowStock, getTopLenses };
