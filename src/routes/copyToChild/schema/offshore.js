export const OffshoreSchema = {
  schema: {
    body: {
      type: "object",
      required: ["folderId"],
      properties: {
        folderId: { type: "string" },
      },
    },
  },
};
