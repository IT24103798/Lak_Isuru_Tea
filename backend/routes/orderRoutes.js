import express from "express";
import {
  createOrder,
  getMyOrders,
  getMyReturns,
  getMyCancellations,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrder);

router.get("/", protect, getMyOrders);
router.get("/returns", protect, getMyReturns);
router.get("/cancellations", protect, getMyCancellations);

export default router;