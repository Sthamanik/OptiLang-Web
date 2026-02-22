import { Request, Response, NextFunction } from "express";
import { ApiError } from "@utils/apiError.util.js";
import logger from "@utils/logger.util.js";

const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Known operational error
  if (err instanceof ApiError) {
    logger.warn(`[${req.method}] ${req.originalUrl} → ${err.statusCode}: ${err.message}`);

    res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
      data: null,
    });
    return;
  }

  // Unknown error — log full details, hide from client
  logger.error(`[${req.method}] ${req.originalUrl} → Unhandled error:`, err);

  res.status(500).json({
    success: false,
    statusCode: 500,
    message: "Internal server error",
    errors: [],
    data: null,
  });
};

export default errorHandler;