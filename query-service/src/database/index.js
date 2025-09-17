const { Pool } = require("pg");
const config = require("../config");
const logger = require("../utils/logger");

let pool;

const connectDatabase = async () => {
  try {
    pool = new Pool({
      connectionString: config.database.url,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Test the connection
    const client = await pool.connect();
    await client.query("SELECT NOW()");
    client.release();

    logger.info("Database connected successfully");
  } catch (error) {
    logger.error("Database connection failed", { error: error.message });
    throw error;
  }
};

const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug("Query executed", { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    logger.error("Database query failed", { text, error: error.message });
    throw error;
  }
};

const closeDatabase = async () => {
  if (pool) {
    await pool.end();
    logger.info("Database connection closed");
  }
};

module.exports = {
  connectDatabase,
  query,
  closeDatabase,
};
