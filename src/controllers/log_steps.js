import models from "../../models";

export const Insert = async (log_data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!log_data?.log_type) {
        return reject({
          statusCode: 420,
          message: "Log type must not be empty!",
        });
      }

      if (!log_data?.request_id) {
        return reject({
          statusCode: 420,
          message: "Request ID must not be empty!",
        });
      }

      if (!log_data?.step_name) {
        return reject({
          statusCode: 420,
          message: "Step name must not be empty!",
        });
      }

      const result = await models.LogSteps.create(log_data);
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
};

export const GetAll = ({ request_id, start = 0, length = 20 }) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!request_id) {
        return reject({ message: "Request ID must not be empty" });
      }

      const inventories = await models.LogSteps.findAndCountAll({
        where: {
          is_active: true,
        },
        offset: start,
        limit: length,
        order: [["created_at", "desc"]],
      });

      resolve(inventories);
    } catch (err) {
      reject(err);
    }
  });
};
