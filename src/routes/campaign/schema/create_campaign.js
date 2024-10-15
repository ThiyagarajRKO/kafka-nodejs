export const CreateCampaignSchema = {
  schema: {
    body: {
      type: "object",
      required: [
        "spaceName",
        "folderId",
        "listOfFolderBlueprintId",
        "listOfChannelBlueprintId",
        "wrikeCampaign",
      ],
      properties: {
        spaceName: { type: "string" },
        folderId: { type: "string" },
        listOfFolderBlueprintId: { type: "array" },
        listOfChannelBlueprintId: { type: "array" },
        wrikeCampaign: { type: "object" },
      },
    },
  },
};
