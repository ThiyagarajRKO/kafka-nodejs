import { LogRequests } from "../../../controllers";

export const GetRequests = (
  { start, length, "search[value]": search },
  fastify
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await LogRequests.GetAll({ start, length, search });

      if (!data) {
        return reject({
          statusCode: 420,
          message: "No data found!",
        });
      }

      // Sending final response
      resolve({ data });
    } catch (err) {
      console.log(err?.message || err);
      reject(err);
    }
  });
};
