import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";

import {
  orderPlacedCustomerTemplate,
  orderPlacedAdminTemplate,
  orderDeliveredCustomerTemplate,
} from "../utils/emailTemplates.js";

const normalizeOrderStatus = (status = "") => {
  if (!status) return "packed";

  if (status === "To Pay") return "pending";
  if (status === "Processing") return "packed";

  if (status === "To Pack") return "packed";
  if (status === "Packed") return "packed";

  if (status === "To Ship") return "shipped";
  if (status === "Shipped") return "shipped";

  if (status === "To Receive") return "on_the_way";
  if (status === "On the Way") return "on_the_way";

  if (status === "Delivered") return "delivered";
  if (status === "To Review") return "delivered";

  if (status === "Cancelled") return "cancelled";

  if (status === "pending") return "pending";
  if (status === "processing") return "packed";
  if (status === "packed") return "packed";
  if (status === "shipped") return "shipped";
  if (status === "on_the_way") return "on_the_way";
  if (status === "delivered") return "delivered";
  if (status === "cancelled") return "cancelled";

  return String(status).toLowerCase();
};

const statusTextMap = {
  pending: "To Pay",
  processing: "To Pack",
  packed: "To Pack",
  shipped: "To Ship",
  on_the_way: "To Receive",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

// POST /api/orders
export const createOrder = async (req, res) => {
  try {
    const {
      customer,
      items,
      cartItemsTotal,
      deliveryFee,
      total,
      paymentMethod,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "No order items found",
      });
    }

    if (
      !customer ||
      !customer.fullName ||
      !customer.email ||
      !customer.phone ||
      !customer.addressLine1 ||
      !customer.addressLine2 ||
      !customer.province ||
      !customer.district ||
      !customer.city ||
      !paymentMethod
    ) {
      return res.status(400).json({
        message: "Please fill all delivery details",
      });
    }

    const formattedItems = items.map((item) => ({
      product: item.productId || item.product || item._id,
      name: item.name,
      quantity: Number(item.quantity),
      image: item.image || "",
      price: Number(item.price),
    }));

    for (const item of formattedItems) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          message: `${item.name} product not found`,
        });
      }

      if (product.stock < Number(item.quantity)) {
        return res.status(400).json({
          message: `Only ${product.stock} items available for ${product.name}`,
        });
      }
    }

    for (const item of formattedItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: {
          stock: -Number(item.quantity),
        },
      });
    }

    const calculatedItemsTotal = formattedItems.reduce((sum, item) => {
      return sum + Number(item.price || 0) * Number(item.quantity || 0);
    }, 0);

    const finalCartItemsTotal = Number(cartItemsTotal) || calculatedItemsTotal;
    const finalDeliveryFee = Number(deliveryFee) || 0;
    const finalTotal = Number(total) || finalCartItemsTotal + finalDeliveryFee;

    const paymentStatus =
      paymentMethod === "Cash on Delivery" ? "Pending" : "Paid";

    const order = await Order.create({
      user: req.user._id,
      customer,
      items: formattedItems,
      cartItemsTotal: finalCartItemsTotal,
      deliveryFee: finalDeliveryFee,
      totalPrice: finalTotal,
      paymentMethod,
      paymentStatus,
      shippingOption: "Standard",
      status: "packed",
      orderStatus: "To Pack",
      stockDeducted: true,
      packedAt: new Date(),
    });

    const orderedProductIds = formattedItems.map((item) =>
      String(item.product)
    );

    const cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
      cart.items = cart.items.filter(
        (item) => !orderedProductIds.includes(String(item.productId))
      );

      if (cart.items.length > 0) {
        await cart.save();
      } else {
        await Cart.findOneAndDelete({ user: req.user._id });
      }
    }

    try {
      await sendEmail(
        order.customer.email,
        `Your Lak Isuru Tea order is confirmed - #${order._id}`,
        "Your order has been placed successfully.",
        orderPlacedCustomerTemplate(order)
      );

      const admins = await User.find({
        role: { $regex: /^admin$/i },
      }).select("email");

      const adminEmails = admins.map((admin) => admin.email).filter(Boolean);

      if (process.env.SHOP_EMAIL) {
        adminEmails.push(process.env.SHOP_EMAIL);
      }

      const uniqueAdminEmails = [...new Set(adminEmails)];

      if (uniqueAdminEmails.length > 0) {
        await sendEmail(
          uniqueAdminEmails.join(","),
          `New Order Received - #${order._id}`,
          "New order received.",
          orderPlacedAdminTemplate(order)
        );
      }
    } catch (emailError) {
      console.error("Order email sending failed:", emailError.message);
    }

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("ORDER ERROR FULL:", error);

    res.status(500).json({
      message: "Server error while placing order",
      error: error.message,
    });
  }
};

// GET /api/orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({
      message: "Server error while loading orders.",
      error: error.message,
    });
  }
};

// GET /api/orders/cancellations
export const getMyCancellations = async (req, res) => {
  try {
    const cancellations = await Order.find({
      user: req.user._id,
      status: "cancelled",
    }).sort({ createdAt: -1 });

    res.status(200).json({ cancellations });
  } catch (error) {
    res.status(500).json({
      message: "Server error while loading cancellations.",
      error: error.message,
    });
  }
};

