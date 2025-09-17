// Application routes
const express = require("express");
const Joi = require("joi");
const { v4: uuidv4 } = require("uuid");
const { query } = require("../database");
const { publishCommand } = require("../messaging");
const { requireRole } = require("../middleware/auth");
const logger = require("../utils/logger");

const router = express.Router();

// Validation schemas
const createApplicationSchema = Joi.object({
  firstName: Joi.string().max(255).required(),
  lastName: Joi.string().max(255).required(),
  club: Joi.string().max(255).optional().allow(""),
  raceId: Joi.string().uuid().required(),
});

// POST /api/applications - Create application
router.post("/", requireRole("Applicant"), async (req, res, next) => {
  try {
    const { firstName, lastName, club, raceId } = req.body;
    const userId = req.user.id;

    // Validate input
    const { error } = createApplicationSchema.validate({
      firstName,
      lastName,
      club,
      raceId,
    });

    if (error) {
      return res.status(400).json({
        message: "Validation error",
        details: error.details[0].message,
      });
    }

    // Check if race exists
    const raceResult = await query("SELECT * FROM races WHERE id = $1", [
      raceId,
    ]);
    if (raceResult.rows.length === 0) {
      return res.status(404).json({
        message: "Race not found",
      });
    }

    // Check if user already applied for this race
    const existingApplication = await query(
      "SELECT id FROM applications WHERE user_id = $1 AND race_id = $2",
      [userId, raceId]
    );

    if (existingApplication.rows.length > 0) {
      return res.status(409).json({
        message: "You have already applied for this race",
      });
    }

    // Create application
    const applicationId = uuidv4();
    const result = await query(
      `INSERT INTO applications (id, user_id, race_id, first_name, last_name, club, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *`,
      [applicationId, userId, raceId, firstName, lastName, club || null]
    );

    const application = result.rows[0];

    // Publish event
    const eventPayload = {
      id: application.id,
      userId: application.user_id,
      raceId: application.race_id,
      firstName: application.first_name,
      lastName: application.last_name,
      club: application.club,
      createdAt: application.created_at,
      updatedAt: application.updated_at,
    };

    await publishCommand("APPLICATION_CREATED", eventPayload);

    logger.info("Application created successfully", {
      applicationId: application.id,
      userId: application.user_id,
      raceId: application.race_id,
      firstName: application.first_name,
      lastName: application.last_name,
    });

    res.status(201).json({
      message: "Application created successfully",
      application: {
        id: application.id,
        firstName: application.first_name,
        lastName: application.last_name,
        club: application.club,
        raceId: application.race_id,
        createdAt: application.created_at,
        updatedAt: application.updated_at,
      },
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/applications/:id - Delete application
router.delete("/:id", requireRole("Applicant"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validate UUID format
    if (!Joi.string().uuid().validate(id).error === false) {
      return res.status(400).json({
        message: "Invalid application ID format",
      });
    }

    // Check if application exists and belongs to user
    const existingApplication = await query(
      "SELECT * FROM applications WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (existingApplication.rows.length === 0) {
      return res.status(404).json({
        message:
          "Application not found or you don't have permission to delete it",
      });
    }

    const application = existingApplication.rows[0];

    // Delete application
    await query("DELETE FROM applications WHERE id = $1", [id]);

    // Publish event
    const eventPayload = {
      id: application.id,
      userId: application.user_id,
      raceId: application.race_id,
      firstName: application.first_name,
      lastName: application.last_name,
      club: application.club,
    };

    await publishCommand("APPLICATION_DELETED", eventPayload);

    logger.info("Application deleted successfully", {
      applicationId: application.id,
      userId: application.user_id,
      raceId: application.race_id,
      firstName: application.first_name,
      lastName: application.last_name,
    });

    res.json({
      message: "Application deleted successfully",
      application: {
        id: application.id,
        firstName: application.first_name,
        lastName: application.last_name,
        club: application.club,
        raceId: application.race_id,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
