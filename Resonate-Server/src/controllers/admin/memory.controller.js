import { MemoryService } from "../../services/memory.service.js";
import { User } from "../../models/User.js";

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

export const getUserMemories = async (req, res) => {
    try {
        const { userId: requestedUserId } = req.params;
        const { category, limit = 20, query } = req.query;

        const user = await resolveMemoryUser(requestedUserId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const memoryUserId = user.firebaseUid;

        const filters = {};
        if (category) filters.category = category;

        const results = await memoryService.searchMemory(memoryUserId, query || "*", filters, parseInt(limit));

        return res.json({
            status: "success",
            requestedUserId,
            userId: memoryUserId,
            memoryUserId,
            mongoUserId: user._id,
            email: user.email || null,
            count: results.results.length,
            data: results.results
        });

    } catch (error) {
        console.error("Admin Memory Fetch Error:", error);
        return res.status(500).json({ message: "Failed to fetch memories" });
    }
};

export const deleteMemory = async (req, res) => {
    try {
        const { memoryId } = req.params;

        if (!memoryId) {
            return res.status(400).json({ message: "Memory ID is required" });
        }

        await memoryService.deleteMemory(memoryId);

        return res.json({ status: "success", message: "Memory deleted" });

    } catch (error) {
        console.error("Admin Memory Delete Error:", error);
        return res.status(500).json({ message: "Failed to delete memory" });
    }
};

export const addMemoryManual = async (req, res) => {
    try {
        const { userId: requestedUserId } = req.params;
        const { text, metadata } = req.body;

        if (!text) return res.status(400).json({ message: "Text required" });

        const user = await resolveMemoryUser(requestedUserId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const memoryUserId = user.firebaseUid;

        const safeMetadata = {
            ...(metadata || {}),
            category: metadata?.category || 'user.defined',
            source: metadata?.source || 'admin_manual',
            module_specific: metadata?.module_specific || {}
        };

        await memoryService.addMemory(memoryUserId, text, safeMetadata);

        return res.json({ status: "success", message: "Memory added manually", userId: memoryUserId });

    } catch (error) {
        console.error("Admin Memory Add Error:", error);
        return res.status(500).json({ message: "Failed to add memory" });
    }
};
