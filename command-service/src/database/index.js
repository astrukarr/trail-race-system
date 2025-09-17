// PostgreSQL database connection
const { Pool } = require("pg");
const config = require("../config");
const logger = require("../utils/logger");

let pool = null;

// Create database connection pool
function createPool() {
  if (pool) {
    return pool;
  }

  pool = new Pool({
    connectionString: config.database.url,
    ssl: config.database.ssl,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  });

  // Handle pool errors
  pool.on("error", (err) => {
    logger.error("Unexpected error on idle client", err);
  });

  return pool;
}

// Connect to database
async function connectDatabase() {
  try {
    const pool = createPool();

    // Test connection
    const client = await pool.connect();
    await client.query("SELECT NOW()");
    client.release();

    logger.info("Database connected successfully");
    return pool;
  } catch (error) {
    logger.error("Database connection failed:", error);
    throw error;
  }
}

// Get database pool
function getPool() {
  if (!pool) {
    return createPool();
  }
  return pool;
}

// Execute query with error handling
async function query(text, params) {
  const pool = getPool();
  const start = Date.now();

  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    logger.debug("Executed query", {
      text: text.substring(0, 100) + (text.length > 100 ? "..." : ""),
      duration: `${duration}ms`,
      rows: result.rowCount,
    });

    return result;
  } catch (error) {
    logger.error("Database query error:", {
      text: text.substring(0, 100) + (text.length > 100 ? "..." : ""),
      error: error.message,
    });
    throw error;
  }
}

// Close database connection
async function closeDatabase() {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info("Database connection closed");
  }
}

module.exports = {
  connectDatabase,
  getPool,
  query,
  closeDatabase,
};
