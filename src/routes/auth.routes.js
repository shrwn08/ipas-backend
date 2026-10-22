import express from "express";
import {getMe, login} from "../controllers/auth.controllers.js"
import { authLimiter } from "../middlewares/rateLimiter.js";
import { protect } from "../middlewares/protect.js";
import { requestCode, setPassword, verifyCode } from "../controllers/authFlow.controllers.js";



const router = express.Router();


router.post("/login", login);
router.post("/request-code", authLimiter, requestCode);
router.post("/verify-code", authLimiter, verifyCode);
router.post("/set-password", authLimiter, setPassword);
router.get("/me", protect, getMe);



export default router;
