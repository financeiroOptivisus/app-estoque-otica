const { prepare, transaction } = require('../config/db');

function generateCode() {
  const row = prepare("SELECT MAX(CAST(SUBSTR(code, 3) AS INTEGER)) AS max_num FROM service_orders").get();
  const next = (row?.max_num || 0) + 1;
  return 'OS' + String(next).padStart(4, '0');
}

function isCodeTaken(code, excludeId) {
  const row = prepare('SELECT id FROM service_orders WHERE code = ?').get(code);
  if (!row) return false;
  return !excludeId || row.id !== Number(excludeId);
}

function findAll({ status = '', client_id = '', date_from = '', date_to = '', page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  let where = '1=1';
  const params = [];

  if (status) { where += ' AND so.status = ?'; params.push(status); }
  if (client_id) { where += ' AND so.client_id = ?'; params.push(client_id); }
  if (date_from) { where += ' AND so.entry_date >= ?'; params.push(date_from); }
  if (date_to) { where += ' AND so.entry_date <= ?'; params.push(date_to); }

  const data = prepare(
    `SELECT so.id, so.code, so.status, so.order_type, so.entry_date, so.delivery_date, so.total_value,
            so.surfacing_done, so.assembly_done,
            c.name AS client_name, c.code AS client_code, c.phone AS client_phone
     FROM service_orders so
     JOIN clients c ON c.id = so.client_id
     WHERE ${where}
     ORDER BY so.entry_date DESC, so.id DESC
     LIMIT ? OFFSET ?`
  ).all(...params, limit, offset);

  const row = prepare(`SELECT COUNT(*) AS total FROM service_orders so WHERE ${where}`).get(...params);
  return { data, total: row?.total || 0 };
}

function findById(id) {
  const os = prepare(
    `SELECT so.*, c.name AS client_name, c.code AS client_code, c.phone AS client_phone
     FROM service_orders so
     JOIN clients c ON c.id = so.client_id
     WHERE so.id = ?`
  ).get(id);
  if (!os) return null;
  os.items = prepare(
    `SELECT oi.*, l.code AS lens_code, l.type AS lens_type, l.brand AS lens_brand, l.index_value
     FROM os_items oi
     JOIN lenses l ON l.id = oi.lens_id
     WHERE oi.service_order_id = ?`
  ).all(id);
  return os;
}

const createTransaction = transaction((data, items) => {
  const code = data.code || generateCode();

  if (isCodeTaken(code, null)) {
    throw Object.assign(new Error(`Código ${code} já está em uso`), { status: 409 });
  }

  const {
    client_id, order_type, entry_date, delivery_date, status, technical_notes,
    od_sphere, od_cylinder, od_axis, od_addition, od_pd,
    oe_sphere, oe_cylinder, oe_axis, oe_addition, oe_pd,
    frame_brand, frame_model, frame_color, frame_type, frame_size,
    frame_height, frame_measure, frame_height_measure,
    surfacing_done, assembly_done,
    svc_incolor, svc_antireflexo, svc_filtro_azul, svc_fotosensivel,
    svc_fotoar, svc_alto_indice, svc_policarbonato,
    discount, total_value
  } = data;

  const result = prepare(
    `INSERT INTO service_orders
     (code, client_id, order_type, entry_date, delivery_date, status, technical_notes,
      od_sphere, od_cylinder, od_axis, od_addition, od_pd,
      oe_sphere, oe_cylinder, oe_axis, oe_addition, oe_pd,
      frame_brand, frame_model, frame_color, frame_type, frame_size,
      frame_height, frame_measure, frame_height_measure,
      surfacing_done, assembly_done,
      svc_incolor, svc_antireflexo, svc_filtro_azul, svc_fotosensivel,
      svc_fotoar, svc_alto_indice, svc_policarbonato,
      discount, total_value)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).run(
    code, client_id, order_type || 'Fabricacao', entry_date, delivery_date || null,
    status || 'Em producao', technical_notes || null,
    od_sphere || null, od_cylinder || null, od_axis || null, od_addition || null, od_pd || null,
    oe_sphere || null, oe_cylinder || null, oe_axis || null, oe_addition || null, oe_pd || null,
    frame_brand || null, frame_model || null, frame_color || null,
    frame_type || null, frame_size || null,
    frame_height || null, frame_measure || null, frame_height_measure || null,
    surfacing_done ? 1 : 0, assembly_done ? 1 : 0,
    svc_incolor ? 1 : 0, svc_antireflexo ? 1 : 0, svc_filtro_azul ? 1 : 0,
    svc_fotosensivel ? 1 : 0, svc_fotoar ? 1 : 0, svc_alto_indice ? 1 : 0,
    svc_policarbonato ? 1 : 0,
    discount || 0, total_value || 0
  );

  const osId = result.lastInsertRowid;

  for (const item of items) {
    const lens = prepare('SELECT stock_qty FROM lenses WHERE id = ? AND active = 1').get(item.lens_id);
    if (!lens) throw Object.assign(new Error(`Lente ${item.lens_id} não encontrada`), { status: 404 });
    if (lens.stock_qty < item.qty) {
      throw Object.assign(new Error(`Estoque insuficiente para lente ID ${item.lens_id}`), { status: 409 });
    }
    prepare(
      'INSERT INTO os_items (service_order_id, lens_id, eye, qty, unit_price, subtotal) VALUES (?,?,?,?,?,?)'
    ).run(osId, item.lens_id, item.eye || 'PAR', item.qty, item.unit_price, item.subtotal);
    prepare('UPDATE lenses SET stock_qty = stock_qty - ? WHERE id = ?').run(item.qty, item.lens_id);
  }

  return { id: osId, code };
});

function create(data, items) {
  return createTransaction(data, items);
}

function update(id, data) {
  const {
    code, order_type, delivery_date, status, technical_notes,
    od_sphere, od_cylinder, od_axis, od_addition, od_pd,
    oe_sphere, oe_cylinder, oe_axis, oe_addition, oe_pd,
    frame_brand, frame_model, frame_color, frame_type, frame_size,
    frame_height, frame_measure, frame_height_measure,
    surfacing_done, assembly_done,
    svc_incolor, svc_antireflexo, svc_filtro_azul, svc_fotosensivel,
    svc_fotoar, svc_alto_indice, svc_policarbonato,
    discount, total_value
  } = data;

  if (code && isCodeTaken(code, id)) {
    throw Object.assign(new Error(`Código ${code} já está em uso`), { status: 409 });
  }

  prepare(
    `UPDATE service_orders SET
     ${code ? 'code=?,' : ''}
     order_type=?, delivery_date=?, status=?, technical_notes=?,
     od_sphere=?, od_cylinder=?, od_axis=?, od_addition=?, od_pd=?,
     oe_sphere=?, oe_cylinder=?, oe_axis=?, oe_addition=?, oe_pd=?,
     frame_brand=?, frame_model=?, frame_color=?, frame_type=?, frame_size=?,
     frame_height=?, frame_measure=?, frame_height_measure=?,
     surfacing_done=?, assembly_done=?,
     svc_incolor=?, svc_antireflexo=?, svc_filtro_azul=?, svc_fotosensivel=?,
     svc_fotoar=?, svc_alto_indice=?, svc_policarbonato=?,
     discount=?, total_value=?, updated_at=datetime('now')
     WHERE id=?`
  ).run(
    ...(code ? [code] : []),
    order_type || 'Fabricacao', delivery_date || null, status, technical_notes || null,
    od_sphere || null, od_cylinder || null, od_axis || null, od_addition || null, od_pd || null,
    oe_sphere || null, oe_cylinder || null, oe_axis || null, oe_addition || null, oe_pd || null,
    frame_brand || null, frame_model || null, frame_color || null,
    frame_type || null, frame_size || null,
    frame_height || null, frame_measure || null, frame_height_measure || null,
    surfacing_done ? 1 : 0, assembly_done ? 1 : 0,
    svc_incolor ? 1 : 0, svc_antireflexo ? 1 : 0, svc_filtro_azul ? 1 : 0,
    svc_fotosensivel ? 1 : 0, svc_fotoar ? 1 : 0, svc_alto_indice ? 1 : 0,
    svc_policarbonato ? 1 : 0,
    discount || 0, total_value || 0, id
  );
}

function updateStatus(id, status) {
  prepare("UPDATE service_orders SET status = ?, updated_at=datetime('now') WHERE id = ?").run(status, id);
}

module.exports = { findAll, findById, create, update, updateStatus };
