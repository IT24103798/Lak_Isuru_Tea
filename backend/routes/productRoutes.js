import express from "express";
import {
  addProductReview,
  createProduct,
  deleteProduct,
  deleteProductReview,
  getProductById,
  getProducts,
  getReviewEligibility,
  updateProductReview,
  updateProduct,
} from "../controllers/productController.js";
import { admin, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(getProducts).post(protect, admin, createProduct);
router.route("/:id").get(getProductById).put(protect, admin, updateProduct).delete(protect, admin, deleteProduct);
router.get("/:id/review-eligibility", protect, getReviewEligibility);
router.post("/:id/reviews", protect, addProductReview);
router.put("/:id/reviews/:reviewId", protect, updateProductReview);
router.delete("/:id/reviews/:reviewId", protect, deleteProductReview);

export default router;
