import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },

    image: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: function (items) {
          return items.length > 0;
        },
        message: "Order must have at least one item.",
      },
    },

    cartItemsTotal: {
      type: Number,
      required: true,
      default: 0,
    },

    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },

    deliveryFee: {
      type: Number,
      default: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["Cash on Delivery", "Online Payment", "PayHere"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: [
        "Pending",
        "Paid",
        "Processing",
        "Failed",
        "Refund Pending",
        "Cancelled",
      ],
      default: "Pending",
    },

    shippingOption: {
      type: String,
      default: "Standard",
    },

    orderStatus: {
      type: String,
      enum: [
        "To Pay",
        "Processing",
        "To Pack",
        "Packed",
        "To Ship",
        "Shipped",
        "To Receive",
        "On the Way",
        "To Review",
        "Delivered",
        "Cancelled",
      ],
      default: "To Pack",
    },

    customer: {
      fullName: {
        type: String,
        default: "",
        trim: true,
      },

      email: {
        type: String,
        default: "",
        trim: true,
      },

      phone: {
        type: String,
        default: "",
        trim: true,
      },

      phoneNumber1: {
        type: String,
        default: "",
        trim: true,
      },

      phoneNumber2: {
        type: String,
        default: "",
        trim: true,
      },

      addressType: {
        type: String,
        enum: ["Home", "Office", "Other", "HOME", "OFFICE", "OTHER", ""],
        default: "",
      },

      addressLine1: {
        type: String,
        default: "",
        trim: true,
      },

      addressLine2: {
        type: String,
        default: "",
        trim: true,
      },

      landmark: {
        type: String,
        default: "",
        trim: true,
      },

      province: {
        type: String,
        default: "",
        trim: true,
      },

      district: {
        type: String,
        default: "",
        trim: true,
      },

      city: {
        type: String,
        default: "",
        trim: true,
      },

      address: {
        type: String,
        default: "",
        trim: true,
      },

      notes: {
        type: String,
        default: "",
        trim: true,
      },
    },

    payherePaymentId: {
      type: String,
      default: "",
    },

    payhereOrderId: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "packed",
        "shipped",
        "on_the_way",
        "delivered",
        "cancelled",
      ],
      default: "packed",
    },

    cancelReason: {
      type: String,
      default: "",
      trim: true,
    },

    cancelNote: {
      type: String,
      default: "",
      trim: true,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    stockDeducted: {
      type: Boolean,
      default: false,
    },

    packedAt: {
      type: Date,
      default: null,
    },

    shippedAt: {
      type: Date,
      default: null,
    },

    onTheWayAt: {
      type: Date,
      default: null,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ user: 1, status: 1, createdAt: -1 });
orderSchema.index({ status: 1, "items.product": 1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
