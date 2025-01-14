const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");

require("dotenv").config();

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_SECRET,
  port: process.env.DB_PORT,
});

// Helper to log the request
const logRequest = ({ method, url, statusCode, input }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const requestId = uuidv4();
      await pool.query(
        "INSERT INTO requests (request_id, method, url, status_code, input) VALUES ($1, $2, $3, $4, $5)",
        [requestId, method, url, statusCode, input]
      );
      resolve(requestId);
    } catch (err) {
      console.error("Error while inserting request log:", err?.message ?? err);
      resolve();
    }
  });
};

// Helper to log a step
const logStep = async (
  requestId,
  log_type,
  error_message,
  stepName,
  input,
  output
) => {
  return new Promise(async (resolve, reject) => {
    try {
      await pool.query(
        "INSERT INTO request_steps (request_id, log_type, error_message, step_name, input, output) VALUES ($1, $2, $3, $4, $5, $6)",
        [requestId, log_type, error_message, stepName, input, output]
      );
    } catch (err) {
      console.error("Error while inserting steps log:", err?.message);
    } finally {
      resolve();
    }
  });
};

module.exports = { logRequest, logStep };
