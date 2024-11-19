export const CreateCampaignSchema = {
  schema: {
    body: {
      type: "object",
      required: [
        "spaceName",
        "folderId",
        "campaignBlueprintId",
        "listOfChannelBlueprintId",
        "wrikeCampaign",
      ],
      properties: {
        spaceName: { type: "string" },
        folderId: { type: "string" },
        campaignBlueprintId: { type: "string" },
        listOfChannelBlueprintId: { type: "array" },
        wrikeCampaign: { type: "object" },
      },
    },
  },
};
