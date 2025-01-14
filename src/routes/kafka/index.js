import { Produce } from "./handlers/produce";

// Schema
import { ProduceSchema } from "./schema/produce";

export const kafkaRoute = (fastify, opts, done) => {
  fastify.post("/send", ProduceSchema, async (req, reply) => {
    try {
      const result = await Produce(req.body, fastify);

      reply.code(result.statusCode || 200).send({
        success: true,
        message: result.message,
        data: result?.data,
      });
    } catch (err) {
      reply.code(err?.statusCode || 400).send({
        success: false,
        message: err?.message || err,
      });
    }
  });

  done();
};

export default kafkaRoute;
