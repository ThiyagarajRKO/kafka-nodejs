import { GetResponse } from "../../../utils/node-fetch";
import { LogSteps } from "../../../controllers";
import customFieldIdMeta from "../utils/customFieldsIds-onshore";
import moment from "moment";

const WrikeEndpoint = process.env.WRIKE_ENDPOINT;
const WrikeToken = process.env.WRIKE_TOKEN;
const CustomFieldIds = customFieldIdMeta[process.env.NODE_ENV?.toLowerCase()];
const OriginalCustomFieldData = { TEST: [], LIVE: [] };
const CustomFieldRequired = [
  "Agency*",
  "Campaign Start Date*",
  "Campaign End Date*",
  "Currency*",
  "Campaign Objective*",
  "Brand*",
  "Requestor's Market*",
  "CCUID*",
  "CSSID*",
  "WrikeXPI-State",
  "Space Name*",
];

export const Onshore = (params, request_id, fastify) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!WrikeToken) {
        return reject({ message: "Invalid auth token!" });
      }

      // Variable Declaration
      const { folderId } = params;

      let taskUpdateCustomFields = [];
      let folderCustomFieldsValues = {};

      if (request_id)
        LogSteps.Insert({
          request_id,
          log_type: "Info",
          error_message: "",
          step_name: "Start",
          input: params,
          is_active: true,
        });

      await updateFolder(request_id, folderId, {
        customFields: [
          { id: CustomFieldIds["CopyToChild*"], value: "In Progress" },
        ],
      }).catch(console.log);

      const folderData = await getFolder(request_id, folderId);

      let spaceName;
      // Filtering Onshore customfield value
      await Promise.all(
        folderData?.data[0]?.customFields?.map((data) => {
          const index = Object.values(CustomFieldIds)?.indexOf(data["id"]);
          const reqCFIndex = CustomFieldRequired.indexOf(
            Object.keys(CustomFieldIds)[index]
          );
          if (index > -1 && reqCFIndex > -1) {
            taskUpdateCustomFields.push({
              id: data["id"],
              value:
                data?.id == CustomFieldIds["WrikeXPI-State"]
                  ? "Completed"
                  : data["value"],
            });
          }

          if (data?.id == CustomFieldIds["Space Name*"]) {
            spaceName = data?.value;
          }

          folderCustomFieldsValues[data?.id] = data?.value;
        })
      );

      if (!spaceName)
        return setErrorStatus(
          request_id,
          folderId,
          "CopyToChild failed to run due to missing custom field <b>space name</b>"
        )
          .then(resolve)
          .catch(reject);

      const spaceNameArray = spaceName.split("-");
      const clientCol = `Clients-${spaceNameArray[0]}-${spaceNameArray[1]}`;
      const debtorCol = `Debtors-${spaceNameArray[0]}-${spaceNameArray[1]}`;

      const customFieldData = await getCustomFields(request_id);

      if (customFieldData?.data?.length == 0)
        return reject({ message: "Custom Field Ids Empty" });

      const { clientSpaceNameId, debtorSpaceNameId } =
        await findClientAndDebtorValue(
          request_id,
          customFieldData?.data,
          clientCol,
          debtorCol
        );

      if (!clientSpaceNameId || clientSpaceNameId?.length <= 0)
        return setErrorStatus(
          request_id,
          folderId,
          `CopyToChild failed to run due to missing custom field <b>${clientCol}</b> (for your market or agency)`
        )
          .then(resolve)
          .catch(reject);

      if (!debtorSpaceNameId || debtorSpaceNameId?.length <= 0)
        return setErrorStatus(
          request_id,
          folderId,
          `CopyToChild failed to run due to missing custom field <b>${debtorCol}</b> (for your market or agency)`
        )
          .then(resolve)
          .catch(reject);

      if (clientSpaceNameId?.length > 1)
        return setErrorStatus(
          request_id,
          folderId,
          `CopyToChild failed to run due to missing custom field <b>${clientCol}</b> (for your market or agency) present multiple times`
        )
          .then(resolve)
          .catch(reject);

      if (debtorSpaceNameId?.length > 1)
        return setErrorStatus(
          request_id,
          folderId,
          `CopyToChild failed to run due to missing custom field <b>${debtorCol}</b> (for your market or agency) present multiple times`
        )
          .then(resolve)
          .catch(reject);

      // Inserting Client and Debtors space name
      taskUpdateCustomFields.push({
        id: clientSpaceNameId[0],
        value: folderCustomFieldsValues[clientSpaceNameId[0]],
      });

      taskUpdateCustomFields.push({
        id: debtorSpaceNameId[0],
        value: folderCustomFieldsValues[debtorSpaceNameId[0]],
      });

      taskUpdateCustomFields.push({
        id: CustomFieldIds["Client*"],
        value: folderCustomFieldsValues[clientSpaceNameId[0]],
      });

      taskUpdateCustomFields.push({
        id: CustomFieldIds["Debtor*"],
        value: folderCustomFieldsValues[debtorSpaceNameId[0]],
      });

      await executeTaskOperation(
        request_id,
        folderId,
        taskUpdateCustomFields
      ).catch(reject);

      await updateFolder(request_id, folderId, {
        customFields: [
          {
            id: CustomFieldIds["Campaign Name*"],
            value: folderData?.data[0]?.title,
          },
          {
            id: CustomFieldIds["Client*"],
            value: folderCustomFieldsValues[clientSpaceNameId[0]],
          },
          {
            id: CustomFieldIds["Debtor*"],
            value: folderCustomFieldsValues[debtorSpaceNameId[0]],
          },
          { id: CustomFieldIds["CopyToChild*"], value: "Completed" },
        ],
      }).catch(reject);

      if (request_id)
        LogSteps.Insert({
          request_id,
          log_type: "Info",
          error_message: "",
          step_name: "End",
          output: {},
          is_active: true,
        });

      // Sending final response
      resolve({
        message: "CopyToChild - Onshore process has been created successfully",
        data: {},
      });
    } catch (err) {
      console.log(err?.message || err);
      reject(err);
    }
  });
};

