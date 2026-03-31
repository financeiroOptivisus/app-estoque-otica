const soModel = require('../models/serviceOrderModel');
const financialModel = require('../models/financialModel');

function create(data) {
  const { items = [], financial, ...osData } = data;

  // soModel.create uses a better-sqlite3 transaction internally (throws on stock error)
  const result = soModel.create(osData, items);

  if (financial) {
    const finId = financialModel.create({ ...financial, service_order_id: result.id });
    if (financial.installments_qty > 1 && financial.installments) {
      financialModel.createInstallments(finId, financial.installments);
    }
  }

  return result;
}

function updateStatus(id, status) {
  const os = soModel.findById(id);
  if (!os) throw Object.assign(new Error('OS não encontrada'), { status: 404 });
  soModel.updateStatus(id, status);
}

module.exports = { create, updateStatus };
