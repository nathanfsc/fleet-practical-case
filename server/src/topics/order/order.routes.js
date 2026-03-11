const express = require("express");

function createOrderRouter(orderController) {
  const router = express.Router();

  router.get("/orders", orderController.listOrders);
  router.post("/orders", orderController.createOrder);

  return router;
}

module.exports = { createOrderRouter };
