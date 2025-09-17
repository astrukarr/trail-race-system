const amqp = require("amqplib");
const config = require("../config");
const logger = require("../utils/logger");

let connection;
let channel;

const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect(config.rabbitmq.url);
    channel = await connection.createChannel();

    // Setup exchanges and queues
    await setupExchangesAndQueues();

    logger.info("RabbitMQ connected successfully");
  } catch (error) {
    logger.error("RabbitMQ connection failed", { error: error.message });
    throw error;
  }
};

const setupExchangesAndQueues = async () => {
  try {
    // Command exchange (where Command Service publishes events)
    await channel.assertExchange("command-exchange", "topic", {
      durable: true,
    });

    // Query service queue for consuming events
    await channel.assertQueue("query-service-queue", {
      durable: true,
    });

    // Bind queue to exchange for all command events
    await channel.bindQueue(
      "query-service-queue",
      "command-exchange",
      "command.*"
    );

    logger.info("RabbitMQ exchanges and queues setup completed");
  } catch (error) {
    logger.error("RabbitMQ setup failed", { error: error.message });
    throw error;
  }
};

const consumeEvents = async (eventHandler) => {
  try {
    await channel.consume(
      "query-service-queue",
      async (msg) => {
        if (msg) {
          try {
            const event = JSON.parse(msg.content.toString());
            logger.info("Event received", {
              type: event.type,
              correlationId: event.correlationId,
            });

            // Process the event
            await eventHandler(event);

            // Acknowledge the message
            channel.ack(msg);
          } catch (error) {
            logger.error("Event processing failed", {
              error: error.message,
              message: msg.content.toString(),
            });
            // Reject the message and don't requeue
            channel.nack(msg, false, false);
          }
        }
      },
      { noAck: false }
    );

    logger.info("Event consumption started");
  } catch (error) {
    logger.error("Event consumption setup failed", { error: error.message });
    throw error;
  }
};

const closeRabbitMQ = async () => {
  if (channel) {
    await channel.close();
  }
  if (connection) {
    await connection.close();
  }
  logger.info("RabbitMQ connection closed");
};

module.exports = {
  connectRabbitMQ,
  consumeEvents,
  closeRabbitMQ,
};
