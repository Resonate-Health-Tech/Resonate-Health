import { FitnessData } from "../models/FitnessData.js";
import { MemoryService } from "../services/memory.service.js";
import { RecoveryIngestor } from "../services/ingestors/recovery.ingestor.js";

const memoryService = new MemoryService();
const recoveryIngestor = new RecoveryIngestor(memoryService);

export const getWaterData = async (req, res) => {
    try {
        const userId = req.user._id;

        let fitnessData = await FitnessData.findOne({ userId, provider: "resonate" });

        if (!fitnessData) {

            fitnessData = await FitnessData.create({
                userId,
                provider: "resonate",
                waterHistory: []
            });
        }

        const today = new Date().toISOString().split('T')[0];
        const todayEntry = fitnessData.waterHistory.find(w => w.date === today) || { date: today, amountMl: 0, goalMl: 0 };

        res.json({
            today: todayEntry,
            history: fitnessData.waterHistory
        });

    } catch (error) {
        console.error("Get Water Data Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const logWater = async (req, res) => {
    try {
        const userId = req.user._id;
        const { amountMl, date } = req.body;

        const targetDate = date || new Date().toISOString().split('T')[0];
        const amountToAdd = parseInt(amountMl);

        if (isNaN(amountToAdd)) {
            return res.status(400).json({ message: "Invalid amount" });
        }

        let fitnessData = await FitnessData.findOne({ userId, provider: "resonate" });

        if (!fitnessData) {
            fitnessData = new FitnessData({ userId, provider: "resonate", waterHistory: [] });
        }

        let dayEntryIndex = fitnessData.waterHistory.findIndex(w => w.date === targetDate);

        if (dayEntryIndex > -1) {


            fitnessData.waterHistory[dayEntryIndex].amountMl += amountToAdd;
        } else {

            fitnessData.waterHistory.push({
                date: targetDate,
                amountMl: amountToAdd,
                goalMl: 0
            });
        }

        await fitnessData.save();

        const updatedEntry = fitnessData.waterHistory.find(w => w.date === targetDate);

        // Push to Memory Layer (fail-open)
        try {
            const totalForDay = updatedEntry?.amountMl || amountToAdd;
            await recoveryIngestor.processWaterEvent(
                req.user.firebaseUid,
                totalForDay,
                targetDate
            );
        } catch (memError) {
            console.error("Memory ingestion failed for water log:", memError.message);
        }

        res.json(updatedEntry);

    } catch (error) {
        console.error("Log Water Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const setWaterGoal = async (req, res) => {
    try {
        const userId = req.user._id;
        const { goalMl, date } = req.body;

        if (!goalMl) return res.status(400).json({ message: "Goal required" });
        const targetDate = date || new Date().toISOString().split('T')[0];

        let fitnessData = await FitnessData.findOne({ userId, provider: "resonate" });
        if (!fitnessData) {
            fitnessData = new FitnessData({ userId, provider: "resonate", waterHistory: [] });
        }

        let dayEntryIndex = fitnessData.waterHistory.findIndex(w => w.date === targetDate);
        if (dayEntryIndex > -1) {
            fitnessData.waterHistory[dayEntryIndex].goalMl = goalMl;
        } else {
            fitnessData.waterHistory.push({
                date: targetDate,
                amountMl: 0,
                goalMl: goalMl
            });
        }

        await fitnessData.save();
        const updatedEntry = fitnessData.waterHistory.find(w => w.date === targetDate);
        res.json(updatedEntry);

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
