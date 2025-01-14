import { Kafka, logLevel } from "kafkajs";
import { BROKERS, CLIENT_ID } from "../../config/kafka";
import { SendEmail } from "./nodemailer";
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

          const payload = JsonParser(value);
          console.log(
            `Received payload:\nTopic: ${topic},\nMessage: ${JSON.stringify(payload, null, 4)}\n\n`
          );

          if (process.env.NODE_ENV.toLowerCase() == "local") return;

          const htmlBody = `<h3>Informatica Error</h3>
            <table style="padding:5px; border:1px solid; border-radius:5px">
                <tr>
                    <th style="text-align:left">Step</th>
                    <td>${payload?.step}</td>
                </tr>
                <tr>
                    <th style="text-align:left">Code</th>
                    <td>${payload?.data?.code}</td>
                </tr>
                <tr>
                    <th style="text-align:left">Message</th>
                    <td>${JSON.stringify(payload?.data?.message, null, 4)}</td>
                </tr>
                <tr>
                    <th style="text-align:left">Details</th>
                    <td>${payload?.data?.details}</td>
                </tr>
                <tr>
                    <th style="text-align:left">c2cType</th>
                    <td>${payload?.data?.c2cType}</td>
                </tr>
                <tr>
                    <th style="text-align:left">c2cExecution</th>
                    <td>${payload?.data?.c2cExecution}</td>
                </tr>
                <tr>
                    <th style="text-align:left">InputParam</th>
                    <td>${JSON.stringify(payload?.data?.inputParam, null, 4)}</td>
                </tr>
            </table>
          `;

          SendEmail(htmlBody);
        },
      });

      resolve();
    } catch (err) {
      reject({ message: err?.message || err });
    }
  });
};

const JsonParser = (value) => {
  try {
    const payload = JSON.parse(value);

    if (payload?.data?.message)
      payload.data.message =
        JSON.parse(payload?.data?.message) || payload?.data?.message;

    return payload;
  } catch (err) {
    console.log(err?.message);
    return "";
  }
};
