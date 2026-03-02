
import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { uploadImage } from "../middlewares/imageUpload.js";
import { analyzeFood, getFoodHistory } from "../controllers/food.controller.js";

const router = express.Router();

router.post("/analyze", isAuthenticated, uploadImage.single("image"), analyzeFood);
router.get("/history", isAuthenticated, getFoodHistory);

export default router;
