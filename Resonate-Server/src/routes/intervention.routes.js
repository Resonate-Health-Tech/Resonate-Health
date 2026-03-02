import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import {
    createIntervention,
    getInterventions,
    getActiveInterventions,
    stopIntervention,
    updateIntervention,
    recordOutcome,
    getInterventionAnalysis,
    suggestInterventions
} from "../controllers/intervention.controller.js";

const router = express.Router();

router.post("/", isAuthenticated, createIntervention);
router.get("/active", isAuthenticated, getActiveInterventions);
router.get("/", isAuthenticated, getInterventions);

router.post("/:id/outcome", isAuthenticated, recordOutcome);
router.get("/:id/analysis", isAuthenticated, getInterventionAnalysis);


router.post("/suggest", isAuthenticated, suggestInterventions);
router.patch("/:id/stop", isAuthenticated, stopIntervention);
router.put("/:id", isAuthenticated, updateIntervention);

export default router;
