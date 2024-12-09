import { GetResponse } from "../../../utils/node-fetch";
import { LogSteps } from "../../../controllers";
import customFieldIdMeta from "../utils/customFieldsIds";
import moment from "moment";

const WrikeEndpoint = process.env.WRIKE_ENDPOINT;
const WrikeToken = process.env.WRIKE_TOKEN;
const CustomFieldIds = customFieldIdMeta[process.env.NODE_ENV?.toLowerCase()];

export const Offshore = (params, request_id, fastify) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!WrikeToken) {
        return reject({ message: "Invalid auth token!" });
      }

      // Variable Declaration
      const { customFieldId, value, folderId } = params;

      if (
        customFieldId != CustomFieldIds["CopyToChild*"] ||
        value != "Overwrite"
      ) {
        return resolve({ message: "Not an overwrite action" });
      }

      let taskUpdateCustomFields = [];

      if (request_id)
        LogSteps.Insert({
          request_id,
          log_type: "Info",
          error_message: "",
          step_name: "Start",
          input: params,
          is_active: true,
        });

      console.log("Started At :", new Date());

      updateFolder(request_id, folderId, {
        customFields: [
          { id: CustomFieldIds["CopyToChild*"], value: "In progress" },
        ],
      });

      const folderData = await getFolder(request_id, folderId);

      let offshoreGlobalHub;
      // Filtering Offshore customfield value
      await Promise.all(
        folderData?.data[0]?.customFields?.map((data) => {
          if (data["id"] != CustomFieldIds["CopyToChild*"]) {
            const index = Object.values(CustomFieldIds)?.indexOf(data["id"]);
            if (index >= 0) {
              taskUpdateCustomFields[Object.keys(CustomFieldIds)[index]] =
                data["value"];

              if (data?.id == CustomFieldIds["Offshore Global Hub*"]) {
                offshoreGlobalHub = data?.value;
              }
            }
          }
        })
      );

      if (!offshoreGlobalHub) {
        if (request_id)
          LogSteps.Insert({
            request_id,
            log_type: "Warning",
            error_message: "Offshore Global Hub custom field must not be empty",
            step_name: "CustomField Validation",
            input: {},
            output: {},
            is_active: true,
          });

        updateFolder(request_id, folderId, {
          customFields: [
            { id: CustomFieldIds["CopyToChild*"], value: "Error" },
          ],
        });

        sendComment(
          request_id,
          folderId,
          "CopyToChild failed to run due to missing custom field <b>Offshore Global Hub</b>"
        );

        return reject({
          message: "Offshore Global Hub custom field must not be empty",
        });
      }

      await executeTaskOperation(request_id, folderId, taskUpdateCustomFields);

      updateFolder(request_id, folderId, {
        customFields: [
          { id: CustomFieldIds["CopyToChild*"], value: "Completed" },
        ],
      });

      if (request_id)
        LogSteps.Insert({
          request_id,
          log_type: "Info",
          error_message: "",
          step_name: "End",
          output: data,
          is_active: true,
        });

      console.log("Ended At :", new Date());

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

const getFolder = (request_id, folderId) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Get folder data
      const folderOutput = await GetResponse(
        `${WrikeEndpoint}/folders/${folderId}`,
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
          input: { folderId },
          output: folderOutput,
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

const updateFolder = (request_id, folderId, folderData) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Get folder data
      const folderOutput = await GetResponse(
        `${WrikeEndpoint}/folders/${folderId}`,
        "PUT",
        {
          "content-type": "application/json",
          Authorization: `Bearer ${WrikeToken}`,
        },
        folderData
      );

      if (request_id)
        LogSteps.Insert({
          request_id,
          log_type: folderOutput?.errorDescription ? "Error" : "Info",
          error_message: "",
          step_name: "Update Folder",
          input: folderData,
          output: folderOutput,
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

const sendComment = (request_id, folderId, comment) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Get folder data
      const commentOutput = await GetResponse(
        `${WrikeEndpoint}/folders/${folderId}/comments?text=${comment}`,
        "POST",
        {
          "content-type": "application/json",
          Authorization: `Bearer ${WrikeToken}`,
        }
      );

      if (request_id)
        LogSteps.Insert({
          request_id,
          log_type: commentOutput?.errorDescription ? "Error" : "Info",
          error_message: "",
          step_name: "Folder Comment",
          input: {
            text: comment,
          },
          output: commentOutput,
          is_active: true,
        });

      // Sending folder update error response
      if (commentOutput?.errorDescription) {
        return reject(commentOutput);
      }

      resolve(commentOutput);
    } catch (error) {
      reject(error);
    }
  });
};

