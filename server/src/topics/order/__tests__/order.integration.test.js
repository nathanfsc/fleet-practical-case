const assert = require("node:assert/strict");
const { after, before, describe, it } = require("node:test");
const request = require("supertest");

const { createTestDatabase } = require("../../../test-support/test.database");

describe("POST /api/orders", () => {
  let context;

  before(async () => {
    context = await createTestDatabase();
  });

  after(async () => {
    await context.close();
  });

  it("should create an order, persist items, and decrement stock", async () => {
    const product = await context.createProduct({
      basePrice: 80,
      name: "Bike",
    });
    const variant = await context.createProductVariant({
      configuration: "Blue",
      priceDelta: 0,
      productId: product.id,
      sku: "BIKE-BLUE",
      stock: 4,
    });

    const createResponse = await request(context.app)
      .post("/api/orders")
      .send({
        items: [{ productVariantId: variant.id, quantity: 3 }],
      });

    assert.equal(createResponse.status, 201);
    assert.equal(createResponse.body.itemCount, 3);
    assert.equal(createResponse.body.totalAmount, 240);
    assert.equal(createResponse.body.items.length, 1);
    assert.equal(createResponse.body.items[0].productVariantId, variant.id);
    assert.equal(createResponse.body.items[0].quantity, 3);

    const storedVariant = await context.databaseClient.get(
      "SELECT stock FROM product_variants WHERE id = ?",
      [variant.id],
    );
    assert.equal(storedVariant.stock, 1);
  });

  it("should reject missing variants", async () => {
    const response = await request(context.app)
      .post("/api/orders")
      .send({
        items: [{ productVariantId: 999, quantity: 1 }],
      });

    assert.equal(response.status, 400);
    assert.equal(response.body.message, "One or more product variants do not exist");
  });

  it("should reject insufficient stock", async () => {
    const lowStockProduct = await context.createProduct({
      basePrice: 80,
      name: "Bike Low Stock",
    });
    const lowStockVariant = await context.createProductVariant({
      configuration: "Blue",
      priceDelta: 0,
      productId: lowStockProduct.id,
      sku: "BIKE-LOW-STOCK",
      stock: 2,
    });

    const response = await request(context.app)
      .post("/api/orders")
      .send({
        items: [{ productVariantId: lowStockVariant.id, quantity: 3 }],
      });

    assert.equal(response.status, 409);
    assert.equal(response.body.message, "Insufficient stock for Bike Low Stock (Blue)");
  });
});

describe("GET /api/orders", () => {
  let context;

  before(async () => {
    context = await createTestDatabase();
  });

  after(async () => {
    await context.close();
  });

  it("should list persisted orders", async () => {
    const product = await context.createProduct({
      basePrice: 80,
      name: "Bike",
    });
    const variant = await context.createProductVariant({
      configuration: "Blue",
      priceDelta: 0,
      productId: product.id,
      sku: "BIKE-BLUE-LIST",
      stock: 4,
    });

    await request(context.app)
      .post("/api/orders")
      .send({
        items: [{ productVariantId: variant.id, quantity: 3 }],
      });

    const listResponse = await request(context.app).get("/api/orders");

    assert.equal(listResponse.status, 200);
    assert.equal(listResponse.body.length, 1);
    assert.equal(listResponse.body[0].itemCount, 3);
  });
});
