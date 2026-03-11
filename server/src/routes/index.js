const express = require("express");

const { createDeviceRouter } = require("./deviceRoutes");
const { createEmployeeRouter } = require("./employeeRoutes");
const { createHealthRouter } = require("./healthRoutes");
const { createOrderRouter } = require("./orderRoutes");
const { createProductRouter } = require("./productRoutes");

function createApiRouter(controllers) {
  const router = express.Router();

  router.use(createHealthRouter(controllers.healthController));
  router.use(createEmployeeRouter(controllers.employeeController));
  router.use(createDeviceRouter(controllers.deviceController));
  router.use(createProductRouter(controllers.productController));
  router.use(createOrderRouter(controllers.orderController));

  return router;
}

module.exports = { createApiRouter };
