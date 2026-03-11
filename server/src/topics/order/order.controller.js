const { sendErrorResponse } = require("../../utils/httpError");
const { OrderService } = require("./order.service");

class OrderController {
  constructor({ orderService = new OrderService() } = {}) {
    this.orderService = orderService;
    this.createOrder = this.createOrder.bind(this);
    this.listOrders = this.listOrders.bind(this);
  }

  async createOrder(req, res) {
    try {
      const order = await this.orderService.createOrder(req.body || {});
      res.status(201).json(order);
    } catch (error) {
      sendErrorResponse(res, error, "Failed to create order");
    }
  }

  async listOrders(req, res) {
    try {
      const orders = await this.orderService.listOrders();
      res.json(orders);
    } catch (error) {
      sendErrorResponse(res, error, "Failed to fetch orders");
    }
  }
}

module.exports = { OrderController };
