const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "..", "fleet.sqlite");
const database = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Could not open sqlite database", err);
    return;
  }

  console.log("Connected to sqlite database at", dbPath);
});

const dbClient = {
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

async function initializeDatabase() {
  await dbClient.run(`
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await dbClient.run(`
    CREATE TABLE IF NOT EXISTS devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      owner_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES employees(id) ON DELETE SET NULL
    )
  `);

  await dbClient.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      base_price REAL NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await dbClient.run(`
    CREATE TABLE IF NOT EXISTS product_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      price_delta REAL NOT NULL,
      configuration TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);
}

module.exports = {
  dbClient,
  initializeDatabase,
};
