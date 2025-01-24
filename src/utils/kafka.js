import { Kafka, logLevel } from "kafkajs";
import { BROKERS, CLIENT_ID } from "../../config/kafka";
import { SendEmail } from "./nodemailer";
import { logData } from "./wingston";
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
        fromBeginning: process.env.FROM_BEGINNING == "true",
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

          logData(payload?.status?.toLowerCase(), topic, payload, "");

          if (payload?.status?.toLowerCase() != "error") return;

          const htmlBody = `<h3>Informatica ${payload?.status}</h3>
            <table style="padding:5px; border:1px solid; border-radius:5px">
                <tr>
                    <th style="text-align:left">Process/Log ID</th>
                    <td>${payload?.id}</td>
                </tr>
                <tr>
                    <th style="text-align:left">Step</th>
                    <td>${payload?.step}</td>
                </tr>
                <tr>
                    <th style="text-align:left">Code</th>
                    <td>${payload?.code}</td>
                </tr>
                <tr>
                    <th style="text-align:left">Message</th>
                    <td>${JSON.stringify(payload?.message, null, 4)}</td>
                </tr>
                <tr>
                    <th style="text-align:left">Details</th>
                    <td>${payload?.details}</td>
                </tr>
                <tr>
                    <th style="text-align:left">c2cType</th>
                    <td>${payload?.c2cType}</td>
                </tr>
                <tr>
                    <th style="text-align:left">c2cExecution</th>
                    <td>${payload?.c2cExecution}</td>
                </tr>
                <tr>
                    <th style="text-align:left">InputParam</th>
                    <td>${JSON.stringify(payload?.inputParam, null, 4)}</td>
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

    // if (payload?.message)
    //   payload.message =
    //     typeof payload?.message == "string"
    //       ? JSON.parse(payload?.message)
    //       : payload?.message;

    return payload;
  } catch (err) {
    console.log(err?.message);
    return "";
  }
};
