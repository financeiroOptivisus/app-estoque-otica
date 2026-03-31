const { prepare } = require('../config/db');

function generateCode() {
  const row = prepare("SELECT MAX(CAST(SUBSTR(code, 4) AS INTEGER)) AS max_num FROM frames").get();
  const next = (row?.max_num || 0) + 1;
  return 'ARM' + String(next).padStart(3, '0');
}

function findAll({ search = '', page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const like = `%${search}%`;
  const data = prepare(
    `SELECT * FROM frames
     WHERE active = 1 AND (code LIKE ? OR brand LIKE ? OR model LIKE ? OR type LIKE ?)
     ORDER BY code LIMIT ? OFFSET ?`
  ).all(like, like, like, like, limit, offset);
  const row = prepare(
    `SELECT COUNT(*) AS total FROM frames WHERE active = 1 AND (code LIKE ? OR brand LIKE ? OR model LIKE ? OR type LIKE ?)`
  ).get(like, like, like, like);
  return { data, total: row?.total || 0 };
}

function findById(id) {
  return prepare('SELECT * FROM frames WHERE id = ?').get(id);
}

function create(data) {
  const code = generateCode();
  const { brand, model, color, type, size, stock_qty, cost_price, sale_price, notes } = data;
  const result = prepare(
    `INSERT INTO frames (code, brand, model, color, type, size, stock_qty, cost_price, sale_price, notes)
     VALUES (?,?,?,?,?,?,?,?,?,?)`
  ).run(code, brand || null, model || null, color || null, type || null,
    size || null, stock_qty || 0, cost_price || 0, sale_price || 0, notes || null);
  return { id: result.lastInsertRowid, code };
}

function update(id, data) {
  const { brand, model, color, type, size, stock_qty, cost_price, sale_price, notes } = data;
  prepare(
    `UPDATE frames SET brand=?, model=?, color=?, type=?, size=?, stock_qty=?,
     cost_price=?, sale_price=?, notes=?, updated_at=datetime('now') WHERE id=?`
  ).run(brand || null, model || null, color || null, type || null,
    size || null, stock_qty || 0, cost_price || 0, sale_price || 0, notes || null, id);
}

function remove(id) {
  prepare('UPDATE frames SET active = 0 WHERE id = ?').run(id);
}

module.exports = { findAll, findById, create, update, remove };
