require("dotenv").config();

const config = {
  server: {
    port: process.env.PORT || 3002,
    env: process.env.NODE_ENV || "development",
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL,
  },
  jwt: {
    secret:
      process.env.JWT_SECRET ||
      "your-super-secret-jwt-key-change-in-production",
  },
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  },
  logging: {
    level: process.env.LOG_LEVEL || "info",
  },
};

// Validate required environment variables
const requiredEnvVars = ["DATABASE_URL", "RABBITMQ_URL", "JWT_SECRET"];

if (config.server.env === "production") {
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
