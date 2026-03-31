const frameModel = require('../models/frameModel');

function index(req, res) {
  const { search = '', page = 1, limit = 20 } = req.query;
  res.json(frameModel.findAll({ search, page: Number(page), limit: Number(limit) }));
}

function show(req, res) {
  const frame = frameModel.findById(req.params.id);
  if (!frame) return res.status(404).json({ error: 'Armação não encontrada' });
  res.json(frame);
}

function store(req, res) {
  const result = frameModel.create(req.body);
  res.status(201).json(result);
}

function update(req, res) {
  const frame = frameModel.findById(req.params.id);
  if (!frame) return res.status(404).json({ error: 'Armação não encontrada' });
  frameModel.update(req.params.id, req.body);
  res.json({ ok: true });
}

function destroy(req, res) {
  frameModel.remove(req.params.id);
  res.json({ ok: true });
}

module.exports = { index, show, store, update, destroy };
