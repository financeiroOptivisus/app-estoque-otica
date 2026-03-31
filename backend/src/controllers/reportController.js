const reportService = require('../services/reportService');

function dashboard(req, res) {
  res.json(reportService.getDashboard());
}

function revenue(req, res) {
  res.json(reportService.getRevenue(req.query));
}

function debtors(req, res) {
  res.json(reportService.getDebtors());
}

function lowStock(req, res) {
  res.json(reportService.getLowStock());
}

function topLenses(req, res) {
  res.json(reportService.getTopLenses(req.query));
}

module.exports = { dashboard, revenue, debtors, lowStock, topLenses };
