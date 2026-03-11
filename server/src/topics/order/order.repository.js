const { dbClient } = require("../../database");

class OrderRepository {
  constructor({ databaseClient = dbClient } = {}) {
    this.dbClient = databaseClient;
  }

  createOrder({ itemCount, totalAmount }) {
    return this.dbClient.run(
      "INSERT INTO orders (total_amount, item_count) VALUES (?, ?)",
      [totalAmount, itemCount],
    );
  }

  createOrderItem(orderItem) {
    return this.dbClient.run(
      `
        INSERT INTO order_items (
          order_id,
          product_id,
          product_variant_id,
          product_name,
          configuration,
          sku,
          unit_price,
          quantity,
          line_total
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        orderItem.orderId,
        orderItem.productId,
        orderItem.productVariantId,
        orderItem.productName,
        orderItem.configuration,
        orderItem.sku,
        orderItem.unitPrice,
        orderItem.quantity,
        orderItem.lineTotal,
      ],
    );
  }

  bulkCreateOrderItems(orderItems) {
    if (!orderItems.length) {
      return Promise.resolve({ changes: 0, lastID: 0 });
    }

    const values = orderItems
      .map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .join(", ");
    const params = orderItems.flatMap((orderItem) => [
      orderItem.orderId,
      orderItem.productId,
      orderItem.productVariantId,
      orderItem.productName,
      orderItem.configuration,
      orderItem.sku,
      orderItem.unitPrice,
      orderItem.quantity,
      orderItem.lineTotal,
    ]);

    return this.dbClient.run(
      `
        INSERT INTO order_items (
          order_id,
          product_id,
          product_variant_id,
          product_name,
          configuration,
          sku,
          unit_price,
          quantity,
          line_total
        ) VALUES ${values}
      `,
      params,
    );
  }

  findAllWithItems() {
    return this.dbClient.all(`
      SELECT
        o.id AS order_id,
        o.total_amount,
        o.item_count,
        o.created_at,
        oi.id AS order_item_id,
        oi.product_id,
        oi.product_variant_id,
        oi.product_name,
        oi.configuration,
        oi.sku,
        oi.unit_price,
        oi.quantity,
        oi.line_total
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      ORDER BY o.id DESC, oi.id ASC
    `);
  }

  findByIdWithItems(orderId) {
    return this.dbClient.all(
      `
        SELECT
          o.id AS order_id,
          o.total_amount,
          o.item_count,
          o.created_at,
          oi.id AS order_item_id,
          oi.product_id,
          oi.product_variant_id,
          oi.product_name,
          oi.configuration,
          oi.sku,
          oi.unit_price,
          oi.quantity,
          oi.line_total
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        WHERE o.id = ?
        ORDER BY oi.id ASC
      `,
      [orderId],
    );
  }
}

module.exports = { OrderRepository };
