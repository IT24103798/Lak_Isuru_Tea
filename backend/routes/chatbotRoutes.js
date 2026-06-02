import express from "express";
import {
  chatWithBot,
  getChatbotLogs,
} from "../controllers/chatbotController.js";

import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/chat", chatWithBot);
router.get("/logs", protect, admin, getChatbotLogs);

export default router;