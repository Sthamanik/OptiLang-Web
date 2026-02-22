import winston from "winston";
import { config } from "@config/env.js";

const { combine, timestamp, colorize, printf, json, errors } = winston.format;

// ── Custom format for console output 
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  return stack
    ? `${timestamp} [${level}]: ${message}\n${stack}`
    : `${timestamp} [${level}]: ${message}`;
});

// ── Transports for different environments
const transports: winston.transport[] = [
  new winston.transports.Console({
    format: combine(
      colorize({ all: true }),
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      errors({ stack: true }),
      consoleFormat
    ),
  }),
];

// File logging only in production
if (config.nodeEnv === "production") {
  transports.push(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: combine(timestamp(), errors({ stack: true }), json()),
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      format: combine(timestamp(), errors({ stack: true }), json()),
    })
  );
}

// ── Logger instance 
const logger = winston.createLogger({
  level: config.logging.level,
  transports,
  // Do not exit on handled exceptions
  exitOnError: false,
});

export default logger;