const executeTaskOperation = (
  request_id,
  folderId,
  taskUpdateCustomFields,
  taskTempToken
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const tasks = await getTasks(request_id, folderId, taskTempToken);

      const taskIds = await Promise.all(tasks?.data?.map((data) => data?.id));

      if (taskIds.length == 0 && !tasks?.nextPageToken) {
        updateFolder(request_id, taskIds, {
          customFields: [
            {
              id: CustomFieldIds["CopyToChild*"],
              value: "Completed",
            },
          ],
        });
        return resolve();
      }

      await updateTask(request_id, taskIds, {
        customFields: taskUpdateCustomFields,
      });

      if (tasks?.nextPageToken) {
        await executeTaskOperation(
          request_id,
          folderId,
          taskUpdateCustomFields,
          tasks?.nextPageToken
        );
      }

      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

const getTasks = (request_id, folderId, taskTempToken) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Get the current date and time in UTC
      const currentDate = moment.utc();
      // Calculate the date 4 years (48 months) before
      const dateBefore4Years = currentDate.clone().subtract(48, "months");

      // Format the dates
      const formattedCurrentDate = currentDate.format("YYYY-MM-DDTHH:mm:ss[Z]");
      const formattedDateBefore4Years = dateBefore4Years.format(
        "YYYY-MM-DDTHH:mm:ss[Z]"
      );

      // Manually construct the JSON string
      const createdDate = JSON.stringify({
        start: formattedDateBefore4Years,
        end: formattedCurrentDate,
      });

      // Get folder data
      const taskOutput = await GetResponse(
        `${WrikeEndpoint}/folders/${folderId}/tasks?subTasks=true&pageSize=100&createdDate=${createdDate}&nextPageToken=${taskTempToken ?? ""}`,
        "GET",
        {
          "content-type": "application/json",
          Authorization: `Bearer ${WrikeToken}`,
        }
      );

      if (request_id)
        LogSteps.Insert({
          request_id,
          log_type: taskOutput?.errorDescription ? "Error" : "Info",
          error_message: "",
          step_name: "Get Tasks",
          input: {},
          output: taskOutput,
          is_active: true,
        });

      // Sending folder update error response
      if (taskOutput?.errorDescription) {
        return reject(taskOutput);
      }

      resolve(taskOutput);
    } catch (error) {
      reject(error);
    }
  });
};

const updateTask = (request_id, taskIds, taskData) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Get folder data
      const taskOutput = await GetResponse(
        `${WrikeEndpoint}/tasks/${taskIds}`,
        "PUT",
        {
          "content-type": "application/json",
          Authorization: `Bearer ${WrikeToken}`,
        },
        taskData
      );

      if (request_id)
        LogSteps.Insert({
          request_id,
          log_type: taskOutput?.errorDescription ? "Error" : "Info",
          error_message: "",
          step_name: "Update Task",
          input: {},
          output: folderData,
          is_active: true,
        });

      // Sending folder update error response
      if (taskOutput?.errorDescription) {
        return reject(taskOutput);
      }

      resolve(taskOutput);
    } catch (error) {
      reject(error);
    }
  });
};
