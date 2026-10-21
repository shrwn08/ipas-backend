import jwt from "jsonwebtoken";
import User from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { httpError } from "../utils/httpError.js";

export const protect = asyncHandler(async (req, res, next) => {
const header = req.headers.authorization || "";
const token = header.startsWith("Bearer ") ? header.slice(7) : null;

if (!token) throw httpError(401, "You are not signed in.");

let payload;
try {
payload = jwt.verify(token, process.env.JWT_SECRET);
} catch {
throw httpError(401, "Your session expired. Sign in again.");
}

const user = await User.findById(payload.id);
if (!user) throw httpError(401, "Account not found. Sign in again.");

req.user = user;
next();
});