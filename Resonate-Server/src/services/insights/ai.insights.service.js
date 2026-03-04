
import axios from 'axios';
import { logger } from '../../utils/memoryLogger.js';

const MICROSERVICE_URL = process.env.MICROSERVICE_URL || 'http://127.0.0.1:10000';
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET;
const TIMEOUT_MS = 30_000; // 30s — GPT can be slow on first call

/**
 * AIInsightsService
 *
 * Calls the Python microservice /generate-insights endpoint to generate
 * AI-powered, personalised health insights from the user's memory context.
 *
 * Falls back gracefully to null if the microservice is unreachable or errors —
 * the InsightsEngine will then run the rule-based fallback.
 */
export class AIInsightsService {
    /**
     * Call AI to generate insights.
     * @param {string} userId
     * @param {object} memoryContext - Built by MemoryContextBuilder
     * @param {object} userProfile - Optional { age, gender }
     * @returns {Array|null} Array of insight objects, or null if AI call failed
     */
    async generate(userId, memoryContext, userProfile = {}) {
        try {
            logger.info('AI_INSIGHTS', 'Calling microservice for AI insights', { userId });

            const response = await axios.post(
                `${MICROSERVICE_URL}/generate-insights`,
                {
                    userId,
                    memoryContext,
                    age: userProfile.age || null,
                    gender: userProfile.gender || null,
                },
                {
                    headers: {
                        'x-internal-secret': INTERNAL_SECRET,
                        'Content-Type': 'application/json',
                    },
                    timeout: TIMEOUT_MS,
                }
            );

            const insights = response.data?.insights;

            if (!Array.isArray(insights)) {
                logger.warn('AI_INSIGHTS', 'Microservice returned unexpected shape', {
                    userId,
                    received: JSON.stringify(response.data).slice(0, 200)
                });
                return null;
            }

            logger.info('AI_INSIGHTS', 'AI insights received', { userId, count: insights.length });
            return insights;

        } catch (error) {
            const isTimeout = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';
            const isOffline = error.code === 'ECONNREFUSED';

            if (isOffline) {
                logger.warn('AI_INSIGHTS', 'Microservice is offline — falling back to rule engine', { userId });
            } else if (isTimeout) {
                logger.warn('AI_INSIGHTS', 'Microservice timed out — falling back to rule engine', { userId });
            } else {
                logger.logError('AI_INSIGHTS', error, { userId, context: 'AI insights generation' });
            }

            return null; // Signal to caller: fall back to rules
        }
    }
}

// Singleton — instantiated once, reused across requests
export const aiInsightsService = new AIInsightsService();
