import { DailyLog } from "../models/DailyLog.js";
import { MemoryService } from "../services/memory.service.js";
import { RecoveryIngestor } from "../services/ingestors/recovery.ingestor.js";

const memoryService = new MemoryService();
const recoveryIngestor = new RecoveryIngestor(memoryService);

export const createOrUpdateDailyLog = async (req, res) => {
    try {
        const { date, energyLevel, sleepQuality, stressLevel, mood, symptoms, notes } = req.body;

        const logDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(logDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(logDate);
        endOfDay.setHours(23, 59, 59, 999);

        let dailyLog = await DailyLog.findOne({
            user: req.user._id,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        if (dailyLog) {
            if (energyLevel) dailyLog.energyLevel = energyLevel;
            if (sleepQuality) dailyLog.sleepQuality = sleepQuality;
            if (stressLevel) dailyLog.stressLevel = stressLevel;
            if (mood) dailyLog.mood = mood;
            if (symptoms) dailyLog.symptoms = symptoms;
            if (notes) dailyLog.notes = notes;

            await dailyLog.save();
        } else {
            dailyLog = await DailyLog.create({
                user: req.user._id,
                date: logDate,
                energyLevel,
                sleepQuality,
                stressLevel,
                mood,
                symptoms,
                notes
            });
        }

        // Push to Memory Layer
        try {
            const logData = {
                energyLevel: dailyLog.energyLevel,
                stressLevel: dailyLog.stressLevel,
                sleepQuality: dailyLog.sleepQuality,
                mood: dailyLog.mood,
                symptoms: dailyLog.symptoms,
                notes: dailyLog.notes
            };
            await recoveryIngestor.processDailyLog(req.user.firebaseUid, logData);
        } catch (memError) {
            console.error("Memory ingestion failed for daily log:", memError);
        }

        res.status(200).json({ success: true, dailyLog });
    } catch (error) {
        console.error("Error creating/updating daily log:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};


export const getDailyLogs = async (req, res) => {
    try {
        const logs = await DailyLog.find({ user: req.user._id }).sort({ date: -1 });
        res.status(200).json({ success: true, logs });
    } catch (error) {
        console.error("Error getting daily logs:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

export const getWeeklyLogs = async (req, res) => {
    try {
        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 6); // Include today + 6 previous days = 7 days
        sevenDaysAgo.setHours(0, 0, 0, 0); // Start of that day

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const logs = await DailyLog.find({
            user: req.user._id,
            date: { $gte: sevenDaysAgo, $lte: endOfToday }
        }).sort({ date: 1 });

        res.status(200).json({ success: true, logs });
    } catch (error) {
        console.error("Error getting weekly logs:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};