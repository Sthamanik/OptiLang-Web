import mongoose, { Document, Schema } from "mongoose";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { config } from "@config/env.js";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
  // Methods
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },
    refreshToken: {
      type: String,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ email: 1 }, { unique: true });

// Hash password before saving 
UserSchema.pre("save", async function (this: IUser) {
  if (!this.isModified("password")) return ;
  this.password = await argon2.hash(this.password);
});

// Verify password using argon2 
UserSchema.methods.isPasswordCorrect = async function (
  password: string
): Promise<boolean> {
  return argon2.verify(this.password, password);
};

// Short-lived access token (15m)
UserSchema.methods.generateAccessToken = function (): string {
  return jwt.sign(
    { _id: this._id },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiry } as jwt.SignOptions
  );
};

// Long-lived refresh token (30d) 
UserSchema.methods.generateRefreshToken = function (): string {
  return jwt.sign(
    { _id: this._id },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiry } as jwt.SignOptions
  );
};

export const User = mongoose.model<IUser>("User", UserSchema);