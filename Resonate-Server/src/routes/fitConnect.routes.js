import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { redirectToGoogleFit, handleGoogleFitCallback, getGoogleFitData, updateStepGoal, getGoogleFitAuthUrl } from "../controllers/fit.controller.js";

const router = express.Router();

router.get("/google", isAuthenticated, redirectToGoogleFit);

router.get("/google/url", isAuthenticated, getGoogleFitAuthUrl);

router.get("/google/callback", handleGoogleFitCallback);

router.get("/getGoogleFitData", isAuthenticated, getGoogleFitData);

router.post("/step-goal", isAuthenticated, updateStepGoal);

export default router;
