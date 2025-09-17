// Main entry point for Command Service
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const logger = require("./utils/logger");
const config = require("./config");
const { connectDatabase } = require("./database");
const { connectRabbitMQ } = require("./messaging");

// Import routes
const raceRoutes = require("./routes/race");
const applicationRoutes = require("./routes/application");
const authRoutes = require("./routes/auth");

// Import middleware
const errorHandler = require("./middleware/errorHandler");
const { authMiddleware } = require("./middleware/auth");

const app = express();
const PORT = config.port || 3001;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin || "http://localhost:3000",
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "command-service",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/races", authMiddleware, raceRoutes);
app.use("/api/applications", authMiddleware, applicationRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down gracefully");
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    logger.info("Database connected successfully");

    // Connect to RabbitMQ
    await connectRabbitMQ();
    logger.info("RabbitMQ connected successfully");

    // Start HTTP server
    app.listen(PORT, () => {
      logger.info(`Command Service running on port ${PORT}`);
      logger.info(`Health check available at http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

startServer();
