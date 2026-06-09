import express from "express";

import {
  addAddress,
  getMyAddresses,
  getDefaultAddress,
  getDefaultBillingAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  setDefaultShippingAddress,
  setDefaultBillingAddress,
} from "../controllers/addressController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
  @route   POST /api/addresses
  @desc    Add new address
  @access  Private
*/
router.post("/", protect, addAddress);

/*
  @route   GET /api/addresses
  @desc    Get all logged-in user's addresses
  @access  Private
*/
router.get("/", protect, getMyAddresses);

/*
  @route   GET /api/addresses/default
  @desc    Get default shipping address
  @access  Private
*/
router.get("/default", protect, getDefaultAddress);

/*
  @route   GET /api/addresses/default-billing
  @desc    Get default billing address
  @access  Private
*/
router.get("/default-billing", protect, getDefaultBillingAddress);

/*
  @route   PUT /api/addresses/:id/default
  @desc    Set normal/default shipping address
  @access  Private
*/
router.put("/:id/default", protect, setDefaultAddress);

/*
  @route   PUT /api/addresses/:id/default-shipping
  @desc    Set default shipping address
  @access  Private
*/
router.put("/:id/default-shipping", protect, setDefaultShippingAddress);

/*
  @route   PUT /api/addresses/:id/default-billing
  @desc    Set default billing address
  @access  Private
*/
router.put("/:id/default-billing", protect, setDefaultBillingAddress);

/*
  @route   PUT /api/addresses/:id
  @desc    Update address
  @access  Private
*/
router.put("/:id", protect, updateAddress);

/*
  @route   DELETE /api/addresses/:id
  @desc    Delete address
  @access  Private
*/
router.delete("/:id", protect, deleteAddress);

export default router;