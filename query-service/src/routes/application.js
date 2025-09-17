// Application routes - Read-only endpoints
const express = require("express");
const { query } = require("../database");
const { authMiddleware, requireRole } = require("../middleware/auth");
const logger = require("../utils/logger");

const router = express.Router();

// GET /api/applications - Get all applications (with user context)
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    let result;
    let whereClause = "";
    let params = [];

    if (req.user.role === "Applicant") {
      // Applicants can only see their own applications
      whereClause = "WHERE a.user_id = $1";
      params = [req.user.id];
    }
    // Administrators can see all applications (no where clause)

    const queryText = `
      SELECT 
        a.id, 
        a.first_name, 
        a.last_name, 
        a.club, 
        a.created_at, 
        a.updated_at,
        r.name as race_name,
        r.distance as race_distance,
        u.email as user_email
      FROM applications a
      JOIN races r ON a.race_id = r.id
      JOIN users u ON a.user_id = u.id
      ${whereClause}
      ORDER BY a.created_at DESC
    `;

    result = await query(queryText, params);

    logger.info("Applications retrieved", {
      count: result.rows.length,
      userId: req.user.id,
      userRole: req.user.role,
    });

    res.json({
      message: "Applications retrieved successfully",
      applications: result.rows.map((app) => ({
        id: app.id,
        firstName: app.first_name,
        lastName: app.last_name,
        club: app.club,
        raceName: app.race_name,
        raceDistance: app.race_distance,
        userEmail: app.user_email,
        createdAt: app.created_at,
        updatedAt: app.updated_at,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/applications/:id - Get application by ID
router.get("/:id", authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    let queryText = `
      SELECT 
        a.id, 
        a.first_name, 
        a.last_name, 
        a.club, 
        a.created_at, 
        a.updated_at,
        r.name as race_name,
        r.distance as race_distance,
        u.email as user_email
      FROM applications a
      JOIN races r ON a.race_id = r.id
      JOIN users u ON a.user_id = u.id
      WHERE a.id = $1
    `;
    let params = [id];

    if (req.user.role === "Applicant") {
      // Applicants can only see their own applications
      queryText += " AND a.user_id = $2";
      params.push(req.user.id);
    }

    const result = await query(queryText, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message:
          "Application not found or you don't have permission to view it",
      });
    }

    const app = result.rows[0];

    logger.info("Application retrieved", {
      applicationId: app.id,
      userId: req.user.id,
      userRole: req.user.role,
    });

    res.json({
      message: "Application retrieved successfully",
      application: {
        id: app.id,
        firstName: app.first_name,
        lastName: app.last_name,
        club: app.club,
        raceName: app.race_name,
        raceDistance: app.race_distance,
        userEmail: app.user_email,
        createdAt: app.created_at,
        updatedAt: app.updated_at,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
