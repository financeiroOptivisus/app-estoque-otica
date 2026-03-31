const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

async function login(email, password) {
  const user = userModel.findByEmail(email);
  if (!user) throw Object.assign(new Error('Credenciais inválidas'), { status: 401 });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw Object.assign(new Error('Credenciais inválidas'), { status: 401 });

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
}

function createDefaultAdmin() {
  const existing = userModel.findByEmail('admin@bflentes.com');
  if (!existing) {
    const hash = bcrypt.hashSync('admin123', 10);
    userModel.create({ name: 'Administrador', email: 'admin@bflentes.com', password: hash, role: 'admin' });
    console.log('Admin padrão criado: admin@bflentes.com / admin123');
  }
}

module.exports = { login, createDefaultAdmin };
