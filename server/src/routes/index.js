const express = require("express");

const { createDeviceRouter } = require("./deviceRoutes");
const { createEmployeeRouter } = require("./employeeRoutes");
const { createHealthRouter } = require("./healthRoutes");

function createApiRouter(controllers) {
  const router = express.Router();

  router.use(createHealthRouter(controllers.healthController));
  router.use(createEmployeeRouter(controllers.employeeController));
  router.use(createDeviceRouter(controllers.deviceController));

  return router;
}

module.exports = { createApiRouter };
