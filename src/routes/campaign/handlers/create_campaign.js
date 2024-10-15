import { GetResponse } from "../../../../utils/node-fetch";

export const CreateCampaign = (wrikeToken, params, fastify) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!wrikeToken) {
        return reject({ message: "Invalid auth token!" });
      }

      // Get Custom Field Ids
      const customFieldIds = await GetResponse(
        `${process.env.WRIKE_ENDPOINT}/`,
        "GET",
        {
          "content-type": "application/json",
          Authorization: `Bearer ${wrikeToken}`,
        }
      );

      resolve({
        data: { customFieldIds },
      });
    } catch (err) {
      console.log(err?.message || err);
      reject(err);
    }
  });
};
