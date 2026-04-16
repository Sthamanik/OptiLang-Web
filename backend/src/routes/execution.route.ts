import { Router } from "express";
import * as executionController from "@controllers/execution.controller.js";
import { verifyJWT } from "@middlewares/auth.middleware.js";
import { executionLimiter } from "@middlewares/rateLimiter.middleware.js";

const router: Router = Router();

// All execution routes require auth + rate limiting
router.use(verifyJWT, executionLimiter);

router.post("/execute",  executionController.execute);   // raw run
router.post("/analyze",  executionController.analyze);   // full pipeline
router.post("/profile",  executionController.profile);   // profiling only
router.post("/optimize", executionController.optimize);  // suggestions only
router.post("/score",    executionController.score);     // score only
router.post("/tokenize", executionController.tokenize); // tokenization
router.post("/parse",    executionController.parse);    // parsing

export default router;