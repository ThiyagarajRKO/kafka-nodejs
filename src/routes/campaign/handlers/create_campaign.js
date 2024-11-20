import { GetResponse } from "../../../utils/node-fetch";
import { logStep } from "../../../utils/logger";

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

let channelTitles = {};

export const CreateCampaign = (wrikeToken, params, requestId, fastify) => {
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

      if (requestId) logStep(requestId, "Info", "", "Start", params);

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

      // Iterating task blueprint id

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

      if (requestId)
        logStep(
          requestId,
          folderBlueprintData?.errorDescription ? "Error" : "Info",
          "",
          "Folder Blueprint",
          {
            parent: folderId,
            title: wrikeCampaign?.campaignName,
          },
          folderBlueprintData
        );

      // Sending error response
      if (folderBlueprintData?.errorDescription) {
        return reject(folderBlueprintData);
      }

      const parentFolderId = await getFolderParentId(
        requestId,
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
      if (requestId)
        logStep(
          requestId,
          "Info",
          "",
          "Get Folder",
          {
            description: wrikeCampaign?.campaignDescription,
            customFields,
          },
          folderUpdatedResp
        );

      // Sending folder update error response
      if (folderUpdatedResp?.errorDescription) {
        return reject(folderUpdatedResp);
      }

      if (listOfChannelBlueprintId.length > 0)
        await getChannelTitles(requestId, wrikeToken, listOfChannelBlueprintId);

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
            parentId: parentFolderId,
            title:
              channelTitles[taskBlueprintId] || wrikeCampaign?.campaignName,
          }
        );

        if (requestId)
          logStep(
            requestId,
            taskBlueprintData?.errorDescription ? "Error" : "Info",
            "",
            "Task Bluprint",
            {
              parentId: parentFolderId,
              title:
                channelTitles[taskBlueprintId] || wrikeCampaign?.campaignName,
            },
            taskBlueprintData
          );

        // Sending task blueprint error response
        if (taskBlueprintData?.errorDescription) {
          return reject(taskBlueprintData);
        }
      }

      const data = {
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
        listOfChannelIds: [campaignBlueprintId],
        wrikev2id: wrikeCampaign?.wrikev2id,
        wrikev3id: wrikeCampaign?.wrikev3id,
        wrikePermalink: wrikeCampaign?.wrikePermalink,
      };

      if (requestId) logStep(requestId, "Info", "", "End", {}, data);

      // Sending final response
      resolve({
        message: "Campaign has been created successfully",
        data,
      });
    } catch (err) {
      console.log(err?.message || err);
      reject(err);
    }
  });
};

const getFolderParentId = (requestId, folderData, wrikeToken) => {
  return new Promise(async (resolve, reject) => {
    try {
      let getStatus = {};
      while (getStatus?.status != "Completed") {
        getStatus = await checkFolderStatus(
          requestId,
          folderData?.data[0]?.id,
          wrikeToken
        );
      }

      if (requestId)
        logStep(
          requestId,
          getStatus?.errorDescription ? "Error" : "Info",
          "",
          "Async Job Status",
          {},
          getStatus
        );

      resolve(getStatus?.result?.folderId);
    } catch (error) {
      reject(error);
    }
  });
};

const checkFolderStatus = (requestId, jobId, wrikeToken) => {
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
        if (requestId)
          logStep(requestId, "Error", "", "Async Job Status", {}, jobStatus);

        return reject(jobStatus);
      }

      resolve(jobStatus?.data?.[0]);
    } catch (error) {
      if (requestId)
        logStep(requestId, "Error", error?.message, "Async Job Status");
      reject(error);
    }
  });
};

const getChannelTitles = (requestId, wrikeToken, listOfChannelBlueprintId) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Cloning task blueprint
      const jobStatus = await GetResponse(
        `${process.env.WRIKE_ENDPOINT}/task_blueprints`,
        "GET",
        {
          "content-type": "application/json",
          Authorization: `Bearer ${wrikeToken}`,
        }
      );

      // Sending task blueprint error response
      if (jobStatus?.errorDescription) {
        if (requestId)
          logStep(
            requestId,
            "Error",
            "",
            "Get Task Template Titles",
            {},
            jobStatus?.errorDescription
          );
        return reject(jobStatus);
      }

      await Promise.all(
        jobStatus?.data?.map((data) => {
          if (listOfChannelBlueprintId.includes(data.id)) {
            channelTitles[data?.id] = data?.title;
          }
        })
      );

      if (requestId)
        logStep(
          requestId,
          "Info",
          "",
          "Get Task Template Titles",
          {},
          channelTitles
        );

      resolve();
    } catch (error) {
      if (requestId)
        logStep(requestId, "Error", error?.message, "Get Task Template Titles");
      reject(error);
    }
  });
};
