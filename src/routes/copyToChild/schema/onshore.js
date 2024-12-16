export const OnshoreSchema = {
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
