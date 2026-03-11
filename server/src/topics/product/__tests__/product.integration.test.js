const assert = require("node:assert/strict");
const { after, before, describe, it } = require("node:test");
const request = require("supertest");

const { createTestDatabase } = require("../../../test-support/test.database");

describe("GET /api/products", () => {
  let context;
  let product;
  let variant;

  before(async () => {
    context = await createTestDatabase();
    product = await context.createProduct({
      basePrice: 80,
      name: "Bike",
    });
    variant = await context.createProductVariant({
      configuration: "Blue",
      priceDelta: 20,
      productId: product.id,
      sku: "BIKE-BLUE",
      stock: 4,
    });
  });

  after(async () => {
    await context.close();
  });

  it("should return the seeded catalog rows", async () => {
    const response = await request(context.app).get("/api/products");

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, [
      {
        configuration: "Blue",
        id: product.id,
        name: "Bike",
        price: 100,
        sku: "BIKE-BLUE",
        stock: 4,
        variant_id: variant.id,
      },
    ]);
  });
});
