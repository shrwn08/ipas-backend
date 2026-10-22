import User from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { httpError } from "../utils/httpError.js";
dotenv.config();

export const login = asyncHandler(async (req, res) => {
  const email = String(req.body.email || "")
    .trim()
    .toLowerCase();
  const password = String(req.body.password || "");

  if (!email || !password) {
    throw httpError(400, "Email and password are required.");
  }

  const user = await User.findOne({ email }).select("+password");

  const match = user ? await bcrypt.compare(password, user.password) : false;

  if (!match) throw httpError(401, "Invalid email or password.");

  await User.updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.status(200).json({ success: true, token, user });
});

export const getMe = (req, res) => {
res.status(200).json({ success: true, user: req.user });
};
