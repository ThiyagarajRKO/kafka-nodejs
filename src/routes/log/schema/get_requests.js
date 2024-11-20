export const GetRequestSchema = {
  schema: {
    query: {
      type: "object",
      required: [],
      properties: {
        start: { type: "number" },
        length: { type: "number" },
        "search[value]": { type: "string" },
      },
    },
  },
};
