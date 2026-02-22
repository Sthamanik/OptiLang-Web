import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { config } from "@config/env.js";
import errorHandler from "@middlewares/errorHandler.middleware.js";
import requestLogger from "@middlewares/requestLogger.middleware.js";

const app: Application = express();

// ── Security and CORS
app.use(helmet());
app.use(cors({ origin: config.cors.origin, credentials: true }));

// ── Parsing 
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ limit: "1mb", extended: true }));

// ── Logging 
app.use(requestLogger);

// ── Health check 
app.get("/health", (_: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// ── 404
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ── Import routes 
import authRoutes from "@routes/auth.route.js";
import executionRoutes from "@routes/execution.route.js";
import historyRoutes from "@routes/history.route.js";

// ── Routes 
app.use("/api/auth", authRoutes);
app.use("/api", executionRoutes);
app.use("/api/history", historyRoutes);

// ── Global error handler 
app.use(errorHandler);

export default app;