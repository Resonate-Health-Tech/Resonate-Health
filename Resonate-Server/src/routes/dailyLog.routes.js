import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { createOrUpdateDailyLog, getDailyLogs, getWeeklyLogs } from "../controllers/dailyLog.controller.js";

const router = express.Router();

router.post("/", isAuthenticated, createOrUpdateDailyLog);
router.get("/weekly", isAuthenticated, getWeeklyLogs);
router.get("/", isAuthenticated, getDailyLogs);

export default router;
