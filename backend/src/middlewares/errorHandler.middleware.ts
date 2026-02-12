import { ApiError } from "@utils/apiError.util.js";
import { Request, Response, NextFunction } from 'express';

const errorHandler = (
  err: any,
  _: Request,
  res: Response,
  _next: NextFunction
): Response | void => {
  if ( err instanceof ApiError ){
    return res.status(err.statusCode).json({
      statusCode: err.statusCode,
      data: err.data,
      success: err.success,
      message: err.message || "Somthing went wrong",
      errors: err.errors || []
    })
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Something went off",
    error: err.message || "Something went wrong",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  })
}

export default errorHandler;