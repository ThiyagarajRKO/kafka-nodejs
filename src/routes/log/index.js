import { GetRequests } from "./handlers/get_requests";
import { GetSteps } from "./handlers/get_steps";

// Schema
import { GetRequestSchema } from "./schema/get_requests";
import { GetStepSchema } from "./schema/get_steps";

export const logRoute = (fastify, opts, done) => {
  fastify.get("/request", GetRequestSchema, async (req, reply) => {
    try {
      const result = await GetRequests(req.query, fastify);

      reply.code(result.statusCode || 200).send({
        success: true,
        message: result.message,
        data: result?.data,
      });
    } catch (err) {
      logStep(requestId, "Error", err?.message, "Process End");

      reply.code(err?.statusCode || 400).send({
        success: false,
        message: err?.message || err,
      });
    }
  });

  fastify.get("/step", GetStepSchema, async (req, reply) => {
    try {
      const result = await GetSteps(req.query, fastify);

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

export default logRoute;
