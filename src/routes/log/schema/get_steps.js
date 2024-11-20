export const GetStepSchema = {
  schema: {
    query: {
      type: "object",
      required: ["request_id"],
      properties: {
        request_id: { type: "string" },
      },
    },
  },
};
