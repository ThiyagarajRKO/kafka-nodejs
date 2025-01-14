import { produce } from "../../../utils/kafka";

export const Produce = ({ topic, data }, fastify) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data) return reject({ message: "Data must not be empty" });

      if (!topic) return reject({ message: "Topic must not be empty" });

      await produce(topic, data);

      // Sending final response
      resolve({ message: "Message successfully send!" });
    } catch (err) {
      console.log(err?.message || err);
      reject(err);
    }
  });
};
