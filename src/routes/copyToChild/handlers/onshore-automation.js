import { GetResponse } from "../../../utils/node-fetch";
import { LogSteps } from "../../../controllers";
import customFieldIdMeta from "../utils/customFieldsIds";
import { Onshore } from "./onshore";

const WrikeEndpoint = process.env.WRIKE_ENDPOINT;
const WrikeToken = process.env.WRIKE_TOKEN;
const CustomFieldIds = customFieldIdMeta[process.env.NODE_ENV?.toLowerCase()];

export const OnshoreAutomation = (params, request_id, fastify) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!WrikeToken) {
        return reject({ message: "Invalid auth token!" });
      }

      const { spaceId } = params;

      if (request_id)
        LogSteps.Insert({
          request_id,
          log_type: "Info",
          error_message: "",
          step_name: "Automation Start",
          input: params,
          is_active: true,
        });

      const statuses = ["Overwrite", "In Progress", "CopyNew"];
      for (const status of statuses) {
        if (request_id)
          LogSteps.Insert({
            request_id,
            log_type: "Info",
            error_message: "",
            step_name: "Started " + status + " process",
            input: params,
            is_active: true,
          });

        const folderData = await getFoldersBySpace(request_id, spaceId, status);

        console.log(`Total '${status}' folders: ${folderData?.data?.length}`);
        for (const data of folderData?.data) {
          console.log(`Folder ${data?.id} started at ${new Date()}`);
          if (request_id)
            LogSteps.Insert({
              request_id,
              log_type: "Info",
              error_message: "",
              step_name: "Started onshore process",
              input: {
                customFieldId: CustomFieldIds["CopyToChild*"],
                eventType: "FolderCustomFieldChanged",
                value: status,
                folderId: data?.id,
              },
              is_active: true,
            });

          const offshoreOutput = await Onshore(
            {
              folderId: data?.id,
            },
            null,
            fastify
          );

          if (request_id)
            LogSteps.Insert({
              request_id,
              log_type: "Info",
              error_message: "",
              step_name: "Completed onshore process",
              output: offshoreOutput,
              is_active: true,
            });
        }
      }

      if (request_id)
        LogSteps.Insert({
          request_id,
          log_type: "Info",
          error_message: "",
          step_name: "Automation End",
          is_active: true,
        });

      // Sending final response
      resolve({
        message: "Onshore Automation process has been created successfully",
        data: {},
      });
    } catch (err) {
      console.log(err?.message || err);

      if (request_id)
        LogSteps.Insert({
          request_id,
          log_type: "Error",
          error_message: err?.message,
          step_name: "Automation Error",
          is_active: true,
        });

      reject(err);
    }
  });
};

const getFoldersBySpace = (request_id, spaceId, status) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Get folder data
      const folderOutput = await GetResponse(
        `${WrikeEndpoint}/spaces/${spaceId}/folders?customFields=[{ id:'${CustomFieldIds["CopyToChild*"]}', comparator:'EqualTo', value:'${status}' }]&descendants=true&project=true`,
        "GET",
        {
          "content-type": "application/json",
          Authorization: `Bearer ${WrikeToken}`,
        }
      );

      if (request_id)
        LogSteps.Insert({
          request_id,
          log_type: folderOutput?.errorDescription ? "Error" : "Info",
          error_message: "",
          step_name: "Get Folder",
          input: { spaceId, totalRows: folderOutput?.data?.length },
          output: {},
          is_active: true,
        });

      // Sending folder update error response
      if (folderOutput?.errorDescription) {
        return reject(folderOutput);
      }

      resolve(folderOutput);
    } catch (error) {
      reject(error);
    }
  });
};
