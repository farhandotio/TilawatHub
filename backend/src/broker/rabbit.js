import amqp from "amqplib";
import config from "../config/config.js";

let channel, connection;

export async function connectRabbitMQ() {
  try {
    connection = await amqp.connect(config.RABBITMQ_URL);
    channel = await connection.createChannel();
    console.log("Connected to RabbitMQ");
  } catch (error) {
    console.error("Failed to connect to RabbitMQ", error);
  }
}

export async function publishToQueue(queueName, data) {
  await channel.assertQueue(queueName, { durable: true });
  await channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
  console.log(`Message sent to queue ${queueName}`);
}

export async function subscribeToQueue(queueName, callback) {
  try {
    await channel.assertQueue(queueName, { durable: true });
    await channel.consume(queueName, async (data) => {
      if (data) {
        const message = JSON.parse(data.content);
        await callback(message);
        channel.ack(data);
      }
    });
    console.log(`Subscribed to queue ${queueName}`);
  } catch (error) {
    console.error(`Error subscribing to queue ${queueName}:`, error);
  }
}
