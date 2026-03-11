const path = require("node:path");

const { createApp } = require("../app");
const { createDatabaseClient, initializeDatabase } = require("../database");

const testDatabasePath = path.join(__dirname, "..", "..", "fleet.test.sqlite");

const testTables = [
  "order_items",
  "orders",
  "product_variants",
  "products",
  "devices",
  "employees",
];

async function clearTestDatabase(databaseClient) {
  for (const table of testTables) {
    await databaseClient.run(`DELETE FROM ${table}`);
  }

  await databaseClient.run("DELETE FROM sqlite_sequence");
}

async function createTestDatabase() {
  const databaseClient = createDatabaseClient(testDatabasePath);

  await initializeDatabase(databaseClient);
  await clearTestDatabase(databaseClient);

  const app = createApp({ databaseClient });

  async function createEmployee({ name = "Alice", role = "driver" } = {}) {
    const result = await databaseClient.run(
      "INSERT INTO employees (name, role) VALUES (?, ?)",
      [name, role],
    );

    return databaseClient.get(
      "SELECT id, name, role, created_at FROM employees WHERE id = ?",
      [result.lastID],
    );
  }

  async function createDevice({
    name = "Laptop",
    ownerId = null,
    type = "computer",
  } = {}) {
    const result = await databaseClient.run(
      "INSERT INTO devices (name, type, owner_id) VALUES (?, ?, ?)",
      [name, type, ownerId],
    );

    return databaseClient.get(
      `
        SELECT
          id,
          name,
          type,
          owner_id,
          created_at
        FROM devices
        WHERE id = ?
      `,
      [result.lastID],
    );
  }

  async function createProduct({
    basePrice = 100,
    name = "Bike",
    status = "active",
  } = {}) {
    const result = await databaseClient.run(
      "INSERT INTO products (name, status, base_price) VALUES (?, ?, ?)",
      [name, status, basePrice],
    );

    return databaseClient.get(
      "SELECT id, name, status, base_price, created_at FROM products WHERE id = ?",
      [result.lastID],
    );
  }

  async function createProductVariant({
    configuration = "Blue",
    priceDelta = 0,
    productId,
    sku = "BIKE-BLUE",
    stock = 4,
  }) {
    const result = await databaseClient.run(
      `
        INSERT INTO product_variants (
          product_id,
          configuration,
          sku,
          price_delta,
          stock
        ) VALUES (?, ?, ?, ?, ?)
      `,
      [productId, configuration, sku, priceDelta, stock],
    );

    return databaseClient.get(
      `
        SELECT
          id,
          product_id,
          configuration,
          sku,
          price_delta,
          stock,
          created_at
        FROM product_variants
        WHERE id = ?
      `,
      [result.lastID],
    );
  }

  async function close() {
    await clearTestDatabase(databaseClient);
    await databaseClient.close();
  }

  return {
    app,
    close,
    createDevice,
    createEmployee,
    createProduct,
    createProductVariant,
    databaseClient,
  };
}

module.exports = {
  createTestDatabase,
  testDatabasePath,
};
