const assert = require("node:assert/strict");
const test = require("node:test");

const { OrderService } = require("../order.service");

test("OrderService.normalizeOrderItems merges duplicate variants", () => {
  const service = new OrderService({
    databaseClient: { run: async () => ({}) },
    orderRepository: {},
    productRepository: {},
  });

  const result = service.normalizeOrderItems([
    { productVariantId: 3, quantity: 1 },
    { productVariantId: "3", quantity: 2 },
    { productVariantId: 4, quantity: 1 },
  ]);

  assert.deepEqual(result, [
    { productVariantId: 3, quantity: 3 },
    { productVariantId: 4, quantity: 1 },
  ]);
});

test("OrderService.createOrder rejects missing variants", async () => {
  const service = new OrderService({
    databaseClient: {
      async run() {
        throw new Error("dbClient.run should not be called");
      },
    },
    orderRepository: {},
    productRepository: {
      async findVariantsByIds() {
        return [];
      },
    },
  });

  await assert.rejects(
    () =>
      service.createOrder({
        items: [{ productVariantId: 1, quantity: 1 }],
      }),
    {
      message: "One or more product variants do not exist",
      statusCode: 400,
    },
  );
});

test("OrderService.createOrder builds the order, updates stock, and commits", async () => {
  const dbCalls = [];
  const createdItems = [];
  const service = new OrderService({
    databaseClient: {
      async run(sql) {
        dbCalls.push(sql);
        return {};
      },
    },
    orderRepository: {
      async createOrder(payload) {
        assert.deepEqual(payload, {
          itemCount: 3,
          totalAmount: 240,
        });
        return { lastID: 17 };
      },
      async createOrderItem(payload) {
        createdItems.push(payload);
      },
      async findByIdWithItems(orderId) {
        assert.equal(orderId, 17);
        return [
          {
            configuration: "Blue",
            created_at: "2026-03-11T00:00:00.000Z",
            item_count: 3,
            line_total: 240,
            order_id: 17,
            order_item_id: 99,
            product_id: 8,
            product_name: "Bike",
            product_variant_id: 5,
            quantity: 3,
            sku: "BIKE-BLUE",
            total_amount: 240,
            unit_price: 80,
          },
        ];
      },
    },
    productRepository: {
      async decrementVariantStock(payload) {
        assert.deepEqual(payload, {
          productVariantId: 5,
          quantity: 3,
        });
        return { changes: 1 };
      },
      async findVariantsByIds(ids) {
        assert.deepEqual(ids, [5]);
        return [
          {
            configuration: "Blue",
            id: 8,
            name: "Bike",
            price: 80,
            sku: "BIKE-BLUE",
            stock: 4,
            variant_id: 5,
          },
        ];
      },
    },
  });

  const result = await service.createOrder({
    items: [{ productVariantId: 5, quantity: 3 }],
  });

  assert.deepEqual(dbCalls, ["BEGIN TRANSACTION", "COMMIT"]);
  assert.deepEqual(createdItems, [
    {
      configuration: "Blue",
      lineTotal: 240,
      orderId: 17,
      productId: 8,
      productName: "Bike",
      productVariantId: 5,
      quantity: 3,
      sku: "BIKE-BLUE",
      unitPrice: 80,
    },
  ]);
  assert.deepEqual(result, {
    createdAt: "2026-03-11T00:00:00.000Z",
    id: 17,
    itemCount: 3,
    items: [
      {
        configuration: "Blue",
        id: 99,
        lineTotal: 240,
        productId: 8,
        productName: "Bike",
        productVariantId: 5,
        quantity: 3,
        sku: "BIKE-BLUE",
        unitPrice: 80,
      },
    ],
    totalAmount: 240,
  });
});
