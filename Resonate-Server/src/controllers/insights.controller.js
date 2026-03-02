
import { insightsCacheService } from '../services/insights/insights.cache.service.js';
import { logger } from '../utils/memoryLogger.js';

/**
 * GET /api/insights/daily
 * Returns cached insights for the user. Generates and caches on first call
 * or after cache invalidation (triggered by diagnostics upload / workout save).
 */
export const getDailyInsights = async (req, res) => {
    try {
        const userId = req.user.firebaseUid;
        logger.debug('CONTROLLER', 'Request for daily insights', { userId });

        const { insights, cacheHit, generatedAt } = await insightsCacheService.getOrGenerateInsights(userId);

        return res.status(200).json({
            success: true,
            count: insights.length,
            data: insights,
            cache_hit: cacheHit,
            generated_at: generatedAt
        });

    } catch (error) {
        logger.logError('CONTROLLER', error, { userId: req.user?.firebaseUid });
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve insights',
            error: error.message
        });
    }
};

/**
 * POST /api/insights/refresh
 * Manually force-regenerate insights for the user.
 * Useful for a "Refresh" button on the frontend.
 */
export const refreshInsights = async (req, res) => {
    try {
        const userId = req.user.firebaseUid;
        logger.info('CONTROLLER', 'Manual insights refresh requested', { userId });

        const { insights, generatedAt } = await insightsCacheService.forceRefresh(userId);

        return res.status(200).json({
            success: true,
            regenerated: true,
            count: insights.length,
            data: insights,
            generated_at: generatedAt
        });

    } catch (error) {
        logger.logError('CONTROLLER', error, { userId: req.user?.firebaseUid });
        return res.status(500).json({
            success: false,
            message: 'Failed to refresh insights',
            error: error.message
        });
    }
};

// Dev-only test endpoint
export const testInsights = async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ message: 'Forbidden' });
    }

    const userId = req.query.userId || 'test-user-id';

    try {
        const { insights, cacheHit, generatedAt } = await insightsCacheService.getOrGenerateInsights(userId);
        return res.status(200).json({
            success: true,
            count: insights.length,
            data: insights,
            cache_hit: cacheHit,
            generated_at: generatedAt
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
