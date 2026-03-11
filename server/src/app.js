const cors = require("cors");
const express = require("express");

const { DeviceController } = require("./controllers/deviceController");
const { EmployeeController } = require("./controllers/employeeController");
const { HealthController } = require("./controllers/healthController");
const { OrderController } = require("./controllers/orderController");
const { ProductController } = require("./controllers/productController");
const { createApiRouter } = require("./routes");

function createApp() {
  const app = express();
  const controllers = {
    deviceController: new DeviceController(),
    employeeController: new EmployeeController(),
    healthController: new HealthController(),
    orderController: new OrderController(),
    productController: new ProductController(),
  };

  app.use(cors());
  app.use(express.json());
  app.use("/api", createApiRouter(controllers));

  return app;
}

module.exports = { createApp };
