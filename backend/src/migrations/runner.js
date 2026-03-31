const { exec } = require('../config/db');

function migrate() {
  // Base tables (CREATE IF NOT EXISTS — safe to re-run)
  exec(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      email      TEXT    NOT NULL UNIQUE,
      password   TEXT    NOT NULL,
      role       TEXT    NOT NULL DEFAULT 'user',
      active     INTEGER NOT NULL DEFAULT 1,
      created_at TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS clients (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      code       TEXT    NOT NULL UNIQUE,
      name       TEXT    NOT NULL,
      phone      TEXT,
      cpf_cnpj   TEXT,
      email      TEXT,
      address    TEXT,
      notes      TEXT,
      active     INTEGER NOT NULL DEFAULT 1,
      created_at TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS frames (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      code       TEXT    NOT NULL UNIQUE,
      brand      TEXT,
      model      TEXT,
      color      TEXT,
      type       TEXT,
      size       TEXT,
      stock_qty  INTEGER NOT NULL DEFAULT 0,
      cost_price REAL    NOT NULL DEFAULT 0,
      sale_price REAL    NOT NULL DEFAULT 0,
      notes      TEXT,
      active     INTEGER NOT NULL DEFAULT 1,
      created_at TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS lenses (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      code            TEXT    NOT NULL UNIQUE,
      type            TEXT    NOT NULL,
      index_value     REAL,
      brand           TEXT,
      supplier        TEXT,
      stock_qty       INTEGER NOT NULL DEFAULT 0,
      low_stock_alert INTEGER NOT NULL DEFAULT 5,
      cost_price      REAL    NOT NULL DEFAULT 0,
      sale_price      REAL    NOT NULL DEFAULT 0,
      description     TEXT,
      treatment       TEXT,
      diameter        REAL,
      base            REAL,
      addition_min    REAL,
      addition_max    REAL,
      eye             TEXT,
      active          INTEGER NOT NULL DEFAULT 1,
      created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS service_orders (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      code             TEXT    NOT NULL UNIQUE,
      client_id        INTEGER NOT NULL REFERENCES clients(id),
      order_type       TEXT    NOT NULL DEFAULT 'Fabricacao',
      entry_date       TEXT    NOT NULL,
      delivery_date    TEXT,
      status           TEXT    NOT NULL DEFAULT 'Em producao',
      technical_notes  TEXT,
      od_sphere        REAL, od_cylinder REAL, od_axis INTEGER, od_addition REAL, od_pd REAL,
      oe_sphere        REAL, oe_cylinder REAL, oe_axis INTEGER, oe_addition REAL, oe_pd REAL,
      frame_brand      TEXT,
      frame_model      TEXT,
      frame_color      TEXT,
      frame_type       TEXT,
      frame_size       TEXT,
      frame_height     REAL,
      frame_measure    TEXT,
      frame_height_measure REAL,
      surfacing_done   INTEGER NOT NULL DEFAULT 0,
      assembly_done    INTEGER NOT NULL DEFAULT 0,
      svc_incolor      INTEGER NOT NULL DEFAULT 0,
      svc_antireflexo  INTEGER NOT NULL DEFAULT 0,
      svc_filtro_azul  INTEGER NOT NULL DEFAULT 0,
      svc_fotosensivel INTEGER NOT NULL DEFAULT 0,
      svc_fotoar       INTEGER NOT NULL DEFAULT 0,
      svc_alto_indice  INTEGER NOT NULL DEFAULT 0,
      svc_policarbonato INTEGER NOT NULL DEFAULT 0,
      discount         REAL    NOT NULL DEFAULT 0,
      total_value      REAL    NOT NULL DEFAULT 0,
      created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at       TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS os_items (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      service_order_id INTEGER NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
      lens_id          INTEGER NOT NULL REFERENCES lenses(id),
      eye              TEXT    NOT NULL DEFAULT 'PAR',
      qty              INTEGER NOT NULL DEFAULT 1,
      unit_price       REAL    NOT NULL,
      subtotal         REAL    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS financials (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      service_order_id INTEGER NOT NULL REFERENCES service_orders(id),
      client_id        INTEGER NOT NULL REFERENCES clients(id),
      total_amount     REAL    NOT NULL,
      amount_paid      REAL    NOT NULL DEFAULT 0,
      balance          REAL    NOT NULL DEFAULT 0,
      payment_method   TEXT    NOT NULL DEFAULT 'Dinheiro',
      installments_qty INTEGER NOT NULL DEFAULT 1,
      payment_date     TEXT,
      due_date         TEXT,
      status           TEXT    NOT NULL DEFAULT 'Pendente',
      notes            TEXT,
      created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at       TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS installments (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      financial_id    INTEGER NOT NULL REFERENCES financials(id) ON DELETE CASCADE,
      installment_num INTEGER NOT NULL,
      amount          REAL    NOT NULL,
      due_date        TEXT    NOT NULL,
      payment_date    TEXT,
      status          TEXT    NOT NULL DEFAULT 'Pendente',
      payment_method  TEXT
    );
  `);

  // Incremental ALTER TABLE for existing databases (columns added in this version)
  const alterColumns = [
    // service_orders new columns
    ['service_orders', 'order_type',          "TEXT NOT NULL DEFAULT 'Fabricacao'"],
    ['service_orders', 'frame_type',          'TEXT'],
    ['service_orders', 'frame_size',          'TEXT'],
    ['service_orders', 'frame_height',        'REAL'],
    ['service_orders', 'frame_measure',       'TEXT'],
    ['service_orders', 'frame_height_measure','REAL'],
    ['service_orders', 'svc_incolor',         'INTEGER NOT NULL DEFAULT 0'],
    ['service_orders', 'svc_antireflexo',     'INTEGER NOT NULL DEFAULT 0'],
    ['service_orders', 'svc_filtro_azul',     'INTEGER NOT NULL DEFAULT 0'],
    ['service_orders', 'svc_fotosensivel',    'INTEGER NOT NULL DEFAULT 0'],
    ['service_orders', 'svc_fotoar',          'INTEGER NOT NULL DEFAULT 0'],
    ['service_orders', 'svc_alto_indice',     'INTEGER NOT NULL DEFAULT 0'],
    ['service_orders', 'svc_policarbonato',   'INTEGER NOT NULL DEFAULT 0'],
    // lenses new columns
    ['lenses', 'treatment',    'TEXT'],
    ['lenses', 'diameter',     'REAL'],
    ['lenses', 'base',         'REAL'],
    ['lenses', 'addition_min', 'REAL'],
    ['lenses', 'addition_max', 'REAL'],
    ['lenses', 'eye',          'TEXT'],
  ];

  for (const [table, col, def] of alterColumns) {
    try {
      exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
    } catch (e) {
      // Column already exists — ignore
    }
  }

  console.log('Migrations aplicadas com sucesso.');
}

module.exports = migrate;
