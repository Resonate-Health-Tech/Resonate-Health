import { MemoryService } from '../services/memory.service.js';
import { logger } from '../utils/memoryLogger.js';
import { User } from '../models/User.js';

const memoryService = new MemoryService();

const looksLikeObjectId = (value) => /^[a-fA-F0-9]{24}$/.test(value || '');

const resolveMemoryUser = async (identifier) => {
    if (!identifier) return null;

    let user = await User.findOne({ firebaseUid: identifier }).select('_id firebaseUid email');
    if (user) return user;

    if (looksLikeObjectId(identifier)) {
        user = await User.findById(identifier).select('_id firebaseUid email');
        if (user) return user;
    }

    user = await User.findOne({ email: identifier }).select('_id firebaseUid email');
    return user || null;
};

/**
 * GET /api/admin/dashboard/stats
 * Returns global memory statistics
 */
export const getDashboardStats = async (req, res) => {
    try {
        // Since Mem0 doesn't have a direct "count all" API easily accessible for all users without iterating,
        // we might mock some global stats or fetch recent usage if stored in DB.
        // For now, we will return a placeholder or specific tracked stats if available.
        // In a real scenario, we'd query our own DB where we might mirror memory metadata.

        // CHECK: specific user count or memory count might need a custom DB query if we are storing local copies.
        // Assuming we rely purely on Mem0, getting global stats is hard without an aggregation endpoint.
        // We will return mock-ish data or data from our local logs if possible.

        res.status(200).json({
            success: true,
            stats: {
                total_memories: "N/A (Mem0 Aggregation Pending)",
                active_users_with_memory: "N/A",
                system_status: "Healthy",
                last_updated: new Date().toISOString()
            }
        });
    } catch (error) {
        logger.logError('ADMIN_DASHBOARD', error);
        res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
};

/**
 * GET /api/admin/dashboard/user/:userId
 * Returns memory timeline for a specific user
 */
export const getUserMemoryView = async (req, res) => {
    try {
        const { userId: requestedUserId } = req.params;
        const user = await resolveMemoryUser(requestedUserId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const memoryUserId = user.firebaseUid;

        // Fetch all memories for the user
        const memories = await memoryService.getAllMemories(memoryUserId);

        res.status(200).json({
            success: true,
            requestedUserId,
            userId: memoryUserId,
            memoryUserId,
            mongoUserId: user._id,
            email: user.email || null,
            count: memories?.count ?? memories?.results?.length ?? 0,
            memories: memories?.results || []
        });
    } catch (error) {
        logger.logError('ADMIN_DASHBOARD', error, { userId: req.params.userId });
        res.status(500).json({ success: false, message: 'Failed to fetch user memories' });
    }
};

/**
 * GET /api/admin/dashboard/insights/recent
 * Returns stream of recent generated insights (mocked or from DB log)
 */
export const getRecentInsights = async (req, res) => {
    try {
        // ideally we store generated insights in a DB table for history.
        // For now, we'll return an empty list or mock to show structure, 
        // as we haven't implemented Insight Persistence yet.

        res.status(200).json({
            success: true,
            insights: []
        });
    } catch (error) {
        logger.logError('ADMIN_DASHBOARD', error);
        res.status(500).json({ success: false, message: 'Failed to fetch insights' });
    }
};
