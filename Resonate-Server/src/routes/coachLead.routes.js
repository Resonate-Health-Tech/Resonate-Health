import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { createCoachLead } from "../controllers/coachLead.controller.js";

const router = express.Router();

router.post("/create", isAuthenticated, createCoachLead);

export default router;
