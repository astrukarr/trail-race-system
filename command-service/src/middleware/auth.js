// JWT Authentication middleware
const jwt = require("jsonwebtoken");
const config = require("../config");
const logger = require("../utils/logger");

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Authorization header missing or invalid",
        message: "Please provide a valid Bearer token",
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        error: "Token missing",
        message: "Please provide a valid token",
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Add user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
    };

    logger.debug("User authenticated", {
      userId: req.user.id,
      role: req.user.role,
      endpoint: req.path,
    });

    next();
  } catch (error) {
    logger.warn("Authentication failed", {
      error: error.message,
      ip: req.ip,
      endpoint: req.path,
    });

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Invalid token",
        message: "The provided token is invalid",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token expired",
        message: "The provided token has expired",
      });
    }

    return res.status(401).json({
      error: "Authentication failed",
      message: "Unable to authenticate user",
    });
  }
}

// Role-based authorization middleware
function requireRole(requiredRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required",
        message: "Please authenticate first",
      });
    }

    if (req.user.role !== requiredRole) {
      logger.warn("Access denied - insufficient role", {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRole: requiredRole,
        endpoint: req.path,
      });

      return res.status(403).json({
        error: "Access denied",
        message: `This action requires ${requiredRole} role`,
      });
    }

    next();
  };
}

module.exports = {
  authMiddleware,
  requireRole,
};
