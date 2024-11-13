import { GetResponse } from "../../../utils/node-fetch";

const customFieldsMeta = {
  "Campaign Name*": { id: "IEABCEFLJUAEF4AO", key: "campaignName" },
  "Campaign Objective*": { id: "IEABCEFLJUAEF4B7", key: "campaignObjective" },
  "Campaign Start Date*": { id: "IEABCEFLJUAEF4BI", key: "campaignStartDate" },
  "Campaign End Date*": { id: "IEABCEFLJUAEF4BJ", key: "campaignEndDate" },
  "Biddable Nonbiddable*": { id: "", key: "biddableNonbiddable" },
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

export const GetCampaign = (wrikeToken, params, fastify) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!wrikeToken) {
        return reject({ message: "Invalid auth token!" });
      }

      // Variable Declaration
      const { folderId, campaignId, channelId } = params;

      let customFields = [];

      if (!folderId)
        parentFolderId = await getFolderParentId(
          folderBlueprintData,
          wrikeToken
        );

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

        if (!taskBlueprintId) {
          return reject({ message: "Invalid task blueprint Id" });
        }

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
          listOfChannelIds: listOfFolderBlueprintId,
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

const getFolderParentId = (folderData, wrikeToken) => {
  return new Promise(async (resolve, reject) => {
    try {
      let getStatus = {};
      while (getStatus?.status != "Completed") {
        getStatus = await checkFolderStatus(
          folderData?.data[0]?.id,
          wrikeToken
        );
      }

      resolve(getStatus?.result?.folderId);
    } catch (error) {
      reject(error);
    }
  });
};

const checkFolderStatus = (jobId, wrikeToken) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Cloning task blueprint
      const jobStatus = await GetResponse(
        `${process.env.WRIKE_ENDPOINT}/async_job/${jobId}`,
        "GET",
        {
          "content-type": "application/json",
          Authorization: `Bearer ${wrikeToken}`,
        }
      );

      // Sending task blueprint error response
      if (jobStatus?.errorDescription) {
        return reject(jobStatus);
      }

      resolve(jobStatus?.data?.[0]);
    } catch (error) {
      reject(error);
    }
  });
};
