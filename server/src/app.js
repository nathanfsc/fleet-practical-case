const cors = require("cors");
const express = require("express");

const { createDeviceController } = require("./controllers/deviceController");
const { createEmployeeController } = require("./controllers/employeeController");
const { createHealthController } = require("./controllers/healthController");
const { createDeviceRepository } = require("./repositories/deviceRepository");
const { createEmployeeRepository } = require("./repositories/employeeRepository");
const { createApiRouter } = require("./routes");
const { createDeviceService } = require("./services/deviceService");
const { createEmployeeService } = require("./services/employeeService");

function createApp(dbClient) {
  const app = express();
  const employeeRepository = createEmployeeRepository(dbClient);
  const deviceRepository = createDeviceRepository(dbClient);
  const employeeService = createEmployeeService({
    deviceRepository,
    employeeRepository,
  });
  const deviceService = createDeviceService({
    deviceRepository,
    employeeRepository,
  });
  const controllers = {
    deviceController: createDeviceController(deviceService),
    employeeController: createEmployeeController(employeeService),
    healthController: createHealthController(),
  };

  app.use(cors());
  app.use(express.json());
  app.use("/api", createApiRouter(controllers));

  return app;
}

module.exports = { createApp };
