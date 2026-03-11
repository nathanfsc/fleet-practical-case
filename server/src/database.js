const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const defaultDatabasePath = path.join(__dirname, "..", "fleet.sqlite");

function createDatabaseClient(databasePath = defaultDatabasePath) {
  const database = new sqlite3.Database(databasePath, (err) => {
    if (err) {
      console.error("Could not open sqlite database", err);
    }
  });

  return {
    all(sql, params = []) {
      return new Promise((resolve, reject) => {
        database.all(sql, params, (err, rows) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(rows);
        });
      });
    },

    close() {
      return new Promise((resolve, reject) => {
        database.close((err) => {
          if (err) {
            reject(err);
            return;
          }

          resolve();
        });
      });
    },

    get(sql, params = []) {
      return new Promise((resolve, reject) => {
        database.get(sql, params, (err, row) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(row || null);
        });
      });
    },

    run(sql, params = []) {
      return new Promise((resolve, reject) => {
        database.run(sql, params, function onRun(err) {
          if (err) {
            reject(err);
            return;
          }

          resolve({
            changes: this.changes,
            lastID: this.lastID,
          });
        });
      });
    },
  };
}

let defaultDatabaseClient = null;

function getDefaultDatabaseClient() {
  if (!defaultDatabaseClient) {
    defaultDatabaseClient = createDatabaseClient();
  }

  return defaultDatabaseClient;
}

const dbClient = {
  all(sql, params = []) {
    return getDefaultDatabaseClient().all(sql, params);
  },

  async close() {
    if (!defaultDatabaseClient) {
      return;
    }

    await defaultDatabaseClient.close();
    defaultDatabaseClient = null;
  },

  get(sql, params = []) {
    return getDefaultDatabaseClient().get(sql, params);
  },

  run(sql, params = []) {
    return getDefaultDatabaseClient().run(sql, params);
  },
};

async function initializeDatabase(databaseClient = dbClient) {
  await databaseClient.run(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await databaseClient.run(`
    CREATE TABLE IF NOT EXISTS devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      owner_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES employees(id) ON DELETE SET NULL
    )
  `);

  await databaseClient.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      base_price REAL NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await databaseClient.run(`
    CREATE TABLE IF NOT EXISTS product_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      configuration TEXT NOT NULL,
      sku TEXT NOT NULL UNIQUE,
      price_delta REAL NOT NULL DEFAULT 0,
      stock INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  await databaseClient.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total_amount REAL NOT NULL,
      item_count INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await databaseClient.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_variant_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      configuration TEXT NOT NULL,
      sku TEXT NOT NULL,
      unit_price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      line_total REAL NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    )
  `);
}

module.exports = {
  createDatabaseClient,
  dbClient,
  defaultDatabasePath,
  getDefaultDatabaseClient,
  initializeDatabase,
};
