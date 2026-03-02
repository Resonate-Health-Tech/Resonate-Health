import express from "express";
import { generateWorkout, getWorkoutHistory, completeWorkout } from "../controllers/workoutController.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.post("/generate", isAuthenticated, generateWorkout);
router.get("/history", isAuthenticated, getWorkoutHistory);
router.post("/complete", isAuthenticated, completeWorkout);

export default router;
