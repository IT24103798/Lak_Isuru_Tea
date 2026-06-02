import express from "express";

import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPasswordWithOtp,
  verifyResetOtp,
  changePassword,
  socialLogin,
  getUsers,
  deleteUser,
  updateUser,
} from "../controllers/userController.js";

import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/social-login", socialLogin);
router.get("/profile", protect, getUserProfile)
router.put("/profile", protect, updateUserProfile);

router.post("/forgot-password", forgotPassword);
router.put("/reset-password-otp", resetPasswordWithOtp);
router.post("/verify-reset-otp", verifyResetOtp);

router.put("/change-password", protect, changePassword)

// Admin routes
router.route("/")
  .get(protect, admin, getUsers);

router.route("/:id")
  .delete(protect, admin, deleteUser)
  .put(protect, admin, updateUser);

export default router;