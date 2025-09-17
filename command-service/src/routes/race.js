// Race routes for Command Service
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");

const { query } = require("../database");
const { publishCommand } = require("../messaging");
const { requireRole } = require("../middleware/auth");
const logger = require("../utils/logger");

const router = express.Router();

// Validation schemas
const createRaceSchema = Joi.object({
  name: Joi.string().max(255).required(),
  distance: Joi.string()
    .valid("5k", "10k", "HalfMarathon", "Marathon")
    .required(),
});

const updateRaceSchema = Joi.object({
  name: Joi.string().max(255),
  distance: Joi.string().valid("5k", "10k", "HalfMarathon", "Marathon"),
}).min(1); // At least one field must be provided

// POST /api/races - Create race (Admin only)
router.post("/", requireRole("Administrator"), async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = createRaceSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation error",
        details: error.details[0].message,
      });
    }

    const { name, distance } = value;

    // Check if race with same name already exists
    const existingRace = await query("SELECT id FROM races WHERE name = $1", [
      name,
    ]);

    if (existingRace.rows.length > 0) {
      return res.status(409).json({
        error: "Race already exists",
        message: "A race with this name already exists",
      });
    }

    // Create race
    const raceId = uuidv4();
    const result = await query(
      "INSERT INTO races (id, name, distance, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *",
      [raceId, name, distance]
    );

    const race = result.rows[0];

    // Publish event to RabbitMQ
    try {
      await publishCommand("RACE_CREATED", {
        id: race.id,
        name: race.name,
        distance: race.distance,
        createdAt: race.created_at,
        updatedAt: race.updated_at,
      });
    } catch (eventError) {
      logger.warn("Failed to publish RACE_CREATED event:", eventError);
      // Don't fail the request if event publishing fails
    }

    logger.info("Race created successfully", {
      raceId: race.id,
      name: race.name,
      distance: race.distance,
      userId: req.user.id,
    });

    res.status(201).json({
      message: "Race created successfully",
      race: {
        id: race.id,
        name: race.name,
        distance: race.distance,
        createdAt: race.created_at,
        updatedAt: race.updated_at,
      },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/races/:id - Update race (Admin only)
router.put("/:id", requireRole("Administrator"), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate input
    const { error, value } = updateRaceSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: "Validation error",
        details: error.details[0].message,
      });
    }

    // Check if race exists
    const existingRace = await query("SELECT * FROM races WHERE id = $1", [id]);

    if (existingRace.rows.length === 0) {
      return res.status(404).json({
        error: "Race not found",
        message: "The specified race does not exist",
      });
    }

    const { name, distance } = value;

    // Check if new name conflicts with existing race (if name is being updated)
    if (name && name !== existingRace.rows[0].name) {
      const nameConflict = await query(
        "SELECT id FROM races WHERE name = $1 AND id != $2",
        [name, id]
      );

      if (nameConflict.rows.length > 0) {
        return res.status(409).json({
          error: "Race name conflict",
          message: "A race with this name already exists",
        });
      }
    }

    // Update race
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (name) {
      updateFields.push(`name = $${paramCount}`);
      updateValues.push(name);
      paramCount++;
    }

    if (distance) {
      updateFields.push(`distance = $${paramCount}`);
      updateValues.push(distance);
      paramCount++;
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(id);

    const result = await query(
      `UPDATE races SET ${updateFields.join(
        ", "
      )} WHERE id = $${paramCount} RETURNING *`,
      updateValues
    );

    const race = result.rows[0];

    // Publish event to RabbitMQ
    try {
      await publishCommand("RACE_UPDATED", {
        id: race.id,
        name: race.name,
        distance: race.distance,
        createdAt: race.created_at,
        updatedAt: race.updated_at,
      });
    } catch (eventError) {
      logger.warn("Failed to publish RACE_UPDATED event:", eventError);
    }

    logger.info("Race updated successfully", {
      raceId: race.id,
      name: race.name,
      distance: race.distance,
      userId: req.user.id,
    });

    res.json({
      message: "Race updated successfully",
      race: {
        id: race.id,
        name: race.name,
        distance: race.distance,
        createdAt: race.created_at,
        updatedAt: race.updated_at,
      },
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/races/:id - Delete race (Admin only)
router.delete("/:id", requireRole("Administrator"), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if race exists
    const existingRace = await query("SELECT * FROM races WHERE id = $1", [id]);

    if (existingRace.rows.length === 0) {
      return res.status(404).json({
        error: "Race not found",
        message: "The specified race does not exist",
      });
    }

    const race = existingRace.rows[0];

    // Check if race has applications
    const applicationsCount = await query(
      "SELECT COUNT(*) FROM applications WHERE race_id = $1",
      [id]
    );

    if (parseInt(applicationsCount.rows[0].count) > 0) {
      return res.status(409).json({
        error: "Cannot delete race",
        message: "This race has applications and cannot be deleted",
      });
    }

    // Delete race
    await query("DELETE FROM races WHERE id = $1", [id]);

    // Publish event to RabbitMQ
    try {
      await publishCommand("RACE_DELETED", {
        id: race.id,
        name: race.name,
        distance: race.distance,
      });
    } catch (eventError) {
      logger.warn("Failed to publish RACE_DELETED event:", eventError);
    }

    logger.info("Race deleted successfully", {
      raceId: race.id,
      name: race.name,
      distance: race.distance,
      userId: req.user.id,
    });

    res.json({
      message: "Race deleted successfully",
      race: {
        id: race.id,
        name: race.name,
        distance: race.distance,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
