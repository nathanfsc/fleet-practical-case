const express = require("express");

const { dbClient } = require("../database");
const { DeviceController } = require("./device/device.controller");
const { DeviceRepository } = require("./device/device.repository");
const { createDeviceRouter } = require("./device/device.routes");
const { DeviceService } = require("./device/device.service");
const { EmployeeController } = require("./employee/employee.controller");
const { EmployeeRepository } = require("./employee/employee.repository");
const { createEmployeeRouter } = require("./employee/employee.routes");
const { EmployeeService } = require("./employee/employee.service");
const { HealthController } = require("./health/health.controller");
const { createHealthRouter } = require("./health/health.routes");
const { OrderController } = require("./order/order.controller");
const { OrderRepository } = require("./order/order.repository");
const { createOrderRouter } = require("./order/order.routes");
const { OrderService } = require("./order/order.service");
const { ProductController } = require("./product/product.controller");
const { ProductRepository } = require("./product/product.repository");
const { createProductRouter } = require("./product/product.routes");
const { ProductService } = require("./product/product.service");
const { SharedController } = require("./shared/shared.controller");
const { SharedRepository } = require("./shared/shared.repository");
const { createSharedRouter } = require("./shared/shared.routes");
const { SharedService } = require("./shared/shared.service");

function createControllers({ databaseClient = dbClient } = {}) {
  const employeeRepository = new EmployeeRepository({ databaseClient });
  const deviceRepository = new DeviceRepository({ databaseClient });
  const productRepository = new ProductRepository({ databaseClient });
  const orderRepository = new OrderRepository({ databaseClient });
  const sharedRepository = new SharedRepository({ databaseClient });

  const employeeService = new EmployeeService({
    deviceRepository,
    employeeRepository,
  });
  const deviceService = new DeviceService({
    deviceRepository,
    employeeRepository,
  });
  const productService = new ProductService({ productRepository });
  const orderService = new OrderService({
    databaseClient,
    orderRepository,
    productRepository,
  });
  const sharedService = new SharedService({ sharedRepository });

  return {
    deviceController: new DeviceController({ deviceService }),
    employeeController: new EmployeeController({ employeeService }),
    healthController: new HealthController(),
    orderController: new OrderController({ orderService }),
    productController: new ProductController({ productService }),
    sharedController: new SharedController({ sharedService }),
  };
}

function createApiRouter({ databaseClient } = {}) {
  const router = express.Router();
  const controllers = createControllers({ databaseClient });

  router.use(createHealthRouter(controllers.healthController));
  router.use(createEmployeeRouter(controllers.employeeController));
  router.use(createDeviceRouter(controllers.deviceController));
  router.use(createProductRouter(controllers.productController));
  router.use(createOrderRouter(controllers.orderController));
  router.use(createSharedRouter(controllers.sharedController));

  return router;
}

module.exports = { createApiRouter, createControllers };
