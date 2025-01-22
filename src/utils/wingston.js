import winston from "winston";
import path from "path";

// Create a custom log format to include topic and data
const customFormat = winston.format.printf(
  ({ timestamp, level, message, topic, data }) => {
    return JSON.stringify({
      timestamp,
      level,
      topic,
      message,
      data,
    });
  }
);

// Create the logger instance
const logger = winston.createLogger({
  level: "info", // Log level
  format: winston.format.combine(
    winston.format.timestamp(), // Add timestamp
    customFormat // Apply custom format
  ),
  transports: [
    // Write logs to a file
    new winston.transports.File({
      filename: path.join(__dirname, "/../../logs", "app.log"),
      maxsize: 5242880, // 5MB max size
      maxFiles: 5, // Keep 5 rotated files
    }),
    // Optionally log to the console for debugging
    // new winston.transports.Console(),
  ],
});

// Function to log your data
export const logData = (level, topic, data, message = "") => {
  logger.log({
    level,
    topic,
    data,
    message,
  });
};
