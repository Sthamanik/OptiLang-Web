import "dotenv/config";

export const config = {
  port: Number(process.env.PORT) || 5000,
  host: process.env.HOST || "0.0.0.0",
  nodeEnv: process.env.NODE_ENV || "development",

  mongodb: {
    uri:
      process.env.MONGODB_URI ||
      "mongodb://localhost:27017/optilang",
    dbName: process.env.DB_NAME || "Optilang",
  },

  jwt: {
    accessSecret:
      process.env.ACCESS_TOKEN_SECRET ||
      "change-this-access-secret-in-production",
    accessExpiry: process.env.ACCESS_TOKEN_EXPIRY || "15m",
    refreshSecret:
      process.env.REFRESH_TOKEN_SECRET ||
      "change-this-refresh-secret-in-production",
    refreshExpiry: process.env.REFRESH_TOKEN_EXPIRY || "30d",
  },

  interpreter: {
    url: process.env.INTERPRETER_URL || "http://localhost:8000",
    timeout: Number(process.env.INTERPRETER_TIMEOUT) || 35000,
  },

  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  },

  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    maxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },

  logging: {
    level: process.env.LOG_LEVEL || "info",
  },
} as const;