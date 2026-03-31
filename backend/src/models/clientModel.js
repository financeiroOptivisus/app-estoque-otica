const { prepare } = require('../config/db');

function generateCode() {
  const row = prepare("SELECT MAX(CAST(SUBSTR(code, 4) AS INTEGER)) AS max_num FROM clients").get();
  const next = (row?.max_num || 0) + 1;
  return 'CLI' + String(next).padStart(3, '0');
}

function findAll({ search = '', active = 1, page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const like = `%${search}%`;
  const data = prepare(
    `SELECT id, code, name, phone, cpf_cnpj, email, active, created_at
     FROM clients
     WHERE active = ? AND (name LIKE ? OR code LIKE ? OR cpf_cnpj LIKE ? OR phone LIKE ?)
     ORDER BY name LIMIT ? OFFSET ?`
  ).all(active, like, like, like, like, limit, offset);
  const row = prepare(
    `SELECT COUNT(*) AS total FROM clients WHERE active = ? AND (name LIKE ? OR code LIKE ? OR cpf_cnpj LIKE ? OR phone LIKE ?)`
  ).get(active, like, like, like, like);
  return { data, total: row?.total || 0 };
}

function findById(id) {
  return prepare('SELECT * FROM clients WHERE id = ?').get(id);
}

function create(data) {
  const code = generateCode();
  const { name, phone, cpf_cnpj, email, address, notes } = data;
  const result = prepare(
    'INSERT INTO clients (code, name, phone, cpf_cnpj, email, address, notes) VALUES (?,?,?,?,?,?,?)'
  ).run(code, name, phone || null, cpf_cnpj || null, email || null, address || null, notes || null);
  return { id: result.lastInsertRowid, code };
}

function update(id, data) {
  const { name, phone, cpf_cnpj, email, address, notes } = data;
  prepare(
    `UPDATE clients SET name=?, phone=?, cpf_cnpj=?, email=?, address=?, notes=?, updated_at=datetime('now') WHERE id=?`
  ).run(name, phone || null, cpf_cnpj || null, email || null, address || null, notes || null, id);
}

function remove(id) {
  prepare('UPDATE clients SET active = 0 WHERE id = ?').run(id);
}

module.exports = { findAll, findById, create, update, remove };
