import http from "http";
import app from "./app.js";
import { config } from "@config/env.js";
import { connectDatabase } from "@config/database.js";
import logger from "@utils/logger.util.js";

const server = http.createServer(app);

const start = async (): Promise<void> => {
  await connectDatabase();

  server.listen(config.port, () => {
    logger.info(
      `Server running on port ${config.port} in ${config.nodeEnv} mode`
    );
  });
};

server.on("error", (err) => {
  logger.error("Server error:", err);
  process.exit(1);
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully...");
  server.close(() => process.exit(0));
});

start().catch((err) => {
  logger.error("Failed to start server:", err);
  process.exit(1);
});