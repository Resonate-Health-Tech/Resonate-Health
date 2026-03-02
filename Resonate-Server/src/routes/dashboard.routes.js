import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { getDashboardSummary } from "../controllers/dashboard.controller.js";

const router = express.Router();

// GET /api/dashboard/summary — aggregated per-user dashboard data
router.get("/summary", isAuthenticated, getDashboardSummary);

export default router;
