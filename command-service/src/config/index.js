// Configuration management for Command Service
require("dotenv").config();

const config = {
  // Server configuration
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || "development",

  // Database configuration
  database: {
    url:
      process.env.DATABASE_URL ||
      "postgresql://trail_race_user:trail_race_password@localhost:5432/trail_race_db",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || "trail_race_db",
    user: process.env.DB_USER || "trail_race_user",
    password: process.env.DB_PASSWORD || "trail_race_password",
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  },

  // RabbitMQ configuration
  rabbitmq: {
    url:
      process.env.RABBITMQ_URL ||
      "amqp://trail_race_user:trail_race_password@localhost:5672",
    host: process.env.RABBITMQ_HOST || "localhost",
    port: process.env.RABBITMQ_PORT || 5672,
    user: process.env.RABBITMQ_USER || "trail_race_user",
    password: process.env.RABBITMQ_PASSWORD || "trail_race_password",
    // Topics for CQRS communication
    topics: {
      commands: "race_application_commands",
      responses: "race_application_responses",
    },
  },

  // JWT configuration
  jwt: {
    secret:
      process.env.JWT_SECRET ||
      "your-super-secret-jwt-key-change-in-production",
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    issuer: process.env.JWT_ISSUER || "trail-race-system",
  },

  // CORS configuration
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || "info",
    format: process.env.LOG_FORMAT || "combined",
  },

  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
  },
};

// Validation
const requiredEnvVars = ["DATABASE_URL", "RABBITMQ_URL", "JWT_SECRET"];

// Check required environment variables in production
if (config.nodeEnv === "production") {
  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }
}

module.exports = config;
