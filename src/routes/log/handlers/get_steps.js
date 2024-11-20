import { LogSteps } from "../../../controllers";

export const GetSteps = ({ request_id, start, length }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const data = await LogSteps.GetAll({
        request_id,
        start,
        length,
      });

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
