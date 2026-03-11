const express = require("express");

function createProductRouter(productController) {
  const router = express.Router();

  router.get("/products", productController.listProducts);

  return router;
}

module.exports = { createProductRouter };
