const clientModel = require('../models/clientModel');
const { prepare } = require('../config/db');

function index(req, res) {
  const { search = '', active = 1, page = 1, limit = 20 } = req.query;
  const result = clientModel.findAll({ search, active: Number(active), page: Number(page), limit: Number(limit) });
  res.json(result);
}

function show(req, res) {
  const client = clientModel.findById(req.params.id);
  if (!client) return res.status(404).json({ error: 'Cliente não encontrado' });

  const orders = prepare(
    'SELECT id, code, status, entry_date, total_value FROM service_orders WHERE client_id = ? ORDER BY entry_date DESC LIMIT 10'
  ).all(req.params.id);

  res.json({ ...client, orders });
}

function store(req, res) {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });
  const result = clientModel.create(req.body);
  res.status(201).json(result);
}

function update(req, res) {
  const client = clientModel.findById(req.params.id);
  if (!client) return res.status(404).json({ error: 'Cliente não encontrado' });
  clientModel.update(req.params.id, req.body);
  res.json({ ok: true });
}

function destroy(req, res) {
  clientModel.remove(req.params.id);
  res.json({ ok: true });
}

module.exports = { index, show, store, update, destroy };
