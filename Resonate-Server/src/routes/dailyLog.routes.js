import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { createOrUpdateDailyLog, getDailyLogs, getWeeklyLogs } from "../controllers/dailyLog.controller.js";
import { validateDailyLog } from "../validators/dailyLog.validator.js";

const router = express.Router();

router.post("/", isAuthenticated, validateDailyLog, createOrUpdateDailyLog);
router.get("/weekly", isAuthenticated, getWeeklyLogs);
router.get("/", isAuthenticated, getDailyLogs);

export default router;
