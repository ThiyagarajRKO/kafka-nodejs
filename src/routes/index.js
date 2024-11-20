"use strict";

import campaignRoute from "./campaign";

// Auth Middleware
import { ValidateUser } from "../middlewares/authentication";

//Public Routes
export const PublicRouters = (fastify, opts, done) => {
  //   fastify.register(usersRoute, { prefix: "/auth" });

  //   fastify.register(assetsRoutes, { prefix: "/asset" });

  fastify.register(campaignRoute, { prefix: "/log" });

  done();
};

//Protected Routes
export const PrivateRouters = (fastify, opts, done) => {
  // Validating session
  fastify.addHook("onRequest", ValidateUser);
  // fastify.use(ValidateUser);

  fastify.register(campaignRoute, { prefix: "/campaign" });

  done();
};
