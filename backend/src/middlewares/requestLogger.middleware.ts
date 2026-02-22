import { Request, Response, NextFunction } from "express";
import logger from "@utils/logger.util.js";

const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500
      ? "error"
      : res.statusCode >= 400
        ? "warn"
        : "info";

    logger[level](
      `[${req.method}] ${req.originalUrl} → ${res.statusCode} (${duration}ms)`
    );
  });

  next();
};

export default requestLogger;