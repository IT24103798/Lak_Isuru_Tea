import express from "express";
import {
  createOrder,
  getMyOrders,
  getMyCancellations,
  markOrderPaid,
  cancelOrder,
  confirmReceived,
  getAllOrdersForAdmin,
  updateOrderStatus,
} from "../controllers/orderController.js";

import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

/* Customer routes */
router.post("/", protect, createOrder);

router.get("/", protect, getMyOrders);
router.get("/cancellations", protect, getMyCancellations);

/* Admin routes */
router.get("/admin/all", protect, admin, getAllOrdersForAdmin);
router.put("/:id/status", protect, admin, updateOrderStatus);

/* Customer actions */
router.put("/:id/pay", protect, markOrderPaid);
router.put("/:id/cancel", protect, cancelOrder);
router.put("/:id/confirm-received", protect, confirmReceived);

export default router;