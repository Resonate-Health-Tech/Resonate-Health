import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { getProfile, updateProfile, getMemories } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile", isAuthenticated, getProfile);
router.put("/profile", isAuthenticated, updateProfile);
router.get("/memories", isAuthenticated, getMemories);

export default router;
