import { GetResponse } from "../../../../utils/node-fetch";

const requiredCFNames = [
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

const requiredCFIds = {
  TEST: [
    "IEABCEFLJUAEF4B7",
    "IEABCEFLJUAEF4AJ",
    "IEABCEFLJUAEGPM6",
    "IEABCEFLJUAEF4AO",
    "IEABCEFLJUAEGZFP",
    "IEABCEFLJUAEF4BI",
    "IEABCEFLJUAEF4BJ",
    "IEABCEFLJUAEGGC3",
    "IEABCEFLJUAEF4AI",
    "IEABCEFLJUAGCS2I",
    "IEABCEFLJUAGCS2J",
    "IEABCEFLJUAEF4AK",
  ],
};

export const CreateCampaign = (wrikeToken, params, fastify) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!wrikeToken) {
        return reject({ message: "Invalid auth token!" });
      }

      // Variable Declaration
      const {
        spaceName,
        folderId,
        campaignBlueprintId,
        listOfChannelBlueprintId,
        wrikeCampaign,
      } = params;

      // // Get Custom Field Ids
      // const customFieldsData = await GetResponse(
      //   `${process.env.WRIKE_ENDPOINT}/customfields`,
      //   "GET",
      //   {
      //     "content-type": "application/json",
      //     Authorization: `Bearer ${wrikeToken}`,
      //   }
      // );

      // if (!customFieldsData || customFieldsData?.data?.length == 0) {
      //   return reject({ message: "Failed to fetch custom field ids!" });
      // }

      // // Extracting valid CF ids
      // await Promise.all(
      //   customFieldsData?.data?.map((data) => {
      //     if (requiredCFIds.includes(data?.title)) {
      //       customFieldIds.push(data?.id);
      //     }
      //   })
      // );

      // Clone folder blueprint
      const folderBlueprintData = await GetResponse(
        `${process.env.WRIKE_ENDPOINT}/folder_blueprints/${campaignBlueprintId}/launch_async`,
        "POST",
        {
          "content-type": "application/json",
          Authorization: `Bearer ${wrikeToken}`,
        },
        {
          parent: folderId,
          title: wrikeCampaign?.campaignName,
        }
      );

      if (folderBlueprintData?.errorDescription) {
        return reject(folderBlueprintData);
      }

      // listOfChannelBlueprintId.forEach(async (taskBlueprintId) => {
      for (let i = 0; i < listOfChannelBlueprintId.length; i++) {
        const taskBlueprintId = listOfChannelBlueprintId[i];

        if (!taskBlueprintId) return;

        const taskBlueprintData = await GetResponse(
          `${process.env.WRIKE_ENDPOINT}/task_blueprints/${taskBlueprintId}/launch_async`,
          "POST",
          {
            "content-type": "application/json",
            Authorization: `Bearer ${wrikeToken}`,
          },
          {
            parentId: folderId,
            title: wrikeCampaign?.campaignName,
          }
        );

        if (taskBlueprintData?.errorDescription) {
          return reject(taskBlueprintData);
        }
      }

      resolve({
        message: "Campaign has been created successfully",
        data: {
          campaignName: wrikeCampaign?.campaignName,
          campaignDescription: wrikeCampaign?.campaignDescription,
          campaignObjective: wrikeCampaign?.campaignObjective,
          campaignStartDate: wrikeCampaign?.campaignStartDate,
          campaignEndDate: wrikeCampaign?.campaignEndDate,
          biddableNonbiddable: wrikeCampaign?.biddableNonbiddable,
          currency: wrikeCampaign?.currency,
          campaignBudget: wrikeCampaign?.campaignBudget,
          requestorMarket: wrikeCampaign?.requestorMarket,
          agency: wrikeCampaign?.agency,
          client: wrikeCampaign?.client,
          debtor: wrikeCampaign?.debtor,
          brand: wrikeCampaign?.brand,
          folderPath: wrikeCampaign?.folderPath,
          cssid: wrikeCampaign?.cssid,
          ccuid: wrikeCampaign?.ccuid,
          customFields: {},
          listOfTaskIds: listOfChannelBlueprintId,
          listOfChannelIds: campaignBlueprintId,
          wrikev2id: wrikeCampaign?.wrikev2id,
          wrikev3id: wrikeCampaign?.wrikev3id,
          wrikePermalink: wrikeCampaign?.wrikePermalink,
        },
      });
    } catch (err) {
      console.log(err?.message || err);
      reject(err);
    }
  });
};
