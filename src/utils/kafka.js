import { Kafka, logLevel } from "kafkajs";
import { BROKERS, CLIENT_ID } from "../../config/kafka";
require("dotenv").config();

const kafkaConfig = {
  clientId: CLIENT_ID,
  brokers: BROKERS,
  logLevel: logLevel.ERROR,
};

const kafka = new Kafka(kafkaConfig);

export const produce = (topic, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const producer = kafka.producer();

      await producer.connect();
      await producer.send({
        topic,
        messages: [
          {
            value: typeof data != "string" ? JSON.stringify(data) : data,
          },
        ],
      });

      resolve();
    } catch (err) {
      reject({ message: err?.message || err });
    }
  });
};

export const consume = (topic) => {
  return new Promise(async (resolve, reject) => {
    try {
      const consumer = kafka.consumer({ groupId: process.env.GROUP_ID });

      await consumer.connect();
      await consumer.subscribe({
        topic,
        fromBeginning: process.env.FROM_BEGINNING || false,
      });

      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          const value = message.value.toString();
          // callback(topic, partition, value);
          console.log(
            `Received payload:\nTopic: ${topic},\nMessage: ${value}\n\n`
          );
        },
      });

      resolve();
    } catch (err) {
      reject({ message: err?.message || err });
    }
  });
};
