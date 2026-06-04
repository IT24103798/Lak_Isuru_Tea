import Product from "../models/Product.js";
import Order from "../models/Order.js";

const TOP_SELLING_LIMIT = 4;

const validateProductBody = ({ name, category, price, stock, image, description }) => {
  if (!name || !category || price === undefined || stock === undefined || !image || !description) {
    return "Please fill all product fields";
  }

  if (Number(price) < 0) {
    return "Price cannot be negative";
  }

  if (Number(stock) < 0) {
    return "Stock cannot be negative";
  }

  return null;
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 }).lean();
    const salesTotals = await Order.aggregate([
      { $match: { status: { $nin: ["cancelled", "returned"] } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          soldQuantity: { $sum: "$items.quantity" },
        },
      },
      { $sort: { soldQuantity: -1 } },
    ]);
    const topSellingIds = new Set(
      salesTotals.slice(0, TOP_SELLING_LIMIT).map((item) => item._id?.toString())
    );
    const salesByProductId = new Map(
      salesTotals.map((item) => [item._id?.toString(), item.soldQuantity])
    );
    const productsWithSales = products.map((product) => ({
      ...product,
      soldQuantity: salesByProductId.get(product._id.toString()) || 0,
      isTopSelling: topSellingIds.has(product._id.toString()),
    }));

    res.status(200).json({ products: productsWithSales });
  } catch (error) {
    res.status(500).json({
      message: "Server error while loading products",
      error: error.message,
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ product });
  } catch (error) {
    res.status(500).json({
      message: "Server error while loading product",
      error: error.message,
    });
  }
};

export const createProduct = async (req, res) => {
  try {
    const validationError = validateProductBody(req.body);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const product = await Product.create({
      name: req.body.name,
      category: req.body.category,
      subcategory: req.body.subcategory || "",
      price: Number(req.body.price),
      stock: Number(req.body.stock),
      image: req.body.image,
      description: req.body.description,
      featuredOnHome: Boolean(req.body.featuredOnHome),
    });

    res.status(201).json({
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while adding product",
      error: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const validationError = validateProductBody(req.body);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.name = req.body.name;
    product.category = req.body.category;
    product.subcategory = req.body.subcategory || "";
    product.price = Number(req.body.price);
    product.stock = Number(req.body.stock);
    product.image = req.body.image;
    product.description = req.body.description;
    product.featuredOnHome = Boolean(req.body.featuredOnHome);

    const updatedProduct = await product.save();

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while updating product",
      error: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne();

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Server error while deleting product",
      error: error.message,
    });
  }
};

export const addProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const numericRating = Number(rating);
    const trimmedComment = comment?.trim();

    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5 || !trimmedComment) {
      return res.status(400).json({ message: "Please fill all review fields" });
    }

    if (trimmedComment.length > 500) {
      return res.status(400).json({ message: "Review must be 500 characters or fewer" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const hasPurchased = await Order.exists({
      user: req.user._id,
      "items.product": product._id,
      status: { $nin: ["cancelled", "returned"] },
    });

    if (!hasPurchased) {
      return res.status(403).json({ message: "Only customers who purchased this product can review it" });
    }

    const alreadyReviewed = product.reviews.some(
      (review) => review.user?.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(409).json({ message: "You have already reviewed this product" });
    }

    product.reviews.push({
      user: req.user._id,
      name: req.user.name,
      rating: numericRating,
      comment: trimmedComment,
      verifiedPurchase: true,
    });

    const updatedProduct = await product.save();

    res.status(201).json({
      message: "Review added successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while adding review",
      error: error.message,
    });
  }
};

export const updateProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const numericRating = Number(rating);
    const trimmedComment = comment?.trim();

    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5 || !trimmedComment) {
      return res.status(400).json({ message: "Please fill all review fields" });
    }

    if (trimmedComment.length > 500) {
      return res.status(400).json({ message: "Review must be 500 characters or fewer" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const review = product.reviews.id(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (!review.user || review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only edit your own review" });
    }

    review.rating = numericRating;
    review.comment = trimmedComment;

    const updatedProduct = await product.save();

    res.status(200).json({
      message: "Review updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while updating review",
      error: error.message,
    });
  }
};

export const deleteProductReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const review = product.reviews.id(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (!review.user || review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own review" });
    }

    review.deleteOne();

    const updatedProduct = await product.save();

    res.status(200).json({
      message: "Review deleted successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error while deleting review",
      error: error.message,
    });
  }
};

export const getReviewEligibility = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const hasPurchased = Boolean(
      await Order.exists({
        user: req.user._id,
        "items.product": product._id,
        status: { $nin: ["cancelled", "returned"] },
      })
    );
    const hasReviewed = product.reviews.some(
      (review) => review.user?.toString() === req.user._id.toString()
    );

    res.status(200).json({ canReview: hasPurchased && !hasReviewed, hasPurchased, hasReviewed });
  } catch (error) {
    res.status(500).json({
      message: "Server error while checking review eligibility",
      error: error.message,
    });
  }
};
