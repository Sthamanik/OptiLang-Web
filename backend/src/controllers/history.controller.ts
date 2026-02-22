import { Response } from "express";
import asyncHandler from "@utils/asyncHandler.util.js";
import { ApiResponse } from "@utils/apiResponse.util.js";
import { ApiError } from "@utils/apiError.util.js";
import { historyQuerySchema } from "@validations/execution.validation.js";
import * as historyService from "@services/history.service.js";
import { AuthRequest } from "@middlewares/auth.middleware.js";

export const getHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const parsed = historyQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid query");
  }

  const result = await historyService.getHistory(req.user!._id, parsed.data);

  res
    .status(200)
    .json(new ApiResponse(200, result, "History fetched successfully"));
});

export const getExecutionById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  if (!id || Array.isArray(id)) {
    throw new ApiError(400, "Execution ID is required");
  }

  const execution = await historyService.getExecutionById(id, req.user!._id);

  res
    .status(200)
    .json(new ApiResponse(200, { execution }, "Execution fetched successfully"));
});

export const deleteExecution = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  if (!id || Array.isArray(id)) {
    throw new ApiError(400, "Execution ID is required");
  }

  await historyService.deleteExecution(id, req.user!._id);

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Execution deleted successfully"));
});

export const clearHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await historyService.clearHistory(req.user!._id);

  res
    .status(200)
    .json(new ApiResponse(200, result, "History cleared successfully"));
});