export const ProduceSchema = {
  schema: {
    body: {
      type: "object",
      required: ["data", "topic"],
      properties: {
        data: { type: "object" },
        topic: { type: "string" },
      },
    },
  },
};
