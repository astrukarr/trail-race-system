// Event handler for synchronizing data from Command Service events
const { query } = require("../database");
const logger = require("../utils/logger");

const handleEvent = async (event) => {
  try {
    logger.info("Processing event", {
      type: event.type,
      correlationId: event.correlationId,
    });

    switch (event.type) {
      case "RACE_CREATED":
        await handleRaceCreated(event.payload);
        break;
      case "RACE_UPDATED":
        await handleRaceUpdated(event.payload);
        break;
      case "RACE_DELETED":
        await handleRaceDeleted(event.payload);
        break;
      case "APPLICATION_CREATED":
        await handleApplicationCreated(event.payload);
        break;
      case "APPLICATION_DELETED":
        await handleApplicationDeleted(event.payload);
        break;
      default:
        logger.warn("Unknown event type", { type: event.type });
    }

    logger.info("Event processed successfully", {
      type: event.type,
      correlationId: event.correlationId,
    });
  } catch (error) {
    logger.error("Event processing failed", {
      type: event.type,
      correlationId: event.correlationId,
      error: error.message,
    });
    throw error;
  }
};

const handleRaceCreated = async (payload) => {
  await query(
    `INSERT INTO races (id, name, distance, created_at, updated_at) 
     VALUES ($1, $2, $3, $4, $5) 
     ON CONFLICT (id) DO NOTHING`,
    [
      payload.id,
      payload.name,
      payload.distance,
      payload.createdAt,
      payload.updatedAt,
    ]
  );
  logger.info("Race created in query service", { raceId: payload.id });
};

const handleRaceUpdated = async (payload) => {
  await query(
    `UPDATE races SET name = $1, distance = $2, updated_at = $3 
     WHERE id = $4`,
    [payload.name, payload.distance, payload.updatedAt, payload.id]
  );
  logger.info("Race updated in query service", { raceId: payload.id });
};

const handleRaceDeleted = async (payload) => {
  await query("DELETE FROM races WHERE id = $1", [payload.id]);
  logger.info("Race deleted in query service", { raceId: payload.id });
};

const handleApplicationCreated = async (payload) => {
  await query(
    `INSERT INTO applications (id, user_id, race_id, first_name, last_name, club, created_at, updated_at) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
     ON CONFLICT (id) DO NOTHING`,
    [
      payload.id,
      payload.userId,
      payload.raceId,
      payload.firstName,
      payload.lastName,
      payload.club,
      payload.createdAt,
      payload.updatedAt,
    ]
  );
  logger.info("Application created in query service", {
    applicationId: payload.id,
  });
};

const handleApplicationDeleted = async (payload) => {
  await query("DELETE FROM applications WHERE id = $1", [payload.id]);
  logger.info("Application deleted in query service", {
    applicationId: payload.id,
  });
};

module.exports = { handleEvent };
