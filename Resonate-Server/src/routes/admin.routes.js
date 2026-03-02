import express from "express";
import { getUserMemories, deleteMemory, addMemoryManual } from "../controllers/admin/memory.controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

// Base path: /api/admin/memory

router.get("/:userId", isAuthenticated, isAdmin, getUserMemories);
router.post("/:userId", isAuthenticated, isAdmin, addMemoryManual);
router.delete("/:memoryId", isAuthenticated, isAdmin, deleteMemory);

export default router;
