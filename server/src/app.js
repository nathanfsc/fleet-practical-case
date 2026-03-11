const cors = require("cors");
const express = require("express");

const { createApiRouter } = require("./topics");

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use("/api", createApiRouter());

  return app;
}

module.exports = { createApp };
