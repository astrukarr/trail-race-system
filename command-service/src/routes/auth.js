// Authentication routes
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");

const config = require("../config");
const { query } = require("../database");
const logger = require("../utils/logger");

const router = express.Router();

// Validation schemas
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().max(255).required(),
  lastName: Joi.string().max(255).required(),
  role: Joi.string().valid("Applicant", "Administrator").default("Applicant"),
});

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation error",
        details: error.details[0].message,
      });
    }

    const { email, password } = value;

    // Find user in database
    const result = await query(
      "SELECT id, email, password, role, first_name, last_name FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid credentials",
        message: "Email or password is incorrect",
      });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: "Invalid credentials",
        message: "Email or password is incorrect",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      config.jwt.secret,
      {
        expiresIn: config.jwt.expiresIn,
        issuer: config.jwt.issuer,
      }
    );

    logger.info("User logged in successfully", {
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/register
router.post("/register", async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation error",
        details: error.details[0].message,
      });
    }

    const { email, password, firstName, lastName, role } = value;

    // Check if user already exists
    const existingUser = await query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: "User already exists",
        message: "A user with this email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const userId = uuidv4();
    await query(
      "INSERT INTO users (id, email, password, first_name, last_name, role, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())",
      [userId, email, hashedPassword, firstName, lastName, role]
    );

    logger.info("User registered successfully", {
      userId,
      email,
      role,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: userId,
        email,
        role,
        firstName,
        lastName,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me
router.get("/me", async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Authorization header missing",
        message: "Please provide a valid Bearer token",
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, config.jwt.secret);

    res.json({
      user: {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
      },
    });
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        error: "Invalid token",
        message: "The provided token is invalid or expired",
      });
    }
    next(error);
  }
});

module.exports = router;
