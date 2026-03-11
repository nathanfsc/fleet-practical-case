const { dbClient } = require("../../database");
const { createHttpError } = require("../../utils/httpError");
const { ProductRepository } = require("../product/product.repository");
const { OrderRepository } = require("./order.repository");

class OrderService {
  constructor({
    orderRepository = new OrderRepository(),
    productRepository = new ProductRepository(),
    databaseClient = dbClient,
  } = {}) {
    this.dbClient = databaseClient;
    this.orderRepository = orderRepository;
    this.productRepository = productRepository;
  }

  normalizeOrderItems(items) {
    if (!Array.isArray(items) || items.length === 0) {
      throw createHttpError(400, "Order items are required");
    }

    const normalizedItems = [];

    items.forEach((item) => {
      const productVariantId = Number(item.productVariantId);
      const quantity = Number(item.quantity);

      if (!Number.isInteger(productVariantId) || productVariantId <= 0) {
        throw createHttpError(400, "Invalid product variant id");
      }

      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw createHttpError(400, "Invalid item quantity");
      }

      const existingItem = normalizedItems.find(
        (entry) => entry.productVariantId === productVariantId,
      );

      if (!existingItem) {
        normalizedItems.push({ productVariantId, quantity });
        return;
      }

      existingItem.quantity += quantity;
    });

    return normalizedItems;
  }

  groupOrderRows(rows) {
    const orders = [];

    rows.forEach((row) => {
      let order = orders.find((entry) => entry.id === row.order_id);

      if (!order) {
        order = {
          id: row.order_id,
          totalAmount: row.total_amount,
          itemCount: row.item_count,
          createdAt: row.created_at,
          items: [],
        };
        orders.push(order);
      }

      if (!row.order_item_id) {
        return;
      }

      order.items.push({
        id: row.order_item_id,
        productId: row.product_id,
        productVariantId: row.product_variant_id,
        productName: row.product_name,
        configuration: row.configuration,
        sku: row.sku,
        unitPrice: row.unit_price,
        quantity: row.quantity,
        lineTotal: row.line_total,
      });
    });

    return orders;
  }

  async listOrders() {
    const rows = await this.orderRepository.findAllWithItems();
    return this.groupOrderRows(rows);
  }

  async createOrder(payload) {
    const requestedItems = this.normalizeOrderItems(payload.items);
    const variants = await this.productRepository.findVariantsByIds(
      requestedItems.map((item) => item.productVariantId),
    );

    if (variants.length !== requestedItems.length) {
      throw createHttpError(400, "One or more product variants do not exist");
    }

    const orderItems = [];
    let totalAmount = 0;
    let itemCount = 0;

    requestedItems.forEach((requestedItem) => {
      const variant = variants.find(
        (entry) => entry.variant_id === requestedItem.productVariantId,
      );

      if (!variant) {
        throw createHttpError(400, "One or more product variants do not exist");
      }

      if (requestedItem.quantity > Number(variant.stock || 0)) {
        throw createHttpError(
          409,
          `Insufficient stock for ${variant.name} (${variant.configuration})`,
        );
      }

      const lineTotal = Number(variant.price) * requestedItem.quantity;

      orderItems.push({
        productId: variant.id,
        productVariantId: variant.variant_id,
        productName: variant.name,
        configuration: variant.configuration,
        lineTotal,
        quantity: requestedItem.quantity,
        sku: variant.sku,
        unitPrice: Number(variant.price),
      });

      totalAmount += lineTotal;
      itemCount += requestedItem.quantity;
    });

    await this.dbClient.run("BEGIN TRANSACTION");

    try {
      const orderResult = await this.orderRepository.createOrder({
        itemCount,
        totalAmount,
      });

      const stockResult = await this.productRepository.decrementVariantStocks(
        orderItems.map((orderItem) => ({
          productVariantId: orderItem.productVariantId,
          quantity: orderItem.quantity,
        })),
      );

      if (stockResult.changes !== orderItems.length) {
        throw createHttpError(409, "Insufficient stock for one or more items");
      }

      await this.orderRepository.bulkCreateOrderItems(
        orderItems.map((orderItem) => ({
          ...orderItem,
          orderId: orderResult.lastID,
        })),
      );

      await this.dbClient.run("COMMIT");

      const rows = await this.orderRepository.findByIdWithItems(orderResult.lastID);
      return this.groupOrderRows(rows)[0] || null;
    } catch (error) {
      await this.dbClient.run("ROLLBACK");
      throw error;
    }
  }
}

module.exports = { OrderService };
