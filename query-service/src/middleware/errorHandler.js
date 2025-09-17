const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  logger.error("Error occurred", {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Default error
  let status = 500;
  let message = "Internal server error";

  // Handle specific error types
  if (err.name === "ValidationError") {
    status = 400;
    message = "Validation error";
  } else if (err.name === "UnauthorizedError") {
    status = 401;
    message = "Unauthorized";
  } else if (err.name === "ForbiddenError") {
    status = 403;
    message = "Forbidden";
  } else if (err.name === "NotFoundError") {
    status = 404;
    message = "Not found";
  } else if (err.code === "23505") {
    // PostgreSQL unique violation
    status = 409;
    message = "Resource already exists";
  } else if (err.code === "23503") {
    // PostgreSQL foreign key violation
    status = 400;
    message = "Invalid reference";
  }

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
