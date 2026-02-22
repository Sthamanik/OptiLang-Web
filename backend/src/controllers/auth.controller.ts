import { Request, Response } from "express";
import asyncHandler from "@utils/asyncHandler.util.js";
import { ApiResponse } from "@utils/apiResponse.util.js";
import { ApiError } from "@utils/apiError.util.js";
import { registerSchema, loginSchema } from "@validations/auth.validation.js";
import * as authService from "@services/auth.service.js";
import { AuthRequest } from "@middlewares/auth.middleware.js";
import { config } from "@config/env.js";

const cookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === "production",
  sameSite: "strict" as const,
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { user, accessToken, refreshToken } = await authService.registerUser(parsed.data);

  res
    .status(201)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(201, { user, accessToken }, "Account created successfully"));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { user, accessToken, refreshToken } = await authService.loginUser(parsed.data);

  res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, { user, accessToken }, "Login successful"));
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  await authService.logoutUser(req.user!._id);

  res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

export const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const incomingToken = req.cookies?.refreshToken ?? req.body?.refreshToken;

  if (!incomingToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  const { accessToken, refreshToken } = await authService.refreshTokens(incomingToken);

  res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, { accessToken }, "Token refreshed successfully"));
});

export const getCurrentUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  res
    .status(200)
    .json(new ApiResponse(200, { user: req.user }, "User fetched successfully"));
});