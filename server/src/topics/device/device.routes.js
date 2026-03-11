const express = require("express");

function createDeviceRouter(deviceController) {
  const router = express.Router();

  router.get("/devices", deviceController.listDevices);
  router.post("/devices", deviceController.createDevice);
  router.put("/devices/:id", deviceController.updateDevice);
  router.delete("/devices/:id", deviceController.deleteDevice);

  return router;
}

module.exports = { createDeviceRouter };
