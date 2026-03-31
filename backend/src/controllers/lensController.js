const lensModel = require('../models/lensModel');

function index(req, res) {
  const { search = '', type = '', low_stock, page = 1, limit = 20 } = req.query;
  const result = lensModel.findAll({ search, type, low_stock: low_stock === 'true', page: Number(page), limit: Number(limit) });
  res.json(result);
}

function show(req, res) {
  const lens = lensModel.findById(req.params.id);
  if (!lens) return res.status(404).json({ error: 'Lente não encontrada' });
  res.json(lens);
}

function store(req, res) {
  const { type } = req.body;
  if (!type) return res.status(400).json({ error: 'Tipo é obrigatório' });
  const result = lensModel.create(req.body);
  res.status(201).json(result);
}

function update(req, res) {
  const lens = lensModel.findById(req.params.id);
  if (!lens) return res.status(404).json({ error: 'Lente não encontrada' });
  lensModel.update(req.params.id, req.body);
  res.json({ ok: true });
}

function adjustStock(req, res) {
  const { delta } = req.body;
  if (delta === undefined) return res.status(400).json({ error: 'delta é obrigatório' });
  lensModel.adjustStock(req.params.id, Number(delta));
  res.json({ ok: true });
}

function destroy(req, res) {
  lensModel.remove(req.params.id);
  res.json({ ok: true });
}

module.exports = { index, show, store, update, adjustStock, destroy };
