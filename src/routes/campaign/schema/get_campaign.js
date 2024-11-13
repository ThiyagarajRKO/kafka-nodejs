export const GetCampaignSchema = {
  schema: {
    query: {
      type: "object",
      required: [],
      properties: {
        folderId: { type: "string" },
        campaignId: { type: "string" },
        channelId: { type: "string" },
      },
    },
  },
};
