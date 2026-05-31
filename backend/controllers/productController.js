import Product from "../models/Product.js";

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
    const products = await Product.find({}).sort({ createdAt: -1 });

    res.status(200).json({ products });
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
      price: Number(req.body.price),
      stock: Number(req.body.stock),
      image: req.body.image,
      description: req.body.description,
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
    product.price = Number(req.body.price);
    product.stock = Number(req.body.stock);
    product.image = req.body.image;
    product.description = req.body.description;

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
    const { name, rating, comment } = req.body;

    if (!name || !rating || !comment) {
      return res.status(400).json({ message: "Please fill all review fields" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.reviews.push({
      name,
      rating: Number(rating),
      comment,
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
