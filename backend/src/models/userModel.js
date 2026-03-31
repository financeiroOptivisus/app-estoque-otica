const { prepare } = require('../config/db');

function findByEmail(email) {
  return prepare('SELECT * FROM users WHERE email = ? AND active = 1').get(email);
}

function findById(id) {
  return prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(id);
}

function create({ name, email, password, role = 'user' }) {
  return prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(name, email, password, role).lastInsertRowid;
}

module.exports = { findByEmail, findById, create };
