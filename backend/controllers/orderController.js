import Cart from "../models/Cart.js";
import Order from "../models/Order.js";

// POST /api/orders
export const createOrder = async (req, res) => {
  try {
    const {
      customer,
      items,
      cartItemsTotal,
      deliveryFee,
      total,
      status,
      paymentMethod,
      paymentStatus,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    const orderItems = items.map((item) => ({
      product: item.productId || item.product,
      name: item.name,
      quantity: item.quantity || 1,
      price: item.price || 0,
    }));

    if (orderItems.some((item) => !item.product || !item.name || !item.price)) {
      return res.status(400).json({ message: "Each order item must include product, name, and price" });
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalPrice: total || cartItemsTotal || 0,
      deliveryFee: deliveryFee || 0,
      paymentMethod: paymentMethod || "Cash on Delivery",
      paymentStatus: paymentStatus || "Pending",
      status: status ? status.toLowerCase() : "pending",
      customer: customer || {},
    });

    await Cart.findOneAndDelete({ user: req.user._id });

    res.status(201).json({ order });
  } catch (error) {
    res.status(500).json({ message: "Server error while placing order", error: error.message });
  }
};

// GET /api/orders
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Server error while loading orders", error: error.message });
  }
};

// GET /api/orders/returns
export const getMyReturns = async (req, res) => {
  try {
    const returns = await Order.find({ user: req.user._id, status: "returned" }).sort({ createdAt: -1 });
    res.status(200).json({ returns });
  } catch (error) {
    res.status(500).json({ message: "Server error while loading returns", error: error.message });
  }
};

// GET /api/orders/cancellations
export const getMyCancellations = async (req, res) => {
  try {
    const cancellations = await Order.find({ user: req.user._id, status: "cancelled" }).sort({ createdAt: -1 });
    res.status(200).json({ cancellations });
  } catch (error) {
    res.status(500).json({ message: "Server error while loading cancellations", error: error.message });
  }
};