const setErrorStatus = (request_id, folderId, error_message) => {
  return new Promise((resolve, reject) => {
    try {
      if (request_id)
        LogSteps.Insert({
          request_id,
          log_type: "Warning",
          error_message: error_message,
          step_name: "CustomField Validation",
          input: {},
          output: {},
          is_active: true,
        });

      updateFolder(request_id, folderId, {
        customFields: [{ id: CustomFieldIds["CopyToChild*"], value: "Error" }],
      }).catch(console.log);

      sendComment(request_id, folderId, error_message);

      console.log(folderId + ": " + error_message);

      resolve({
        message: error_message,
      });
    } catch (err) {
      console.error(err?.message);
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
          input: { folderId, folderData },
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

const getCustomFields = (request_id) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Get folder data
      let customFieldOutput = {};
      if (OriginalCustomFieldData[process.env.NODE_ENV].length == 0)
        customFieldOutput = await GetResponse(
          `${WrikeEndpoint}/customfields`,
          "GET",
          {
            "content-type": "application/json",
            Authorization: `Bearer ${WrikeToken}`,
          }
        );
      else customFieldOutput = OriginalCustomFieldData[process.env.NODE_ENV];

      if (request_id)
        LogSteps.Insert({
          request_id,
          log_type: customFieldOutput?.errorDescription ? "Error" : "Info",
          error_message: "",
          step_name: "Get Custom Field",
          input: {},
          output: customFieldOutput,
          is_active: true,
        });

      // Sending folder update error response
      if (customFieldOutput?.errorDescription) {
        return reject(customFieldOutput);
      }

      if (OriginalCustomFieldData[process.env.NODE_ENV].length == 0)
        OriginalCustomFieldData[process.env.NODE_ENV] = customFieldOutput;

      resolve(customFieldOutput);
    } catch (error) {
      reject(error);
    }
  });
};

const findClientAndDebtorValue = (
  request_id,
  customFieldData,
  clientCol,
  debtorCol
) => {
  return new Promise(async (resolve, reject) => {
    try {
      let debtorSpaceNameId = [],
        clientSpaceNameId = [];
      await customFieldData.map((data) => {
        if (data?.title.startsWith(clientCol)) {
          clientSpaceNameId.push(data.id);
        }
        if (data?.title.startsWith(debtorCol)) {
          debtorSpaceNameId.push(data.id);
        }

        if (debtorSpaceNameId.length > 0 && clientSpaceNameId.length > 0)
          return;
      });

      if (request_id)
        LogSteps.Insert({
          request_id,
          log_type: customFieldOutput?.errorDescription ? "Error" : "Info",
          error_message: "",
          step_name: "Finding Client and Debtor value",
          input: {},
          output: { debtorSpaceNameId, clientSpaceNameId },
          is_active: true,
        });

      resolve({ debtorSpaceNameId, clientSpaceNameId });
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

      if (taskIds.length == 0 && !tasks?.nextPageToken)
        return setErrorStatus(
          request_id,
          folderId,
          "No tasks found in the project"
        )
          .then(resolve)
          .catch(reject);

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
      // Get folder data
      const taskOutput = await GetResponse(
        `${WrikeEndpoint}/folders/${folderId}/tasks?descendants=true&sortField=Title&sortOrder=Asc&subTasks=true&pageSize=20&nextPageToken=${taskTempToken ?? ""}`,
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
          input: { taskIds, ...taskData },
          output: {},
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
