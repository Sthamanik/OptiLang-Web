import { User, IUser } from "@models/User.model.js";
import { ApiError } from "@utils/apiError.util.js";
import { RegisterInput, LoginInput } from "@validations/auth.validation.js";

// ── Types

export interface SafeUser {
  _id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
}

// ── Helpers

const generateTokens = async (user: IUser): Promise<AuthTokens> => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const toSafeUser = (user: IUser): SafeUser => ({
  _id: user._id.toString(),
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

// ── Service methods 

export const registerUser = async (input: RegisterInput): Promise<AuthResult> => {
  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const user = await User.create({
    name: input.name,
    email: input.email,
    password: input.password,
  });

  const { accessToken, refreshToken } = await generateTokens(user);

  return { user: toSafeUser(user), accessToken, refreshToken };
};

export const loginUser = async (input: LoginInput): Promise<AuthResult> => {
  const user = await User.findOne({ email: input.email });
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isValid = await user.isPasswordCorrect(input.password);
  if (!isValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const { accessToken, refreshToken } = await generateTokens(user);

  return { user: toSafeUser(user), accessToken, refreshToken };
};

export const logoutUser = async (userId: string): Promise<void> => {
  await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
};

export const refreshTokens = async (
  incomingRefreshToken: string
): Promise<AuthTokens> => {
  // Verify token is valid (jwt.verify throws if invalid/expired)
  const jwt = await import("jsonwebtoken");
  const { config } = await import("@config/env.js");

  const decoded = jwt.default.verify(
    incomingRefreshToken,
    config.jwt.refreshSecret
  ) as { _id: string };

  const user = await User.findById(decoded._id);
  if (!user || user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  return generateTokens(user);
};