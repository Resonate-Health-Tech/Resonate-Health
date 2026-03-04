
import { InsightCache } from '../../models/InsightCache.js';
import { InsightsEngine } from './insights.engine.js';
import { logger } from '../../utils/memoryLogger.js';

const insightsEngine = new InsightsEngine();

/**
 * InsightsCacheService
 *
 * Wraps InsightsEngine with a MongoDB-backed cache.
 * Insights are only regenerated when:
 *   1. No cache exists for the user (first visit)
 *   2. The cache has expired (24h TTL via MongoDB index)
 *   3. New health data arrives and invalidateCache() is called
 *   4. The user explicitly requests a refresh via POST /api/insights/refresh
 */
export class InsightsCacheService {
    /**
     * Main entry point — returns cached insights if valid, regenerates if stale/missing.
     * @param {string} userId
     * @returns {{ insights: Array, cacheHit: boolean, generatedAt: string }}
     */
    async getOrGenerateInsights(userId) {
        try {
            // 1. Try serving from cache
            const cached = await InsightCache.findOne({ userId });

            if (cached) {
                logger.info('INSIGHTS_CACHE', 'Cache HIT — serving stored insights', { userId });
                return {
                    insights: cached.insights || [],
                    cacheHit: true,
                    generatedAt: cached.generatedAt.toISOString()
                };
            }

            // 2. Cache miss — generate fresh insights
            logger.info('INSIGHTS_CACHE', 'Cache MISS — generating fresh insights', { userId });
            return await this._generateAndStore(userId);

        } catch (error) {
            logger.logError('INSIGHTS_CACHE', error, { userId });
            // Fallback: generate on the fly without caching (degrade gracefully)
            const insights = await insightsEngine.generateInsights(userId);
            return { insights, cacheHit: false, generatedAt: new Date().toISOString() };
        }
    }

    /**
     * Invalidate the cache for a user (call this after any health data change).
     * The next GET /api/insights/daily will trigger a fresh generation.
     * @param {string} userId
     */
    async invalidateCache(userId) {
        try {
            const result = await InsightCache.deleteOne({ userId });
            if (result.deletedCount > 0) {
                logger.info('INSIGHTS_CACHE', 'Cache invalidated', { userId });
            }
        } catch (error) {
            // Non-critical — log and continue. Data change should not fail because of this.
            logger.logError('INSIGHTS_CACHE', error, { userId, context: 'invalidateCache' });
        }
    }

    /**
     * Force-regenerate insights regardless of cache state, then store.
     * Used by the POST /api/insights/refresh endpoint.
     * @param {string} userId
     * @returns {{ insights: Array, cacheHit: boolean, generatedAt: string }}
     */
    async forceRefresh(userId) {
        await this.invalidateCache(userId);
        logger.info('INSIGHTS_CACHE', 'Force refresh triggered', { userId });
        return await this._generateAndStore(userId);
    }

    /**
     * Internal: run the insights engine and upsert result into MongoDB.
     */
    async _generateAndStore(userId) {
        const generatedAt = new Date();
        const expiresAt = new Date(generatedAt.getTime() + 24 * 60 * 60 * 1000);

        const insights = await insightsEngine.generateInsights(userId);

        // Upsert — create if doesn't exist, replace if it does
        await InsightCache.findOneAndUpdate(
            { userId },
            {
                $set: {
                    userId,
                    insights,
                    generatedAt,
                    expiresAt,
                    dataVersion: generatedAt.toISOString()
                }
            },
            { upsert: true, new: true }
        );

        logger.info('INSIGHTS_CACHE', 'Insights generated and cached', {
            userId,
            count: insights.length
        });

        return {
            insights,
            cacheHit: false,
            generatedAt: generatedAt.toISOString()
        };
    }
}

// Singleton — shared across controller calls (same pattern as other services)
export const insightsCacheService = new InsightsCacheService();
