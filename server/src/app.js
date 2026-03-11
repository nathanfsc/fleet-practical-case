const cors = require("cors");
const express = require("express");

const { createApiRouter } = require("./topics");

function createApp({ databaseClient } = {}) {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use("/api", createApiRouter({ databaseClient }));

  return app;
}

module.exports = { createApp };
