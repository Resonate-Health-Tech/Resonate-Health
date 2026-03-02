
import express from 'express';
import { getDailyInsights, refreshInsights, testInsights } from '../controllers/insights.controller.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';

const router = express.Router();

/**
 * @swagger
 * /api/insights/daily:
 *   get:
 *     summary: Get daily health insights (served from cache, regenerated on data change)
 *     tags: [Insights]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of insights with cache metadata
 *       500:
 *         description: Server error
 */
router.get('/daily', isAuthenticated, getDailyInsights);

/**
 * @swagger
 * /api/insights/refresh:
 *   post:
 *     summary: Force-regenerate insights for the authenticated user
 *     tags: [Insights]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fresh insights generated and cached
 *       500:
 *         description: Server error
 */
router.post('/refresh', isAuthenticated, refreshInsights);

// Dev only
if (process.env.NODE_ENV !== 'production') {
    router.get('/test-gen', testInsights);
}

export default router;
