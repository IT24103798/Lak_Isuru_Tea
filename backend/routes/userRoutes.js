import express from "express";

import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPasswordWithOtp,
  changePassword,
  getUsers,
  deleteUser,
  updateUser,
} from "../controllers/userController.js";

import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/profile", protect, getUserProfile)
router.put("/profile", protect, updateUserProfile);

router.post("/forgot-password", forgotPassword);
router.put("/reset-password-otp", resetPasswordWithOtp);

router.put("/change-password", protect, changePassword)

// Admin routes
router.route("/")
  .get(protect, admin, getUsers);

router.route("/:id")
  .delete(protect, admin, deleteUser)
  .put(protect, admin, updateUser);

export default router;