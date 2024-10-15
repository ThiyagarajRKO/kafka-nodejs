import { GetResponse } from "../../../../utils/node-fetch";

const customFieldsMeta = {
  "Campaign Name*": { id: "IEABCEFLJUAEF4AO", key: "campaignName" },
  "Campaign Objective*": { id: "IEABCEFLJUAEF4B7", key: "campaignDescription" },
  "Campaign Start Date*": { id: "IEABCEFLJUAEF4BI", key: "campaignObjective" },
  "Campaign End Date*": { id: "IEABCEFLJUAEF4BJ", key: "campaignStartDate" },
  "Biddable Nonbiddable*": { id: "", key: "campaignEndDate" },
  "Currency*": { id: "IEABCEFLJUAEGPM6", key: "currency" },
  "Campaign Budget*": { id: "IEABCEFLJUAEGZFP", key: "campaignBudget" },
  "Requestor Market*": { id: "", key: "requestorMarket" },
  "Agency*": { id: "IEABCEFLJUAEF4AI", key: "agency" },
  "Client*": { id: "IEABCEFLJUAEF4AK", key: "client" },
  "Debtor*": { id: "IEABCEFLJUAEGGC3", key: "debtor" },
  "Brand*": { id: "IEABCEFLJUAEF4AJ", key: "brand" },
  "CSSID*": { id: "IEABCEFLJUAGCS2I", key: "cssid" },
  "CCUID*": { id: "IEABCEFLJUAGCS2J", key: "ccuid" },
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
      let customFields = [];

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

      // Sending error response
      if (folderBlueprintData?.errorDescription) {
        return reject(folderBlueprintData);
      }

      // Constructing CF values
      await Promise.all(
        Object.keys(customFieldsMeta)?.map((data) => {
          const currentData = customFieldsMeta[data];
          if (currentData?.id) {
            customFields.push({
              id: currentData?.id,
              value: wrikeCampaign[currentData?.key],
            });
          }
        })
      );

      // Modifing folder data
      const folderUpdatedResp = await GetResponse(
        `${process.env.WRIKE_ENDPOINT}/folders/${folderId}`,
        "PUT",
        {
          "content-type": "application/json",
          Authorization: `Bearer ${wrikeToken}`,
        },
        {
          description: wrikeCampaign?.campaignDescription,
          customFields,
        }
      );

      // Sending folder update error response
      if (folderUpdatedResp?.errorDescription) {
        return reject(folderUpdatedResp);
      }

      // Iterating task blueprint id
      for (let i = 0; i < listOfChannelBlueprintId.length; i++) {
        const taskBlueprintId = listOfChannelBlueprintId[i];

        if (!taskBlueprintId) return;

        // Cloning task blueprint
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

        // Sending task blueprint error response
        if (taskBlueprintData?.errorDescription) {
          return reject(taskBlueprintData);
        }
      }

      // Sending final response
      resolve({
        message: "Campaign has been created successfully",
        data: {
          requiredCFIds,
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
