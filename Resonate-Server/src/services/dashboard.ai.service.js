
import axios from 'axios';
import { DashboardCache } from '../models/DashboardCache.js';
import { logger } from '../utils/memoryLogger.js';

const MICROSERVICE_URL = process.env.MICROSERVICE_URL || 'http://127.0.0.1:10000';
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET;
const TIMEOUT_MS = 30_000;

/**
 * DashboardAIService
 *
 * Calls the microservice /analyze-dashboard endpoint to get AI-generated:
 *   - healthScore (0-100, explained)
 *   - recoveryStatus + narrative
 *   - trainingBalance (aerobic/anaerobic/rest %)
 *   - weeklyNarrative
 *
 * Results are cached in MongoDB for 24h. Falls back to manual values if AI fails.
 */
export class DashboardAIService {
    /**
     * Get cached AI analysis or generate fresh if stale/missing.
     * @param {string} userId
     * @param {object} rawData - { biomarkers, sleepHistory, recentWorkouts, dailyLogs, nutritionSummary }
     * @param {object} userProfile - { age, gender }
     * @returns {{ healthScore, healthScoreBreakdown, recoveryStatus, recoveryNarrative, trainingBalance, weeklyNarrative, cacheHit }}
     */
    async getOrGenerate(userId, rawData, userProfile = {}) {
        try {
            // Try cache first
            const cached = await DashboardCache.findOne({ userId });
            if (cached && cached.healthScore !== null) {
                logger.info('DASHBOARD_AI', 'Cache HIT', { userId });
                return {
                    healthScore: cached.healthScore,
                    healthScoreBreakdown: cached.healthScoreBreakdown,
                    recoveryStatus: cached.recoveryStatus,
                    recoveryNarrative: cached.recoveryNarrative,
                    trainingBalance: cached.trainingBalance,
                    weeklyNarrative: cached.weeklyNarrative,
                    cacheHit: true
                };
            }

            // Cache miss — call AI
            return await this._generateAndStore(userId, rawData, userProfile);

        } catch (error) {
            logger.logError('DASHBOARD_AI', error, { userId });
            return null; // caller will use manual fallback
        }
    }

    async invalidateCache(userId) {
        try {
            await DashboardCache.deleteOne({ userId });
            logger.info('DASHBOARD_AI', 'Cache invalidated', { userId });
        } catch (e) { /* non-critical */ }
    }

    async forceRefresh(userId, rawData, userProfile = {}) {
        await this.invalidateCache(userId);
        return await this._generateAndStore(userId, rawData, userProfile);
    }

    async _generateAndStore(userId, rawData, userProfile) {
        const aiResult = await this._callMicroservice(userId, rawData, userProfile);
        if (!aiResult) return null;

        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await DashboardCache.findOneAndUpdate(
            { userId },
            {
                $set: {
                    userId,
                    healthScore: aiResult.healthScore ?? null,
                    healthScoreBreakdown: aiResult.healthScoreBreakdown ?? null,
                    recoveryStatus: aiResult.recoveryStatus ?? null,
                    recoveryNarrative: aiResult.recoveryNarrative ?? null,
                    trainingBalance: aiResult.trainingBalance ?? null,
                    weeklyNarrative: aiResult.weeklyNarrative ?? null,
                    generatedAt: new Date(),
                    expiresAt,
                }
            },
            { upsert: true, new: true }
        );

        logger.info('DASHBOARD_AI', 'AI analysis cached', { userId });
        return { ...aiResult, cacheHit: false };
    }

    async _callMicroservice(userId, rawData, userProfile) {
        try {
            const response = await axios.post(
                `${MICROSERVICE_URL}/analyze-dashboard`,
                {
                    userId,
                    gender: userProfile.gender || null,
                    age: userProfile.age || null,
                    biomarkers: rawData.biomarkers || {},
                    sleepHistory: rawData.sleepHistory || [],
                    recentWorkouts: rawData.recentWorkouts || [],
                    dailyLogs: rawData.dailyLogs || [],
                    nutritionSummary: rawData.nutritionSummary || {},
                },
                {
                    headers: { 'x-internal-secret': INTERNAL_SECRET, 'Content-Type': 'application/json' },
                    timeout: TIMEOUT_MS,
                }
            );

            return response.data?.analysis || null;
        } catch (error) {
            const msg = error.code === 'ECONNREFUSED'
                ? 'Microservice offline'
                : error.code === 'ECONNABORTED' ? 'Microservice timed out' : error.message;
            logger.warn('DASHBOARD_AI', `AI call failed — ${msg}`, { userId });
            return null;
        }
    }
}

export const dashboardAIService = new DashboardAIService();
