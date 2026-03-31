const authService = require('../services/authService');
const userModel = require('../models/userModel');

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  const result = await authService.login(email, password);
  res.json(result);
}

function me(req, res) {
  const user = userModel.findById(req.user.id);
  res.json(user);
}

module.exports = { login, me };
