import { Response } from "express";
import asyncHandler from "@utils/asyncHandler.util.js";
import { ApiResponse } from "@utils/apiResponse.util.js";
import { ApiError } from "@utils/apiError.util.js";
import { codeSchema } from "@validations/execution.validation.js";
import * as executionService from "@services/execution.service.js";
import { AuthRequest } from "@middlewares/auth.middleware.js";

export const execute = asyncHandler(async (req: AuthRequest, res: Response) => {
  const parsed = codeSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const result = await executionService.runCode(parsed.data, req.user!._id);

  res
    .status(200)
    .json(new ApiResponse(200, result, "Code executed successfully"));
});

export const analyze = asyncHandler(async (req: AuthRequest, res: Response) => {
  const parsed = codeSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const result = await executionService.runAnalysis(parsed.data, req.user!._id);

  res
    .status(200)
    .json(new ApiResponse(200, result, "Code analyzed successfully"));
});