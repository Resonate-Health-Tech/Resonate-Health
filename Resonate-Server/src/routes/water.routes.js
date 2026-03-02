import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { getWaterData, logWater, setWaterGoal } from "../controllers/water.controller.js";

const router = express.Router();

router.get("/", isAuthenticated, getWaterData);

router.post("/log", isAuthenticated, logWater);

router.post("/goal", isAuthenticated, setWaterGoal);

export default router;
