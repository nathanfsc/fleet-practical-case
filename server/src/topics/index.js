const express = require("express");

const { createDeviceRouter } = require("./device/device.routes");
const { DeviceController } = require("./device/device.controller");
const { createEmployeeRouter } = require("./employee/employee.routes");
const { EmployeeController } = require("./employee/employee.controller");
const { createHealthRouter } = require("./health/health.routes");
const { HealthController } = require("./health/health.controller");
const { createOrderRouter } = require("./order/order.routes");
const { OrderController } = require("./order/order.controller");
const { createProductRouter } = require("./product/product.routes");
const { ProductController } = require("./product/product.controller");
const { createSharedRouter } = require("./shared/shared.routes");
const { SharedController } = require("./shared/shared.controller");

function createApiRouter() {
  const router = express.Router();
  const controllers = {
    deviceController: new DeviceController(),
    employeeController: new EmployeeController(),
    healthController: new HealthController(),
    orderController: new OrderController(),
    productController: new ProductController(),
    sharedController: new SharedController(),
  };

  router.use(createHealthRouter(controllers.healthController));
  router.use(createEmployeeRouter(controllers.employeeController));
  router.use(createDeviceRouter(controllers.deviceController));
  router.use(createProductRouter(controllers.productController));
  router.use(createOrderRouter(controllers.orderController));
  router.use(createSharedRouter(controllers.sharedController));

  return router;
}

module.exports = { createApiRouter };
