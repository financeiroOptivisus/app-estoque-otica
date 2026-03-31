const soModel = require('../models/serviceOrderModel');
const soService = require('../services/serviceOrderService');

function index(req, res) {
  const { status = '', client_id = '', date_from = '', date_to = '', page = 1, limit = 20 } = req.query;
  const result = soModel.findAll({ status, client_id, date_from, date_to, page: Number(page), limit: Number(limit) });
  res.json(result);
}

function show(req, res) {
  const os = soModel.findById(req.params.id);
  if (!os) return res.status(404).json({ error: 'OS não encontrada' });
  res.json(os);
}

function store(req, res) {
  const { client_id, entry_date } = req.body;
  if (!client_id || !entry_date) return res.status(400).json({ error: 'Cliente e data de entrada são obrigatórios' });
  const result = soService.create(req.body);
  res.status(201).json(result);
}

function update(req, res) {
  const os = soModel.findById(req.params.id);
  if (!os) return res.status(404).json({ error: 'OS não encontrada' });
  soModel.update(req.params.id, req.body);
  res.json({ ok: true });
}

function updateStatus(req, res) {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status é obrigatório' });
  soService.updateStatus(req.params.id, status);
  res.json({ ok: true });
}

function print(req, res) {
  const os = soModel.findById(req.params.id);
  if (!os) return res.status(404).json({ error: 'OS não encontrada' });
  res.json(os);
}

module.exports = { index, show, store, update, updateStatus, print };
