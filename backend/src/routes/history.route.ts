import { Router } from "express";
import * as historyController from "@controllers/history.controller.js";
import { verifyJWT } from "@middlewares/auth.middleware.js";
import { generalLimiter } from "@middlewares/rateLimiter.middleware.js";

const router: Router = Router();

router.use(verifyJWT, generalLimiter);

router.get("/", historyController.getHistory);
router.get("/:id", historyController.getExecutionById);
router.delete("/", historyController.clearHistory);
router.delete("/:id", historyController.deleteExecution);

export default router;