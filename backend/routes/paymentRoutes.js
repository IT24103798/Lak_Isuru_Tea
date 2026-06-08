import express from "express";
import crypto from "crypto";
import Order from "../models/Order.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const formatAmount = (amount) => {
  return Number(amount).toFixed(2);
};

const md5 = (value) => {
  return crypto.createHash("md5").update(value).digest("hex").toUpperCase();
};

// POST /api/payments/payhere/hash
router.post("/payhere/hash", protect, async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({
        message: "Order ID and amount are required.",
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    const currency = process.env.PAYHERE_CURRENCY || "LKR";
    const amountFormatted = formatAmount(amount);

    if (!merchantId || !merchantSecret) {
      return res.status(500).json({
        message: "PayHere credentials are missing in backend .env file.",
      });
    }

    const hashedSecret = md5(merchantSecret);

    const hash = md5(
      merchantId + orderId + amountFormatted + currency + hashedSecret
    );

    res.status(200).json({
      merchantId,
      orderId,
      amount: amountFormatted,
      currency,
      hash,
      sandbox: process.env.PAYHERE_SANDBOX === "true",
      returnUrl: `${process.env.FRONTEND_URL}/order-success`,
      cancelUrl: `${process.env.FRONTEND_URL}/payment`,
      notifyUrl: `${process.env.BACKEND_URL}/api/payments/payhere/notify`,
    });
  } catch (error) {
    res.status(500).json({
      message: "PayHere hash generation failed.",
      error: error.message,
    });
  }
});

// POST /api/payments/payhere/notify
router.post("/payhere/notify", async (req, res) => {
  try {
    const {
      merchant_id,
      order_id,
      payment_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
    } = req.body;

    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

    if (!merchantSecret) {
      return res.status(500).send("PayHere merchant secret missing");
    }

    const localMd5sig = md5(
      merchant_id +
        order_id +
        payhere_amount +
        payhere_currency +
        status_code +
        md5(merchantSecret)
    );

    if (localMd5sig !== md5sig) {
      return res.status(400).send("Invalid signature");
    }

    const order = await Order.findById(order_id);

    if (!order) {
      return res.status(404).send("Order not found");
    }

    order.payhereOrderId = order_id;
    order.payherePaymentId = payment_id || "";

    if (status_code === "2") {
      order.paymentStatus = "Paid";
      order.orderStatus = "To Ship";
      order.status = "processing";
    } else {
      order.paymentStatus = "Failed";
      order.orderStatus = "To Pay";
      order.status = "pending";
    }

    await order.save();

    res.status(200).send("OK");
  } catch (error) {
    res.status(500).send("PayHere notify failed");
  }
});

export default router;