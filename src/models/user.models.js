import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const passwordRegex =
  /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*()_+=\-\[\]{};:'"\\,.<>\/|?]).{8,}$/;

//  added tempPassword, tempPasswordExpires, tempPasswordAttempts and tempPasswordSentAt fields
const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
      select: false,
      validate: {
        validator: (value) => passwordRegex.test(value),
        message:
          "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number and a special character",
      },
    },
    tempPassword: { type: String, select: false },
    tempPasswordExpires: { type: Date, select: false },
    tempPasswordAttempts: { type: Number, default: 0, select: false },
    tempPasswordSentAt: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default mongoose.model("User", userSchema);