import { Response } from "express";
import asyncHandler from "@utils/asyncHandler.util.js";
import { ApiResponse } from "@utils/apiResponse.util.js";
import { ApiError } from "@utils/apiError.util.js";
import { codeSchema, sourceSchema } from "@validations/execution.validation.js";
import * as executionService from "@services/execution.service.js";
import { AuthRequest } from "@middlewares/auth.middleware.js";

function parseCodeInput(body: unknown) {
  const parsed = codeSchema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid input");
  }
  return parsed.data;
}

/** POST /api/execute — raw run, persists execution record */
export const execute = asyncHandler(async (req: AuthRequest, res: Response) => {
  const input = parseCodeInput(req.body);
  const result = await executionService.runExecute(input, req.user!._id);
  res.status(200).json(new ApiResponse(200, result, "Code executed successfully"));
});

/** POST /api/analyze — full pipeline, persists execution record with score */
export const analyze = asyncHandler(async (req: AuthRequest, res: Response) => {
  const input = parseCodeInput(req.body);
  const result = await executionService.runAnalyze(input, req.user!._id);
  res.status(200).json(new ApiResponse(200, result, "Code analyzed successfully"));
});

/** POST /api/profile — profiling data only */
export const profile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const input = parseCodeInput(req.body);
  const result = await executionService.runProfile(input, req.user!._id);
  res.status(200).json(new ApiResponse(200, result, "Profiling completed"));
});

/** POST /api/optimize — suggestions only */
export const optimize = asyncHandler(async (req: AuthRequest, res: Response) => {
  const input = parseCodeInput(req.body);
  const result = await executionService.runOptimize(input, req.user!._id);
  res.status(200).json(new ApiResponse(200, result, "Optimization suggestions ready"));
});

/** POST /api/score — score report only */
export const score = asyncHandler(async (req: AuthRequest, res: Response) => {
  const input = parseCodeInput(req.body);
  const result = await executionService.runScore(input, req.user!._id);
  res.status(200).json(new ApiResponse(200, result, "Score calculated"));
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