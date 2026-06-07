import express from "express";
import {
  addProductReview,
  createProduct,
  deleteProduct,
  deleteProductReview,
  getProductById,
  getProducts,
  getReviewEligibility,
  updateProductVisibility,
  updateProductReview,
  updateProduct,
} from "../controllers/productController.js";
import { admin, optionalProtect, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(optionalProtect, getProducts).post(protect, admin, createProduct);
router
  .route("/:id")
  .get(optionalProtect, getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);
router.patch("/:id/visibility", protect, admin, updateProductVisibility);
router.get("/:id/review-eligibility", protect, getReviewEligibility);
router.post("/:id/reviews", protect, addProductReview);
router.put("/:id/reviews/:reviewId", protect, updateProductReview);
router.delete("/:id/reviews/:reviewId", protect, deleteProductReview);

export default router;
