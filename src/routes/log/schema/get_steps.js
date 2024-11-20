export const GetStepSchema = {
  schema: {
    query: {
      type: "object",
      required: ["requestId"],
      properties: {
        requestId: { type: "string" },
      },
    },
  },
};
