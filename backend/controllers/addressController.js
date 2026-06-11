import Address from "../models/addressModel.js";

const getUserId = (req) => {
  return req.user?._id || req.user?.id;
};

const addAddress = async (req, res) => {
  try {
    console.log("ADDRESS BODY:", req.body);
    console.log("LOGGED USER:", req.user);

    const {
      fullName,
      phone,
      phoneNumber1,
      phoneNumber2,
      addressType,
      addressLine,
      addressLine1,
      addressLine2,
      landmark,
      province,
      district,
      city,
      postalCode,
      isDefault,
      isDefaultShipping,
      isDefaultBilling,
    } = req.body;

    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated.",
      });
    }

    if (!fullName || !phone || !province || !district || !city || !postalCode) {
      return res.status(400).json({
        message:
          "Full name, phone number, province, district, city, and postcode are required.",
      });
    }

    if (!addressLine && (!addressLine1 || !addressLine2)) {
      return res.status(400).json({
        message: "Address line 1 and address line 2 are required.",
      });
    }

    const finalAddressLine =
      addressLine || `${addressLine1.trim()}, ${addressLine2.trim()}`;

    const makeShippingDefault = Boolean(isDefaultShipping || isDefault);
    const makeBillingDefault = Boolean(isDefaultBilling);

    if (makeShippingDefault) {
      await Address.updateMany(
        { user: userId },
        {
          isDefaultShipping: false,
          isDefault: false,
        }
      );
    }

    if (makeBillingDefault) {
      await Address.updateMany(
        { user: userId },
        {
          isDefaultBilling: false,
        }
      );
    }

    const address = await Address.create({
      user: userId,

      fullName: fullName.trim(),
      phone: phone.trim(),
      phoneNumber1: phoneNumber1 || phone,
      phoneNumber2: phoneNumber2 || "",

      addressType: addressType || "HOME",
      addressLine: finalAddressLine,
      addressLine1: addressLine1 || finalAddressLine,
      addressLine2: addressLine2 || "",
      landmark: landmark || "",

      province,
      district,
      city,
      postalCode,

      isDefault: makeShippingDefault,
      isDefaultShipping: makeShippingDefault,
      isDefaultBilling: makeBillingDefault,
    });

    res.status(201).json({
      message: "Address added successfully",
      address,
    });
  } catch (error) {
    console.log("ADD ADDRESS ERROR:", error);

    res.status(500).json({
      message: "Failed to add address",
      error: error.message,
    });
  }
};

const getMyAddresses = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated.",
      });
    }

    const addresses = await Address.find({ user: userId }).sort({
      createdAt: -1,
    });

    res.json({ addresses });
  } catch (error) {
    console.log("GET ADDRESS ERROR:", error);

    res.status(500).json({
      message: "Failed to load addresses",
      error: error.message,
    });
  }
};

const getDefaultAddress = async (req, res) => {
  try {
    const userId = getUserId(req);

    let address = await Address.findOne({
      user: userId,
      isDefaultShipping: true,
    });

    if (!address) {
      address = await Address.findOne({
        user: userId,
        isDefault: true,
      });
    }

    if (!address) {
      address = await Address.findOne({ user: userId }).sort({
        createdAt: -1,
      });
    }

    res.json({ address });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load default shipping address",
      error: error.message,
    });
  }
};

const getDefaultBillingAddress = async (req, res) => {
  try {
    const userId = getUserId(req);

    let address = await Address.findOne({
      user: userId,
      isDefaultBilling: true,
    });

    if (!address) {
      address = await Address.findOne({ user: userId }).sort({
        createdAt: -1,
      });
    }

    res.json({ address });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load default billing address",
      error: error.message,
    });
  }
};

