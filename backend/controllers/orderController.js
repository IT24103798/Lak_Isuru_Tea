import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

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
      !customer.postalCode ||
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

    for (const item of items) {
      const productId = item.productId || item.product || item._id;
      const product = await Product.findById(productId);

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

    const paymentStatus =
      paymentMethod === "Cash on Delivery" ? "Pending" : "Paid";

    const order = await Order.create({
      user: req.user._id,
      customer,
      items: formattedItems,
      cartItemsTotal: Number(cartItemsTotal),
      deliveryFee: Number(deliveryFee),
      totalPrice: Number(total),
      paymentMethod,
      paymentStatus,
      orderStatus: "To Ship",
      status: "processing",
    });

    for (const item of items) {
      const productId = item.productId || item.product || item._id;

      await Product.findByIdAndUpdate(productId, {
        $inc: {
          stock: -Number(item.quantity),
        },
      });
    }

    await Cart.findOneAndDelete({ user: req.user._id });

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
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

// GET /api/orders/returns
export const getMyReturns = async (req, res) => {
  try {
    const returns = await Order.find({
      user: req.user._id,
      status: "returned",
    }).sort({ createdAt: -1 });

    res.status(200).json({ returns });
  } catch (error) {
    res.status(500).json({
      message: "Server error while loading returns.",
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

    if (order.status === "cancelled") {
      return res.status(400).json({
        message: "Cancelled orders cannot be paid.",
      });
    }

    order.paymentStatus = "Paid";
    order.orderStatus = "To Ship";
    order.status = "processing";

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

    if (
      order.status === "shipped" ||
      order.status === "delivered" ||
      order.status === "returned"
    ) {
      return res.status(400).json({
        message: "This order cannot be cancelled now.",
      });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({
        message: "This order is already cancelled.",
      });
    }

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
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

    if (order.status !== "shipped") {
      return res.status(400).json({
        message: "Only shipped orders can be confirmed as received.",
      });
    }

    order.status = "delivered";
    order.orderStatus = "To Review";

    await order.save();

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

/* =========================
   ADMIN - GET ALL ORDERS
========================= */
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

/* ===============================
   ADMIN - UPDATE ORDER STATUS
=============================== */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "returned",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status.",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found.",
      });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({
        message: "Cancelled orders cannot be updated.",
      });
    }

    order.status = status;

    if (status === "pending") {
      order.orderStatus = "To Pay";
      order.paymentStatus = "Pending";
    }

    if (status === "processing") {
      order.orderStatus = "To Ship";
    }

    if (status === "shipped") {
      order.orderStatus = "To Receive";
    }

    if (status === "delivered") {
      order.orderStatus = "To Review";
    }

    if (status === "returned") {
      order.orderStatus = "Returned";
    }

    if (status === "cancelled") {
      order.orderStatus = "Cancelled";
      order.paymentStatus =
        order.paymentStatus === "Paid" ? "Refund Pending" : "Cancelled";
      order.cancelledAt = new Date();
      order.cancelReason = order.cancelReason || "Cancelled by admin";
      order.cancelNote = order.cancelNote || "";
    }

    await order.save();

    res.status(200).json({
      message: "Order status updated successfully.",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while updating order status.",
      error: error.message,
    });
  }
};