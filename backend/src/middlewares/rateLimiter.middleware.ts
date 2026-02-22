import rateLimit from "express-rate-limit";
import { config } from "@config/env.js";

// ── Auth routes — strict (brute force protection)
// 5 attempts per 15 minutes
export const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: 5,
  message: {
    success: false,
    statusCode: 429,
    message: "Too many attempts. Please try again after 15 minutes.",
    errors: [],
    data: null,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Execution routes — moderate
// 30 requests per 15 minutes
export const executionLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: 30,
  message: {
    success: false,
    statusCode: 429,
    message: "Too many execution requests. Please slow down.",
    errors: [],
    data: null,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── General API — relaxed
// Uses env-configured max (default 100 per 15 minutes)
export const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    statusCode: 429,
    message: "Too many requests. Please try again later.",
    errors: [],
    data: null,
  },
  standardHeaders: true,
  legacyHeaders: false,
});