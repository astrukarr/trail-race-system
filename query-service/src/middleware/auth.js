const jwt = require("jsonwebtoken");
const config = require("../config");
const logger = require("../utils/logger");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwt.secret);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
    };

    next();
  } catch (error) {
    logger.warn("Token verification failed", { error: error.message });
    return res.status(401).json({
      message: "Invalid token.",
    });
  }
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      logger.warn("Access denied - insufficient role", {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRole: role,
        endpoint: req.path,
      });
      return res.status(403).json({
        message: "Access denied. Insufficient role.",
      });
    }
    next();
  };
};

module.exports = {
  authMiddleware,
  requireRole,
};
