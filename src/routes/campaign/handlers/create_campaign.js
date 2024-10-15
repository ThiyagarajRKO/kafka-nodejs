import { GetResponse } from "../../../../utils/node-fetch";

const requiredCFIds = [
  "Campaign Name*",
  "Campaign Objective*",
  "Campaign Start Date*",
  "Campaign End Date*",
  "Biddable Nonbiddable*",
  "Currency*",
  "Campaign Budget*",
  "Requestor Market*",
  "Agency*",
  "Client*",
  "Debtor*",
  "Brand*",
  "CSSID*",
  "CCUID*",
];

export const CreateCampaign = (wrikeToken, params, fastify) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!wrikeToken) {
        return reject({ message: "Invalid auth token!" });
      }

      // Variable Declaration
      let customFieldIds = [];

      // Get Custom Field Ids
      const customFieldsData = await GetResponse(
        `${process.env.WRIKE_ENDPOINT}/customfields`,
        "GET",
        {
          "content-type": "application/json",
          Authorization: `Bearer ${wrikeToken}`,
        }
      );

      console.log(customFieldsData?.data);

      if (!customFieldsData || customFieldsData?.data?.length == 0) {
        return reject({ message: "Failed to fetch custom field ids!" });
      }

      await Promise.all(
        customFieldsData?.data?.map((data) => {
          if (requiredCFIds.includes(data?.title)) {
            customFieldIds.push(data?.id);
          }
        })
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
