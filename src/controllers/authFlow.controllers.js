import crypto from "crypto";
import bcrypt from "bcryptjs";
import Jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import dotenv from "dotenv";
dotenv.config();

const CODE_MINUTES = 5;
const RESEND_SECONDS = 60;
const MAX_ATTEMPTS = 5;
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

const genericMessage =
  "If this email belongs to an admin, a password has been sent to it.";

const resetSecret = () => `${process.env.JWT_SECRET}:password-change`;

const generateTempPassword = (length = 10) =>
  Array.from({ length }, () => CHARS[crypto.randomInt(CHARS.length)]).join("");

export const requestCode = async (req, res) => {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Enter your email" });
    }

    const user = await User.findOne({ email }).select("+tempPasswordSentAt");

    const tooSoon =
      user?.tempPasswordSentAt &&
      Date.now() - user.tempPasswordSentAt.getTime() < RESEND_SECONDS * 1000;

    if (!user || tooSoon) {
      return res.status(200).json({ success: true, message: genericMessage });
    }

    const tempPassword = generateTempPassword();

    await User.updateOne(
      { _id: user._id },
      {
        $Set: {
          tempPassword: await bcrypt.hash(tempPassword, 10),
          tempPasswordExpires: new Date(Date.now() + CODE_MINUTES * 60 * 1000),
          tempPasswordAttempts: 0,
          tempPasswordSentAt: new Date(),
        },
      },
    );

    await sendEmail({
      to: user.email,
      subject: "Your IPAS dashboard sign-in password",
      text: `Your temporary password is ${tempPassword}. \n \n It works once and expires in ${CODE_MINUTES} minutes. Upper and lower case matter. \n \n if you didn't ask for this, ignore this email.`,
      html: `<p>Your temporary password is:</p><p style="font-size:20px;font-family:monospace;letter-spacing:1px"><strong>${tempPassword}</strong></p><p>It works once and expires in ${CODE_MINUTES} minutes. Upper and lower case matter.</p><p>If you didn't ask for this, ignore this email.</p>`,
    });

    return res.status(200).json({ success: true, message: genericMessage });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      suceess: false,
      message: "Could not send the email. Try again in a moment.",
    });
  }
};

export const verifyCode = async (req, res) => {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();
    const code = String(req.body.code || "").trim();

    if (!email || !code) {
      return res
        .status(400)
        .json({ success: false, message: "Enter the password from the email" });
    }

    const user = await User.findOne({ email }).select(
      "+tempPasswprd +tempPasswordExpires +tempPasswordAttempts",
    );

    const invalid = () => {
      res
        .status(401)
        .json({ success: false, message: "Invalid or expired password" });
    };

    if (
      !user ||
      !user.tempPassword ||
      !user.tempPasswordExpires ||
      user.tempPasswordExpires < new Date()
    ) {
      return invalid();
    }

    if (user.tempPasswordAttempts >= MAX_ATTEMPTS) {
      return res.status(429).json({
        success: false,
        message: "Too many wrong attemps. GO back and request a new password",
      });
    }

    const match = await bcrypt.compare(code, user.tempPassword);

    if (!match) {
      await User.updateOne(
        { _id: user._id },
        { $inc: { tempPasswordAttempts: 1 } },
      );
      return invalid();
    }

    await User.updateOne(
      { _id: user._id },
      {
        $unset: { tempPassword: 1, tempPasswordExpires: 1 },
        $set: { tempPasswordAttempts: 0 },
      },
    );

    const resetToken = Jwt.sign(
      { id: user._id, purpose: "password-change" },
      resetSecret(),
      { expiresIn: "10m" },
    );

    return res.status(200).json({ success: true, resetToken });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Could not verify the password. Try again in a moment.",
    });
  }
};

export const setPassword = async (req, res) => {
  try {
    const { resetToken, password } = req.body;

    let payload;
    try {
      payload = Jwt.verify(String(resetToken || ""), resetSecret());
    } catch {
      return res.status(401).json({
        success: false,
        message: "This step expired. Cancel and request a new password.",
      });
    }

    if (payload.purpose !== "password-change") {
      return res
        .status(401)
        .json({ success: false, message: "Invalid request." });
    }

    const user = await User.findById(payload.id).select("+password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid request." });
    }

    user.password = password;
    //lastLogin recorded when the new password is saved
    user.lastLogin = new Date();
    await user.save();

    const token = Jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({ success: true, token, user });
  } catch (error) {
    if (error.name === "ValidationError") {
      const firstError =
        Object.values(error.errors)[0]?.message || error.message;
      return res.status(400).json({ success: false, message: firstError });
    }

    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
