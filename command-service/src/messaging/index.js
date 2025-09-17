// RabbitMQ messaging connection
const amqp = require("amqplib");
const config = require("../config");
const logger = require("../utils/logger");

let connection = null;
let channel = null;

// Connect to RabbitMQ
async function connectRabbitMQ() {
  try {
    connection = await amqp.connect(config.rabbitmq.url);
    channel = await connection.createChannel();

    // Handle connection errors
    connection.on("error", (err) => {
      logger.error("RabbitMQ connection error:", err);
    });

    connection.on("close", () => {
      logger.warn("RabbitMQ connection closed");
    });

    // Handle channel errors
    channel.on("error", (err) => {
      logger.error("RabbitMQ channel error:", err);
    });

    // Assert exchanges and queues
    await setupExchangesAndQueues();

    logger.info("RabbitMQ connected successfully");
    return { connection, channel };
  } catch (error) {
    logger.error("RabbitMQ connection failed:", error);
    throw error;
  }
}

// Setup exchanges and queues
async function setupExchangesAndQueues() {
  if (!channel) {
    throw new Error("RabbitMQ channel not available");
  }

  try {
    // Assert command exchange (for sending commands)
    await channel.assertExchange("race_application_commands", "topic", {
      durable: true,
    });

    // Assert response exchange (for receiving responses)
    await channel.assertExchange("race_application_responses", "topic", {
      durable: true,
    });

    // Assert command queue (for this service to send commands)
    await channel.assertQueue("command_service_out", {
      durable: true,
    });

    // Assert response queue (for this service to receive responses)
    await channel.assertQueue("command_service_in", {
      durable: true,
    });

    // Bind queues to exchanges
    await channel.bindQueue(
      "command_service_out",
      "race_application_commands",
      "command.*"
    );
    await channel.bindQueue(
      "command_service_in",
      "race_application_responses",
      "response.command_service"
    );

    logger.info("RabbitMQ exchanges and queues setup completed");
  } catch (error) {
    logger.error("Failed to setup RabbitMQ exchanges and queues:", error);
    throw error;
  }
}

// Publish command message
async function publishCommand(commandType, payload, correlationId = null) {
  if (!channel) {
    throw new Error("RabbitMQ channel not available");
  }

  try {
    const message = {
      type: commandType,
      payload: payload,
      timestamp: new Date().toISOString(),
      correlationId: correlationId || require("uuid").v4(),
    };

    const routingKey = `command.${commandType}`;

    await channel.publish(
      "race_application_commands",
      routingKey,
      Buffer.from(JSON.stringify(message)),
      {
        persistent: true,
        correlationId: message.correlationId,
        replyTo: "command_service_in",
      }
    );

    logger.info("Command published", {
      type: commandType,
      correlationId: message.correlationId,
      routingKey,
    });

    return message.correlationId;
  } catch (error) {
    logger.error("Failed to publish command:", error);
    throw error;
  }
}

// Consume response messages
async function consumeResponses(callback) {
  if (!channel) {
    throw new Error("RabbitMQ channel not available");
  }

  try {
    await channel.consume("command_service_in", (msg) => {
      if (msg) {
        try {
          const response = JSON.parse(msg.content.toString());
          logger.info("Response received", {
            correlationId: response.correlationId,
            status: response.status,
          });

          callback(response);
          channel.ack(msg);
        } catch (error) {
          logger.error("Failed to process response message:", error);
          channel.nack(msg, false, false);
        }
      }
    });

    logger.info("Started consuming response messages");
  } catch (error) {
    logger.error("Failed to start consuming responses:", error);
    throw error;
  }
}

// Close RabbitMQ connection
async function closeRabbitMQ() {
  try {
    if (channel) {
      await channel.close();
      channel = null;
    }
    if (connection) {
      await connection.close();
      connection = null;
    }
    logger.info("RabbitMQ connection closed");
  } catch (error) {
    logger.error("Error closing RabbitMQ connection:", error);
  }
}

module.exports = {
  connectRabbitMQ,
  publishCommand,
  consumeResponses,
  closeRabbitMQ,
};
