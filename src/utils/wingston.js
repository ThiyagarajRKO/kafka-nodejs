import winston from "winston";
import path from "path";
import dayjs from "dayjs"; // Lightweight alternative to moment

// Generate the log file names with the current date
const currentDate = dayjs().format("YYYYMMDD"); // Format date as YYYYMMDD

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
  level: "info", // Default log level
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // Add timestamp
    customFormat // Apply custom format
  ),
  transports: [
    // Transport for error logs
    new winston.transports.File({
      filename: path.join(
        __dirname,
        "../../logs",
        `app-error-${currentDate}.log`
      ),
      maxsize: 5242880, // 5MB max size
      maxFiles: 5, // Keep 5 rotated files
      level: "error",
    }),

    // Transport for info logs
    new winston.transports.File({
      filename: path.join(
        __dirname,
        "../../logs",
        `app-info-${currentDate}.log`
      ),
      maxsize: 5242880, // 5MB max size
      maxFiles: 5, // Keep 5 rotated files
      level: "info",
    }),

    // Transport for debug logs
    new winston.transports.File({
      filename: path.join(
        __dirname,
        "../../logs",
        `app-debug-${currentDate}.log`
      ),
      maxsize: 5242880, // 5MB max size
      maxFiles: 5, // Keep 5 rotated files
      level: "debug",
    }),

    // Optional console transport for development
    // new winston.transports.Console({
    //   format: winston.format.combine(
    //     winston.format.colorize(),
    //     winston.format.simple()
    //   ),
    // }),
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
