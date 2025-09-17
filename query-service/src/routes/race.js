// Race routes - Read-only endpoints
const express = require("express");
const { query } = require("../database");
const { authMiddleware, requireRole } = require("../middleware/auth");
const logger = require("../utils/logger");

const router = express.Router();

// GET /api/races - Get all races
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const result = await query(
      "SELECT id, name, distance, created_at, updated_at FROM races ORDER BY created_at DESC"
    );

    logger.info("Races retrieved", {
      count: result.rows.length,
      userId: req.user.id,
    });

    res.json({
      message: "Races retrieved successfully",
      races: result.rows.map((race) => ({
        id: race.id,
        name: race.name,
        distance: race.distance,
        createdAt: race.created_at,
        updatedAt: race.updated_at,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/races/:id - Get race by ID
router.get("/:id", authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      "SELECT id, name, distance, created_at, updated_at FROM races WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Race not found",
      });
    }

    const race = result.rows[0];

    logger.info("Race retrieved", {
      raceId: race.id,
      userId: req.user.id,
    });

    res.json({
      message: "Race retrieved successfully",
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

module.exports = router;
