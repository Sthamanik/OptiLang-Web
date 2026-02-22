import { Router } from "express";
import * as executionController from "@controllers/execution.controller.js";
import { verifyJWT } from "@middlewares/auth.middleware.js";
import { executionLimiter } from "@middlewares/rateLimiter.middleware.js";

const router: Router = Router();

router.post("/execute", verifyJWT, executionLimiter, executionController.execute);
router.post("/analyze", verifyJWT, executionLimiter, executionController.analyze);

export default router;