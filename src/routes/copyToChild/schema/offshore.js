export const OffshoreSchema = {
  schema: {
    body: {
      type: "object",
      required: ["customFieldId", "eventType", "value", "folderId"],
      properties: {
        customFieldId: { type: "string" },
        eventType: { type: "string" },
        value: { type: "string" },
        folderId: { type: "string" },
      },
    },
  },
};
