export const ValidateUser = async (req, reply) => {
  try {
    if (!req?.headers?.authorization) {
      return reply.code(403).send({ message: "Unauthorized User!" });
    }

    const token = req?.headers?.authorization?.split(" ")[1];

    if (!token) {
      return reply.code(403).send({ message: "Unauthorized User!" });
    }

    req.token = token;
  } catch (err) {
    console.error(new Date().toISOString() + " : " + err?.message || err);
    reply.code(403).send({
      success: false,
      message: err?.message || err,
    });
  }
};
