import { Response } from "express";
import asyncHandler from "@utils/asyncHandler.util.js";
import { ApiResponse } from "@utils/apiResponse.util.js";
import { ApiError } from "@utils/apiError.util.js";
import { codeSchema, sourceSchema } from "@validations/execution.validation.js";
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

export const optimize = asyncHandler(async (req: AuthRequest, res: Response) => {
  const parsed = codeSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const result = await executionService.runOptimization(parsed.data, req.user!._id);

  res
    .status(200)
    .json(new ApiResponse(200, result, "Code optimized successfully"));
});

export const tokenize = asyncHandler(async (req: AuthRequest, res: Response) => {
  const parsed = sourceSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const result = await executionService.runTokenize(parsed.data, req.user!._id);

  res
    .status(200)
    .json(new ApiResponse(200, result, "Code tokenized successfully"));
});

export const parse = asyncHandler(async (req: AuthRequest, res: Response) => {
  const parsed = sourceSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const result = await executionService.runParse(parsed.data, req.user!._id);

  res
    .status(200)
    .json(new ApiResponse(200, result, "Code parsed successfully"));
});
