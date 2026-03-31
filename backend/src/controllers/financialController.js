const financialModel = require('../models/financialModel');

function index(req, res) {
  const { status = '', client_id = '', date_from = '', date_to = '', page = 1, limit = 20 } = req.query;
  const result = financialModel.findAll({ status, client_id, date_from, date_to, page: Number(page), limit: Number(limit) });
  res.json(result);
}

function show(req, res) {
  const fin = financialModel.findById(req.params.id);
  if (!fin) return res.status(404).json({ error: 'Registro não encontrado' });
  res.json(fin);
}

function store(req, res) {
  const { service_order_id, client_id, total_amount, payment_method } = req.body;
  if (!service_order_id || !client_id || !total_amount || !payment_method) {
    return res.status(400).json({ error: 'Campos obrigatórios faltando' });
  }
  const id = financialModel.create(req.body);
  if (req.body.installments_qty > 1 && req.body.installments) {
    financialModel.createInstallments(id, req.body.installments);
  }
  res.status(201).json({ id });
}

function update(req, res) {
  const fin = financialModel.findById(req.params.id);
  if (!fin) return res.status(404).json({ error: 'Registro não encontrado' });
  financialModel.update(req.params.id, req.body);
  res.json({ ok: true });
}

function payInstallment(req, res) {
  const { payment_date, payment_method } = req.body;
  if (!payment_date || !payment_method) return res.status(400).json({ error: 'Data e forma de pagamento são obrigatórios' });
  financialModel.payInstallment(req.params.installment_id, { payment_date, payment_method });
  financialModel.recompute(req.params.id);
  res.json({ ok: true });
}

module.exports = { index, show, store, update, payInstallment };
