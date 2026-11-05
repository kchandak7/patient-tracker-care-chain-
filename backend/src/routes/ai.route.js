import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { nurseAIChat, submitVitalsWithNEWS2 } from "../controllers/ai.controller.js";

const router = express.Router();
router.use(protectRoute);

// AI Nurse Assistant chat
router.post("/nurse/chat", nurseAIChat);

// Submit structured vitals + NEWS2 score
router.post("/nurse/vitals/:taskId", submitVitalsWithNEWS2);

export default router;

