import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
       type: String,
       default: "",
    },

    address: {
      type: String,
      default: "",
    },

    profileImage: {
      type: String,
      default: "",
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    
    resetPasswordOtp: {
      type: String,
    },

    resetPasswordOtpExpire: {
       type: Date,
    },
    provider: {
      type: String,
      enum: ["local", "google", "facebook", "apple"],
      default: "local",
    },

    providerId: {
      type: String,
    },
    
    lastLogin: {
      type: Date,
    },
    
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
