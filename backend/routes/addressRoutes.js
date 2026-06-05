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

router.post("/", protect, addAddress);
router.get("/", protect, getMyAddresses);
router.get("/default", protect, getDefaultAddress);
router.get("/default-billing", protect, getDefaultBillingAddress);

router.put("/:id", protect, updateAddress);
router.delete("/:id", protect, deleteAddress);

router.put("/:id/default", protect, setDefaultAddress);
router.put("/:id/default-shipping", protect, setDefaultShippingAddress);
router.put("/:id/default-billing", protect, setDefaultBillingAddress);

export default router;