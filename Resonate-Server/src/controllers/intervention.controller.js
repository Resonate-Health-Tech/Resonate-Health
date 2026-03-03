// ── All imports at the top ─────────────────────────────────────────────────
import { InterventionService } from '../services/intervention.service.js';
import { MemoryService } from '../services/memory.service.js';
import { MemoryContextBuilder } from '../services/memory/memoryContext.builder.js';
import { insightsCacheService } from '../services/insights/insights.cache.service.js';
import { User } from '../models/User.js';
import axios from 'axios';

const memoryService = new MemoryService();
const interventionService = new InterventionService(memoryService);

/**
 * Create a new intervention
 */
export const createIntervention = async (req, res) => {
    try {
        // userId from auth middleware
        const userId = req.user._id;
        const interventionData = req.body;

        const intervention = await interventionService.createIntervention(
            userId,
            interventionData,
            req.user.firebaseUid
        );

        res.status(201).json({ success: true, intervention });
    } catch (error) {
        console.error("Error creating intervention:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * Get active interventions for the current user
 */
export const getActiveInterventions = async (req, res) => {
    try {
        const userId = req.user._id;
        const interventions = await interventionService.getActiveInterventions(userId);

        // Compute compliancePct server-side so the dashboard has a reliable value.
        // Respects checkInFrequency: daily expects one outcome per day, weekly expects one per 7 days.
        const enriched = interventions.map(intervention => {
            const plain = intervention.toObject ? intervention.toObject() : { ...intervention };
            const daysSince = Math.max(1, Math.floor((Date.now() - new Date(plain.startDate)) / 86400000));
            const expected = plain.checkInFrequency === "weekly"
                ? Math.max(1, Math.ceil(daysSince / 7))
                : daysSince;
            plain.compliancePct = Math.min(
                Math.round(((plain.outcomes?.length || 0) / expected) * 100),
                100
            );
            return plain;
        });

        res.status(200).json({ success: true, interventions: enriched });
    } catch (error) {
        console.error("Error fetching active interventions:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * Record an outcome for an intervention
 */
export const recordOutcome = async (req, res) => {
    try {
        const { id } = req.params;
        const outcomeData = req.body;

        const intervention = await interventionService.recordOutcome(
            id,
            outcomeData,
            req.user.firebaseUid
        );

        res.status(200).json({ success: true, intervention });
    } catch (error) {
        console.error("Error recording outcome:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * Get effectiveness analysis (basic)
 */
export const getInterventionAnalysis = async (req, res) => {
    try {
        const { id } = req.params;
        const analysis = await interventionService.analyzeEffectiveness(id);

        if (!analysis) {
            return res.status(404).json({ success: false, message: "Intervention not found or no data" });
        }

        res.status(200).json({ success: true, analysis });
    } catch (error) {
        console.error("Error analyzing intervention:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * Get all interventions
 */
export const getInterventions = async (req, res) => {
    try {
        const userId = req.user._id;
        const interventions = await interventionService.getInterventions(userId);
        res.status(200).json({ success: true, interventions });
    } catch (error) {
        console.error("Error fetching interventions:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * Stop an intervention
 */
export const stopIntervention = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const intervention = await interventionService.stopIntervention(
            id,
            reason,
            req.user.firebaseUid
        );
        // Invalidate insights cache — stopping an intervention changes AI recommendations
        insightsCacheService.invalidateCache(req.user.firebaseUid).catch(() => { });
        res.status(200).json({ success: true, intervention });
    } catch (error) {
        console.error("Error stopping intervention:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * Update an intervention
 */
export const updateIntervention = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const intervention = await interventionService.updateIntervention(id, req.user._id, updates);
        // Invalidate insights cache — updating an intervention changes AI recommendations
        insightsCacheService.invalidateCache(req.user.firebaseUid).catch(() => { });
        res.status(200).json({ success: true, intervention });
    } catch (error) {
        console.error("Error updating intervention:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/**
 * Suggest interventions based on memory context
 */
export const suggestInterventions = async (req, res) => {
    try {
        const userId = req.user.firebaseUid;
        const user = await User.findOne({ firebaseUid: userId });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const memoryContextBuilder = new MemoryContextBuilder();
        const memoryContext = await memoryContextBuilder.buildMemoryContext(userId, 'intervention_suggestion');

        const microserviceUrl = process.env.MICROSERVICE_URL || "http://127.0.0.1:10000";

        // Call microservice
        const response = await axios.post(`${microserviceUrl}/generate-interventions`, {
            userId: user._id,
            age: user.age,
            gender: user.gender,
            memoryContext
        }, {
            headers: {
                "x-internal-secret": process.env.INTERNAL_API_SECRET
            }
        });

        // Expected response: { suggestions: [ { title, description, type, duration, ... } ] }
        const suggestions = response.data.suggestions || [];

        res.status(200).json({ success: true, suggestions, contextUsed: memoryContext });

    } catch (error) {
        console.error("Error suggesting interventions:", error);
        // Fallback if AI fails? Or just return error
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