// PUT /api/orders/:id/pay
export const markOrderPaid = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    const currentStatus = normalizeOrderStatus(order.status || order.orderStatus);

    if (currentStatus === "cancelled") {
      return res.status(400).json({
        message: "Cancelled orders cannot be paid.",
      });
    }

    order.paymentStatus = "Paid";
    order.status = "packed";
    order.orderStatus = "To Pack";

    if (!order.packedAt) {
      order.packedAt = new Date();
    }

    await order.save();

    res.status(200).json({
      message: "Payment completed successfully.",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while updating payment.",
      error: error.message,
    });
  }
};

// PUT /api/orders/:id/cancel
export const cancelOrder = async (req, res) => {
  try {
    const { cancelReason, cancelNote } = req.body;

    if (!cancelReason) {
      return res.status(400).json({
        message: "Please select a cancellation reason.",
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    const currentStatus = normalizeOrderStatus(order.status || order.orderStatus);

    if (
      currentStatus === "shipped" ||
      currentStatus === "on_the_way" ||
      currentStatus === "delivered"
    ) {
      return res.status(400).json({
        message: "This order cannot be cancelled now.",
      });
    }

    if (currentStatus === "cancelled") {
      return res.status(400).json({
        message: "This order is already cancelled.",
      });
    }

    if (order.stockDeducted) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: {
            stock: Number(item.quantity),
          },
        });
      }

      order.stockDeducted = false;
    }

    order.status = "cancelled";
    order.orderStatus = "Cancelled";
    order.paymentStatus =
      order.paymentStatus === "Paid" ? "Refund Pending" : "Cancelled";

    order.cancelReason = cancelReason;
    order.cancelNote = cancelNote || "";
    order.cancelledAt = new Date();

    await order.save();

    res.status(200).json({
      message: "Order cancelled successfully.",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while cancelling order.",
      error: error.message,
    });
  }
};

// PUT /api/orders/:id/confirm-received
export const confirmReceived = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    const currentStatus = normalizeOrderStatus(order.status || order.orderStatus);

    if (currentStatus !== "on_the_way") {
      return res.status(400).json({
        message: "Only To Receive orders can be confirmed as received.",
      });
    }

    order.status = "delivered";
    order.orderStatus = "Delivered";
    order.deliveredAt = new Date();

    await order.save();

    try {
      await sendEmail(
        order.customer.email,
        `Your Lak Isuru Tea order has been delivered - #${order._id}`,
        "Your order has been delivered successfully.",
        orderDeliveredCustomerTemplate(order)
      );
    } catch (emailError) {
      console.error("Delivered email sending failed:", emailError.message);
    }

    res.status(200).json({
      message: "Order confirmed as received.",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while confirming order.",
      error: error.message,
    });
  }
};

// ADMIN - GET ALL ORDERS
export const getAllOrdersForAdmin = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      orders,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while loading admin orders.",
      error: error.message,
    });
  }
};

// ADMIN - UPDATE ORDER STATUS
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const requestedStatus = normalizeOrderStatus(status);

    const allowedStatuses = [
      "pending",
      "processing",
      "packed",
      "shipped",
      "on_the_way",
      "delivered",
      "cancelled",
    ];

    const validNextStatuses = {
      pending: ["packed", "cancelled"],
      processing: ["packed", "shipped", "on_the_way", "cancelled"],

      // flexible to avoid old database status errors
      packed: ["shipped", "on_the_way"],

      shipped: ["on_the_way", "delivered"],
      on_the_way: ["delivered"],
      delivered: [],
      cancelled: [],
    };

    if (!allowedStatuses.includes(requestedStatus)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const currentStatus = normalizeOrderStatus(order.status || order.orderStatus);

    console.log("STATUS UPDATE DEBUG:", {
      orderId: req.params.id,
      frontendStatus: status,
      requestedStatus,
      dbStatus: order.status,
      dbOrderStatus: order.orderStatus,
      currentStatus,
    });

    if (currentStatus === "cancelled") {
      return res.status(400).json({
        message: "Cancelled order status cannot be changed.",
      });
    }

    if (currentStatus === "delivered") {
      return res.status(400).json({
        message: "This order is already delivered and completed.",
      });
    }

    if (currentStatus === requestedStatus) {
      return res.status(400).json({
        message: `This order is already marked as ${
          statusTextMap[requestedStatus] || requestedStatus
        }.`,
      });
    }

    const nextStatuses = validNextStatuses[currentStatus] || [];

    if (!nextStatuses.includes(requestedStatus)) {
      return res.status(400).json({
        message: `Invalid status change. Current status is ${
          statusTextMap[currentStatus] || currentStatus
        }.`,
      });
    }

    order.status = requestedStatus;
    order.orderStatus = statusTextMap[requestedStatus];

    if (requestedStatus === "packed" && !order.packedAt) {
      order.packedAt = new Date();
    }

    if (requestedStatus === "shipped" && !order.shippedAt) {
      order.shippedAt = new Date();
    }

    if (requestedStatus === "on_the_way" && !order.onTheWayAt) {
      order.onTheWayAt = new Date();
    }

    if (requestedStatus === "delivered" && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }

    if (requestedStatus === "cancelled" && !order.cancelledAt) {
      order.cancelledAt = new Date();
    }

    const updatedOrder = await order.save();

    res.status(200).json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error);

    res.status(500).json({
      message: "Server error while updating order status",
      error: error.message,
    });
  }
};