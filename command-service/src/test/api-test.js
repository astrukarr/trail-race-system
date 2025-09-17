// API Testing Script for Command Service
const axios = require("axios");
const logger = require("../utils/logger");

const BASE_URL = "http://localhost:3001";

// Test data
const testUser = {
  email: "test@example.com",
  password: "password123",
  firstName: "Test",
  lastName: "User",
  role: "Applicant",
};

const testRace = {
  name: "Test Trail Race",
  distance: "10k",
};

const testApplication = {
  firstName: "John",
  lastName: "Doe",
  club: "Test Running Club",
  raceId: "550e8400-e29b-41d4-a716-446655440010", // Sample race ID
};

let authToken = "";

async function testAPI() {
  try {
    logger.info("Starting API tests...");

    // Test 1: Health Check
    await testHealthCheck();

    // Test 2: User Registration
    await testUserRegistration();

    // Test 3: User Login
    await testUserLogin();

    // Test 4: Get Current User
    await testGetCurrentUser();

    // Test 5: Create Race (Admin only)
    await testCreateRace();

    // Test 6: Create Application
    await testCreateApplication();

    logger.info("All API tests completed successfully!");
  } catch (error) {
    logger.error("API test failed:", error.message);
    throw error;
  }
}

async function testHealthCheck() {
  logger.info("Testing health check...");

  const response = await axios.get(`${BASE_URL}/health`);

  if (response.status === 200) {
    logger.info("✅ Health check passed:", response.data);
  } else {
    throw new Error("Health check failed");
  }
}

async function testUserRegistration() {
  logger.info("Testing user registration...");

  try {
    const response = await axios.post(
      `${BASE_URL}/api/auth/register`,
      testUser
    );

    if (response.status === 201) {
      logger.info("✅ User registration passed:", response.data);
    } else {
      throw new Error("User registration failed");
    }
  } catch (error) {
    if (error.response?.status === 409) {
      logger.info("✅ User already exists (expected)");
    } else {
      throw error;
    }
  }
}

async function testUserLogin() {
  logger.info("Testing user login...");

  const response = await axios.post(`${BASE_URL}/api/auth/login`, {
    email: testUser.email,
    password: testUser.password,
  });

  if (response.status === 200) {
    authToken = response.data.token;
    logger.info("✅ User login passed, token received");
  } else {
    throw new Error("User login failed");
  }
}

async function testGetCurrentUser() {
  logger.info("Testing get current user...");

  const response = await axios.get(`${BASE_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (response.status === 200) {
    logger.info("✅ Get current user passed:", response.data);
  } else {
    throw new Error("Get current user failed");
  }
}

async function testCreateRace() {
  logger.info("Testing create race...");

  try {
    const response = await axios.post(`${BASE_URL}/api/races`, testRace, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 201) {
      logger.info("✅ Create race passed:", response.data);
    } else {
      throw new Error("Create race failed");
    }
  } catch (error) {
    if (error.response?.status === 403) {
      logger.info(
        "✅ Create race failed (insufficient role - expected for Applicant)"
      );
    } else {
      throw error;
    }
  }
}

async function testCreateApplication() {
  logger.info("Testing create application...");

  const response = await axios.post(
    `${BASE_URL}/api/applications`,
    testApplication,
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (response.status === 201) {
    logger.info("✅ Create application passed:", response.data);
  } else {
    throw new Error("Create application failed");
  }
}

// Run tests if called directly
if (require.main === module) {
  testAPI()
    .then(() => {
      logger.info("All tests completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      logger.error("Tests failed:", error);
      process.exit(1);
    });
}

module.exports = { testAPI };
