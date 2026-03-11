const express = require("express");

function createSharedRouter(sharedController) {
  const router = express.Router();

  router.get("/shared/countFacets", sharedController.countFacets);

  return router;
}

module.exports = { createSharedRouter };