const updateAddress = async (req, res) => {
  try {
    const userId = getUserId(req);

    const address = await Address.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!address) {
      return res.status(404).json({
        message: "Address not found",
      });
    }

    const {
      fullName,
      phone,
      phoneNumber1,
      phoneNumber2,
      addressType,
      addressLine,
      addressLine1,
      addressLine2,
      landmark,
      province,
      district,
      city,
      postalCode,
      isDefault,
      isDefaultShipping,
      isDefaultBilling,
    } = req.body;

    const makeShippingDefault = Boolean(isDefaultShipping || isDefault);
    const makeBillingDefault = Boolean(isDefaultBilling);

    if (makeShippingDefault) {
      await Address.updateMany(
        { user: userId },
        {
          isDefaultShipping: false,
          isDefault: false,
        }
      );
    }

    if (makeBillingDefault) {
      await Address.updateMany(
        { user: userId },
        {
          isDefaultBilling: false,
        }
      );
    }

    address.fullName = fullName || address.fullName;
    address.phone = phone || address.phone;
    address.phoneNumber1 = phoneNumber1 || phone || address.phoneNumber1;
    address.phoneNumber2 =
      phoneNumber2 !== undefined ? phoneNumber2 : address.phoneNumber2;

    address.addressType = addressType || address.addressType;
    address.addressLine1 = addressLine1 || address.addressLine1;
    address.addressLine2 = addressLine2 || address.addressLine2;
    address.addressLine =
      addressLine ||
      `${address.addressLine1 || ""}, ${address.addressLine2 || ""}`;
    address.landmark = landmark !== undefined ? landmark : address.landmark;

    address.province = province || address.province;
    address.district = district || address.district;
    address.city = city || address.city;
    address.postalCode = postalCode || address.postalCode;

    address.isDefault = makeShippingDefault;
    address.isDefaultShipping = makeShippingDefault;
    address.isDefaultBilling = makeBillingDefault;

    const updatedAddress = await address.save();

    res.json({
      message: "Address updated successfully",
      address: updatedAddress,
    });
  } catch (error) {
    console.log("UPDATE ADDRESS ERROR:", error);

    res.status(500).json({
      message: "Failed to update address",
      error: error.message,
    });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const userId = getUserId(req);

    const address = await Address.findOneAndDelete({
      _id: req.params.id,
      user: userId,
    });

    if (!address) {
      return res.status(404).json({
        message: "Address not found",
      });
    }

    res.json({
      message: "Address deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete address",
      error: error.message,
    });
  }
};

const setDefaultAddress = async (req, res) => {
  try {
    const userId = getUserId(req);

    const address = await Address.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!address) {
      return res.status(404).json({
        message: "Address not found",
      });
    }

    await Address.updateMany(
      { user: userId },
      {
        isDefault: false,
        isDefaultShipping: false,
      }
    );

    address.isDefault = true;
    address.isDefaultShipping = true;

    await address.save();

    res.json({
      message: "Default address updated successfully",
      address,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to set default address",
      error: error.message,
    });
  }
};

const setDefaultShippingAddress = async (req, res) => {
  try {
    const userId = getUserId(req);

    const address = await Address.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!address) {
      return res.status(404).json({
        message: "Address not found",
      });
    }

    await Address.updateMany(
      { user: userId },
      {
        isDefaultShipping: false,
        isDefault: false,
      }
    );

    address.isDefaultShipping = true;
    address.isDefault = true;

    await address.save();

    res.json({
      message: "Default shipping address updated successfully",
      address,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to set default shipping address",
      error: error.message,
    });
  }
};

const setDefaultBillingAddress = async (req, res) => {
  try {
    const userId = getUserId(req);

    const address = await Address.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!address) {
      return res.status(404).json({
        message: "Address not found",
      });
    }

    await Address.updateMany(
      { user: userId },
      {
        isDefaultBilling: false,
      }
    );

    address.isDefaultBilling = true;

    await address.save();

    res.json({
      message: "Default billing address updated successfully",
      address,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to set default billing address",
      error: error.message,
    });
  }
};

export {
  addAddress,
  getMyAddresses,
  getDefaultAddress,
  getDefaultBillingAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  setDefaultShippingAddress,
  setDefaultBillingAddress,
};