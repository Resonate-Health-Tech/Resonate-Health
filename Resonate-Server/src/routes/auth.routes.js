import express from "express";
import { registerUser, loginUser } from "../controllers/auth.controller.js";
import { verifyFirebaseToken } from "../middlewares/firebaseAuth.js";
import { strictRateLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

// strictRateLimiter: 30 requests/minute per IP — prevents brute force & spam
router.post("/register", strictRateLimiter, verifyFirebaseToken, registerUser);
router.post("/login", strictRateLimiter, verifyFirebaseToken, loginUser);

export default router;
