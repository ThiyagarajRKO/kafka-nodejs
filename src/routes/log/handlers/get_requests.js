import { LogRequests } from "../../../controllers";

export const GetRequests = (
  { start = 0, length = 10, "search[value]": search },
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
      resolve({
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
