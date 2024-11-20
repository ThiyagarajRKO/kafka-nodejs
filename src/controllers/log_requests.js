import { LogRequests } from "../../models";

export const Insert = async (log_data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!log_data?.source_ip) {
        return reject({
          statusCode: 420,
          message: "Source IP must not be empty!",
        });
      }

      if (!log_data?.method) {
        return reject({
          statusCode: 420,
          message: "Log method must not be empty!",
        });
      }

      if (!log_data?.url) {
        return reject({
          statusCode: 420,
          message: "Log URL must not be empty!",
        });
      }

      const result = await LogRequests.create(log_data);
      resolve(result);
    } catch (err) {
      reject(err);
    }
  });
};

export const GetAll = ({ start = 0, length = 10, search }) => {
  return new Promise(async (resolve, reject) => {
    try {
      let where = {
        is_active: true,
      };

      if (search) {
        where[Op.or] = [
          { action_name: { [Op.iLike]: `%${search}%` } },
          { source_ip: { [Op.iLike]: `%${search}%` } },
          { url: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const log_data = await LogRequests.findAndCountAll({
        where,
        offset: start,
        limit: length,
        order: [["created_at", "desc"]],
      });

      resolve(log_data);
    } catch (err) {
      reject(err);
    }
  });
};
