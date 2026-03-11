const express = require("express");

function createHealthRouter(healthController) {
  const router = express.Router();

  router.get("/health", healthController.getHealth);

  return router;
}

module.exports = { createHealthRouter };
