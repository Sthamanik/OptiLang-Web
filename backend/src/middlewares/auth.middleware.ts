import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "@config/env.js";
import { User } from "@models/User.model.js";
import { ApiError } from "@utils/apiError.util.js";
import asyncHandler from "@utils/asyncHandler.util.js";

export interface AuthRequest extends Request {
  user?: {
    _id: string;
    name: string;
    email: string;
  };
}

export const verifyJWT = asyncHandler(
  async (req: AuthRequest, _res: Response, next: NextFunction) => {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized: No token provided");
    }

    const decoded = jwt.verify(token, config.jwt.accessSecret) as {
      _id: string;
    };

    const user = await User.findById(decoded._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Unauthorized: Invalid token");
    }

    req.user = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
    };

    next();
  }
);