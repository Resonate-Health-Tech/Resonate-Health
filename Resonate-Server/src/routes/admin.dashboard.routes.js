import express from 'express';
import { getDashboardStats, getRecentInsights, getUserMemoryView } from '../controllers/admin.dashboard.controller.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { isAdmin } from '../middlewares/isAdmin.js';

const router = express.Router();

/**
 * @swagger
 * /api/admin/dashboard/stats:
 *   get:
 *     summary: Get dashboard overview stats
 *     tags: [Admin]
 */
router.get('/stats', isAuthenticated, isAdmin, getDashboardStats);

/**
 * @swagger
 * /api/admin/dashboard/insights/recent:
 *   get:
 *     summary: Get recent generated insights stream
 *     tags: [Admin]
 */
router.get('/insights/recent', isAuthenticated, isAdmin, getRecentInsights);

/**
 * @swagger
 * /api/admin/dashboard/user/:userId:
 *   get:
 *     summary: Get memory timeline for specific user
 *     tags: [Admin]
 */
router.get('/user/:userId', isAuthenticated, isAdmin, getUserMemoryView);

export default router;
