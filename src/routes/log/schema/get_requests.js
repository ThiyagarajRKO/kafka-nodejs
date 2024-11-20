export const GetRequestSchema = {
  schema: {
    body: {
      type: "object",
      required: [],
      properties: {
        start: { type: "number" },
        length: { type: "number" },
      },
    },
  },
};
