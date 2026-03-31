const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dbDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const dbPath = process.env.DB_PATH || path.join(dbDir, 'bf_lentes.db');

// sql.js is async to init but we make it sync-like by initializing at startup
let _db = null;

function getDb() {
  if (!_db) throw new Error('DB não inicializado. Chame initDb() primeiro.');
  return _db;
}

async function initDb() {
  const SQL = await initSqlJs();
  let data;
  if (fs.existsSync(dbPath)) {
    data = fs.readFileSync(dbPath);
  }
  _db = new SQL.Database(data);
  _db.run('PRAGMA foreign_keys = ON;');

  // Auto-save to disk on every write
  const originalRun = _db.run.bind(_db);
  const originalExec = _db.exec.bind(_db);

  _db.run = function (sql, params) {
    const result = originalRun(sql, params);
    persist();
    return result;
  };

  _db.exec = function (sql) {
    const result = originalExec(sql);
    persist();
    return result;
  };

  return _db;
}

function persist() {
  if (!_db) return;
  const data = _db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

// Compatibility layer: wrap sql.js to look like better-sqlite3
// Returns a proxy object with .get(), .all(), .run()
function prepare(sql) {
  const db = getDb();
  return {
    get(...params) {
      const stmt = db.prepare(sql);
      stmt.bind(flatParams(params));
      const row = stmt.step() ? stmt.getAsObject() : undefined;
      stmt.free();
      return row;
    },
    all(...params) {
      const stmt = db.prepare(sql);
      stmt.bind(flatParams(params));
      const rows = [];
      while (stmt.step()) rows.push(stmt.getAsObject());
      stmt.free();
      return rows;
    },
    run(...params) {
      db.run(sql, flatParams(params));
      const changes = db.getRowsModified();
      // Get last insert rowid
      const rowid = db.exec('SELECT last_insert_rowid() AS id')[0]?.values[0]?.[0] || 0;
      return { lastInsertRowid: rowid, changes };
    },
  };
}

function exec(sql) {
  getDb().exec(sql);
}

function transaction(fn) {
  return function (...args) {
    const db = getDb();
    db.run('BEGIN');
    try {
      const result = fn(...args);
      db.run('COMMIT');
      persist();
      return result;
    } catch (e) {
      db.run('ROLLBACK');
      throw e;
    }
  };
}

// sql.js uses array params, flatten nested arrays
function flatParams(params) {
  if (params.length === 1 && Array.isArray(params[0])) return params[0];
  return params;
}

module.exports = { initDb, prepare, exec, transaction, getDb };
