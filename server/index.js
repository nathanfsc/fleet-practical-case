const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const { createApp } = require("./src/app");

const PORT = process.env.PORT || 3001;
const dbPath = path.join(__dirname, "fleet.sqlite");

function createDbClient(database) {
  function run(sql, params = []) {
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
  }

  function get(sql, params = []) {
    return new Promise((resolve, reject) => {
      database.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(row || null);
      });
    });
  }

  function all(sql, params = []) {
    return new Promise((resolve, reject) => {
      database.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(rows);
      });
    });
  }

  return {
    all,
    get,
    run,
  };
}

async function initializeDatabase(dbClient) {
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
}

async function startServer() {
  try {
    const database = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("Could not open sqlite database", err);
        return;
      }

      console.log("Connected to sqlite database at", dbPath);
    });
    const dbClient = createDbClient(database);

    await initializeDatabase(dbClient);

    const app = createApp(dbClient);

    app.listen(PORT, () => {
      console.log(`API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to initialize server", error);
    process.exit(1);
  }
}

startServer();
