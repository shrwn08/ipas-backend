import express from "express";
import {register} from "../controllers/auth.controllers.js"


const router = express.Router();


router.post("/auth/register", register);



export default router;
