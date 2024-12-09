import { Offshore } from "./handlers/offshore";
import { OffshoreAutomation } from "./handlers/offshore-automation";

// Schema
import { OffshoreSchema } from "./schema/offshore";
import { OffshoreAutomationSchema } from "./schema/offshore-automation";

import { LogRequests } from "../../controllers";

export const copyToChildRoute = (fastify, opts, done) => {
  fastify.post("/offshore", OffshoreSchema, async (req, reply) => {
    try {
      const { method, url } = req;

      console.log("Started At :", new Date());

      const logRequestData = await LogRequests.Insert({
        action_name: "CopyToChild - Offshore",
        method,
        url,
        statusCode: null,
        source_ip: req.socket.remoteAddress,
        user_agent: req.headers["user-agent"],
        platform: req.headers["sec-ch-ua-platform"]?.replaceAll('"', ""),
        is_active: true,
      });

      const result = await Offshore(req.body, logRequestData?.id, fastify);

      console.log("Ended At :", new Date());

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

  fastify.post(
    "/offshore/auto",
    OffshoreAutomationSchema,
    async (req, reply) => {
      try {
        const { method, url } = req;

        console.log("Started At :", new Date());

        const logRequestData = await LogRequests.Insert({
          action_name: "CopyToChild - Offshore",
          method,
          url,
          statusCode: null,
          source_ip: req.socket.remoteAddress,
          user_agent: req.headers["user-agent"],
          platform: req.headers["sec-ch-ua-platform"]?.replaceAll('"', ""),
          is_active: true,
        });

        const result = await OffshoreAutomation(
          req.body,
          logRequestData?.id,
          fastify
        );

        console.log("Ended At :", new Date());

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
    }
  );

  done();
};

export default copyToChildRoute;
