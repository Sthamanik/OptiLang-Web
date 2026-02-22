
import { Router } from "express";
import * as authController from "@controllers/auth.controller.js";
import { verifyJWT } from "@middlewares/auth.middleware.js";
import { authLimiter } from "@middlewares/rateLimiter.middleware.js";

const router:Router = Router();

// Public — rate limited
router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);
router.post("/refresh", authLimiter, authController.refreshAccessToken);

// Protected
router.post("/logout", verifyJWT, authController.logout);
router.get("/me", verifyJWT, authController.getCurrentUser);

export default router;