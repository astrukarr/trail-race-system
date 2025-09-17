const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const config = require("./config");
const logger = require("./utils/logger");
const { connectDatabase, closeDatabase } = require("./database");
const {
  connectRabbitMQ,
  consumeEvents,
  closeRabbitMQ,
} = require("./messaging");
const { handleEvent } = require("./messaging/eventHandler");
const raceRoutes = require("./routes/race");
const applicationRoutes = require("./routes/application");
const errorHandler = require("./middleware/errorHandler");
const { authMiddleware } = require("./middleware/auth");

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: config.cors.origin }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    service: "query-service",
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "query-service",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/races", authMiddleware, raceRoutes);
app.use("/api/applications", authMiddleware, applicationRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully");
  await closeRabbitMQ();
  await closeDatabase();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down gracefully");
  await closeRabbitMQ();
  await closeDatabase();
  process.exit(0);
});

const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Connect to RabbitMQ and start consuming events
    await connectRabbitMQ();
    await consumeEvents(handleEvent);

    // Start HTTP server
    const server = app.listen(config.server.port, () => {
      logger.info(`Query Service running on port ${config.server.port}`);
      logger.info(
        `Health check available at http://localhost:${config.server.port}/health`
      );
    });

    // Handle server errors
    server.on("error", (error) => {
      logger.error("Server error", { error: error.message });
      process.exit(1);
    });
  } catch (error) {
    logger.error("Failed to start server", { error: error.message });
    process.exit(1);
  }
};

// Start the server
startServer();
