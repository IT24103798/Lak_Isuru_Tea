import Cart from "../models/Cart.js";

// GET /api/cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    res.status(200).json({ cart: cart ? cart.items : [] });
  } catch (error) {
    res.status(500).json({ message: "Server error while loading cart", error: error.message });
  }
};

// POST /api/cart
export const addToCart = async (req, res) => {
  try {
    const { productId, name, price, quantity, image } = req.body;

    if (!productId || !name || !price) {
      return res.status(400).json({ message: "Product details are required" });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [{ productId, name, price, quantity: quantity || 1, image }],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.productId.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity += quantity || 1;
      } else {
        cart.items.push({ productId, name, price, quantity: quantity || 1, image });
      }

      await cart.save();
    }

    res.status(200).json({ message: "Item added to cart", cart: cart.items });
  } catch (error) {
    res.status(500).json({ message: "Server error while adding to cart", error: error.message });
  }
};

// PUT /api/cart
export const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find((i) => i.productId.toString() === productId);

    if (!item) return res.status(404).json({ message: "Item not found in cart" });

    item.quantity = quantity;
    await cart.save();

    res.status(200).json({ message: "Cart updated", cart: cart.items });
  } catch (error) {
    res.status(500).json({ message: "Server error while updating cart", error: error.message });
  }
};

// DELETE /api/cart/:productId
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter((i) => i.productId.toString() !== productId);
    await cart.save();

    res.status(200).json({ message: "Item removed from cart", cart: cart.items });
  } catch (error) {
    res.status(500).json({ message: "Server error while removing from cart", error: error.message });
  }
};

// DELETE /api/cart
export const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.status(200).json({ message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ message: "Server error while clearing cart", error: error.message });
  }
};