const { createApp } = require("./src/app");
const { initializeDatabase } = require("./src/database");

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await initializeDatabase();

    const app = createApp();

    app.listen(PORT, () => {
      console.log(`API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to initialize server", error);
    process.exit(1);
  }
}

startServer();
