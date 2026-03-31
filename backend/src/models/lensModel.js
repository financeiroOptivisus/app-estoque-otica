const { prepare } = require('../config/db');

// Types that require base/addition/eye fields
const MULTIFOCAL_TYPES = ['Bifocal', 'Intervil', 'Progressiva'];

function generateCode() {
  const row = prepare("SELECT MAX(CAST(SUBSTR(code, 4) AS INTEGER)) AS max_num FROM lenses").get();
  const next = (row?.max_num || 0) + 1;
  return 'LEN' + String(next).padStart(3, '0');
}

function findAll({ search = '', type = '', low_stock = false, page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const like = `%${search}%`;
  let where = 'active = 1';
  const params = [];

  if (search) {
    where += ' AND (code LIKE ? OR brand LIKE ? OR supplier LIKE ? OR type LIKE ?)';
    params.push(like, like, like, like);
  }
  if (type) { where += ' AND type = ?'; params.push(type); }
  if (low_stock) { where += ' AND stock_qty <= low_stock_alert'; }

  const data = prepare(`SELECT * FROM lenses WHERE ${where} ORDER BY code LIMIT ? OFFSET ?`).all(...params, limit, offset);
  const row = prepare(`SELECT COUNT(*) AS total FROM lenses WHERE ${where}`).get(...params);
  return { data, total: row?.total || 0 };
}

function findById(id) {
  return prepare('SELECT * FROM lenses WHERE id = ?').get(id);
}

function create(data) {
  const code = generateCode();
  const {
    type, index_value, brand, supplier, stock_qty, low_stock_alert,
    cost_price, sale_price, description,
    treatment, diameter,
    base, addition_min, addition_max, eye
  } = data;

  const isMultifocal = MULTIFOCAL_TYPES.includes(type);

  const result = prepare(
    `INSERT INTO lenses
     (code, type, index_value, brand, supplier, stock_qty, low_stock_alert,
      cost_price, sale_price, description, treatment, diameter,
      base, addition_min, addition_max, eye)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).run(
    code, type, index_value || null, brand || null, supplier || null,
    stock_qty || 0, low_stock_alert || 5, cost_price || 0, sale_price || 0,
    description || null, treatment || null, diameter || null,
    isMultifocal ? (base || null) : null,
    isMultifocal ? (addition_min || null) : null,
    isMultifocal ? (addition_max || null) : null,
    isMultifocal ? (eye || null) : null
  );
  return { id: result.lastInsertRowid, code };
}

function update(id, data) {
  const {
    type, index_value, brand, supplier, stock_qty, low_stock_alert,
    cost_price, sale_price, description,
    treatment, diameter,
    base, addition_min, addition_max, eye
  } = data;

  const isMultifocal = MULTIFOCAL_TYPES.includes(type);

  prepare(
    `UPDATE lenses SET
     type=?, index_value=?, brand=?, supplier=?, stock_qty=?, low_stock_alert=?,
     cost_price=?, sale_price=?, description=?, treatment=?, diameter=?,
     base=?, addition_min=?, addition_max=?, eye=?,
     updated_at=datetime('now') WHERE id=?`
  ).run(
    type, index_value || null, brand || null, supplier || null, stock_qty, low_stock_alert,
    cost_price, sale_price, description || null, treatment || null, diameter || null,
    isMultifocal ? (base || null) : null,
    isMultifocal ? (addition_min || null) : null,
    isMultifocal ? (addition_max || null) : null,
    isMultifocal ? (eye || null) : null,
    id
  );
}

function adjustStock(id, delta) {
  prepare('UPDATE lenses SET stock_qty = stock_qty + ? WHERE id = ?').run(delta, id);
}

function remove(id) {
  prepare('UPDATE lenses SET active = 0 WHERE id = ?').run(id);
}

module.exports = { findAll, findById, create, update, adjustStock, remove, MULTIFOCAL_TYPES };
