// Error handling middleware
const logger = require("../utils/logger");

function errorHandler(err, req, res, next) {
  logger.error("Error occurred:", {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Default error response
  let statusCode = 500;
  let message = "Internal Server Error";

  // Handle specific error types
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error";
  } else if (err.name === "UnauthorizedError") {
    statusCode = 401;
    message = "Unauthorized";
  } else if (err.name === "ForbiddenError") {
    statusCode = 403;
    message = "Forbidden";
  } else if (err.name === "NotFoundError") {
    statusCode = 404;
    message = "Not Found";
  } else if (err.code === "23505") {
    // PostgreSQL unique violation
    statusCode = 409;
    message = "Resource already exists";
  } else if (err.code === "23503") {
    // PostgreSQL foreign key violation
    statusCode = 400;
    message = "Invalid reference";
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === "production" && statusCode === 500) {
    message = "Internal Server Error";
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { details: err.message }),
    timestamp: new Date().toISOString(),
  });
}

module.exports = errorHandler;
