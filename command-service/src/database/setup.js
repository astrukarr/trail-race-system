// Database setup script for Command Service
const { query } = require("./index");
const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");

async function setupDatabase() {
  try {
    logger.info("Starting database setup...");

    // Read schema file
    const schemaPath = path.join(__dirname, "../database/schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    // Execute schema
    await query(schema);

    logger.info("Database schema created successfully");

    // Verify tables exist
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);

    logger.info(
      "Created tables:",
      tablesResult.rows.map((row) => row.table_name)
    );

    // Verify sample data
    const usersCount = await query("SELECT COUNT(*) FROM users");
    const racesCount = await query("SELECT COUNT(*) FROM races");
    const applicationsCount = await query("SELECT COUNT(*) FROM applications");

    logger.info("Sample data inserted:", {
      users: usersCount.rows[0].count,
      races: racesCount.rows[0].count,
      applications: applicationsCount.rows[0].count,
    });

    logger.info("Database setup completed successfully!");
  } catch (error) {
    logger.error("Database setup failed:", error);
    throw error;
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      logger.info("Setup completed");
      process.exit(0);
    })
    .catch((error) => {
      logger.error("Setup failed:", error);
      process.exit(1);
    });
}

module.exports = { setupDatabase };
