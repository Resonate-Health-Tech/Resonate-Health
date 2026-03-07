import { Diagnostics } from "../models/Diagnostics.js";
import { FitnessData } from "../models/FitnessData.js";
import Workout from "../models/Workout.js";
import { FoodLog } from "../models/FoodLog.js";
import { DailyLog } from "../models/DailyLog.js";
import { User } from "../models/User.js";
import { dashboardAIService } from "../services/dashboard.ai.service.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

/**
 * GET /api/dashboard/summary
 *
 * Returns all aggregated data the dashboard needs in a single call:
 * - healthScore (0–100) based on diagnostics biomarker statuses
 * - diagnosticsMeta (flagged count, status dots, last updated)
 * - workoutStats (completed this week, training balance %)
 * - recentActivity (merged Google Fit + AI workouts)
 * - weeklySummary
 */
export const getDashboardSummary = async (req, res) => {
    try {
        const userId = req.user._id;
        const firebaseUid = req.user.firebaseUid;

        // Run all DB queries in parallel
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const [latestDiag, fitnessData, workoutsRaw, recentFoodLogs] = await Promise.all([
            Diagnostics.findOne({ userId: firebaseUid })
                .sort({ createdAt: -1 })
                .select("biomarkers status updatedAt createdAt"),
            FitnessData.findOne({ userId, provider: "google_fit" })
                .select("stepsHistory sleepHistory workoutHistory lastSyncTime"),
            Workout.find({ user: userId })
                .sort({ createdAt: -1 })
                .limit(30)
                .select("plan status rpe energyLevel inputs createdAt completedAt"),
            FoodLog.find({ userId: firebaseUid, date: { $gte: sevenDaysAgo } })
                .select("nutritionalInfo date"),
        ]);

        // ── Diagnostics Meta (for header) ────────────────────────────────────
        let diagnosticsMeta = { score: null, flaggedCount: 0, dots: [], lastUpdated: null };

        if (latestDiag?.biomarkers) {
            // Exclude unavailable biomarkers so they don't drag the score down
            // biomarkers is a Mongoose Map — convert to plain object before iterating
            const bioObj = latestDiag.biomarkers instanceof Map
                ? Object.fromEntries(latestDiag.biomarkers)
                : (latestDiag.biomarkers?.toObject?.() || latestDiag.biomarkers);
            const allMarkers = Object.values(bioObj).filter(m => m && typeof m === "object");
            const markers = allMarkers.filter(m => m.isAvailable !== false);
            const total = markers.length;
            const good = markers.filter(m => m.status === "good").length;
            const bad = markers.filter(m => m.status === "bad").length;
            const flagged = bad;

            diagnosticsMeta = {
                score: total > 0 ? Math.round((good / total) * 100) : null,
                flaggedCount: flagged,
                dots: [
                    ...Array(good).fill("normal"),
                    ...Array(bad).fill("flagged"),
                ].slice(0, 8),
                lastUpdated: latestDiag.createdAt,
            };
        }

        // ── Recent Activity & Stats (for display) ─────────────────────────────
        const recentWorkouts = workoutsRaw.filter(w => new Date(w.createdAt) >= sevenDaysAgo);
        const completedThisWeek = recentWorkouts.filter(w => w.status === "completed").length;
        const totalThisWeek = recentWorkouts.length;

        const aiActivities = workoutsRaw.slice(0, 5).map(w => ({
            source: "ai",
            title: w.plan?.title || "AI Workout",
            desc: `${w.plan?.focus || w.inputs?.fitnessLevel || "Workout"} · ${w.plan?.duration || "—"}`,
            timestamp: w.completedAt || w.createdAt,
            color: "#CADB00",
        }));

        const fitActivities = [];
        if (fitnessData?.workoutHistory) {
            fitnessData.workoutHistory.slice(0, 5).forEach(day => {
                (day.workouts || []).forEach(w => {
                    fitActivities.push({
                        source: "gfit",
                        title: w.activityType || w.name || "Activity",
                        desc: [
                            w.distanceKm ? `${w.distanceKm.toFixed(1)} km` : null,
                            w.durationMinutes ? `${w.durationMinutes} min` : null,
                        ].filter(Boolean).join(" · ") || "Google Fit",
                        timestamp: new Date(day.date),
                        color: "#6B94E8",
                    });
                });
            });
        }

        const recentActivity = [...aiActivities, ...fitActivities]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5);

        const sleepThisWeek = (fitnessData?.sleepHistory || []).slice(-7);
        const avgSleep = sleepThisWeek.length
            ? (sleepThisWeek.reduce((s, d) => s + d.sleepHours, 0) / sleepThisWeek.length).toFixed(1)
            : null;

        // ── Nutritional Summary (manual pre-calc for AI & frontend) ────────
        let nutritionSummary = null;
        if (recentFoodLogs && recentFoodLogs.length > 0) {
            const daySet = new Set(recentFoodLogs.map(l => new Date(l.date).toISOString().split('T')[0]));
            const daysTracked = daySet.size;

            const parseG = (str) => {
                if (!str) return 0;
                const n = parseFloat(String(str).replace(/[^0-9.]/g, ''));
                return isNaN(n) ? 0 : n;
            };

            const totalCal = recentFoodLogs.reduce((s, l) => s + (l.nutritionalInfo?.calories || 0), 0);
            const totalProt = recentFoodLogs.reduce((s, l) => s + parseG(l.nutritionalInfo?.protein), 0);
            const totalCarb = recentFoodLogs.reduce((s, l) => s + parseG(l.nutritionalInfo?.carbohydrates), 0);
            const totalFat = recentFoodLogs.reduce((s, l) => s + parseG(l.nutritionalInfo?.fats), 0);

            nutritionSummary = {
                avgDailyCalories: daysTracked > 0 ? Math.round(totalCal / daysTracked) : 0,
                avgDailyProteinG: daysTracked > 0 ? Math.round(totalProt / daysTracked) : 0,
                avgDailyCarbsG: daysTracked > 0 ? Math.round(totalCarb / daysTracked) : 0,
                avgDailyFatsG: daysTracked > 0 ? Math.round(totalFat / daysTracked) : 0,
                trackingAdherencePct: Math.round((daysTracked / 7) * 100),
                logsThisWeek: daysTracked,
            };
        }

        // ── AI Dashboard Analysis ────────────────────────────────────────────

        // 1. Fetch remaining data needed for AI context
        const [dailyLogs, user] = await Promise.all([
            DailyLog.find({ user: userId, date: { $gte: sevenDaysAgo } }).select("date energyLevel stressLevel sleepQuality mood"),
            User.findById(userId).select("age gender")
        ]);

        const userProfile = { age: user?.age, gender: user?.gender };

        const rawData = {
            biomarkers: latestDiag?.biomarkers || {},
            sleepHistory: (fitnessData?.sleepHistory || []).slice(-7),
            recentWorkouts: recentWorkouts,
            dailyLogs: dailyLogs,
            nutritionSummary: nutritionSummary || {}
        };

        // 2. Get AI Analysis (cached for 24h)
        const aiAnalysis = await dashboardAIService.getOrGenerate(userId, rawData, userProfile);

        // 3. Fallback logic if AI fails
        let healthScore = null;
        let recoveryStatus = null;
        let trainingBalance = null;

        if (aiAnalysis && aiAnalysis.healthScore !== null) {
            healthScore = aiAnalysis.healthScore;
            recoveryStatus = aiAnalysis.recoveryStatus;
            trainingBalance = aiAnalysis.trainingBalance;
        } else {
            // Manual fallback
            const fallbackBioObj = latestDiag?.biomarkers instanceof Map
                ? Object.fromEntries(latestDiag.biomarkers)
                : (latestDiag?.biomarkers?.toObject?.() || latestDiag?.biomarkers || {});
            const markers = Object.values(fallbackBioObj).filter(m => m && typeof m === "object" && m.isAvailable !== false);
            const total = markers.length;
            const good = markers.filter(m => m.status === "good").length;
            const bioScore = total > 0 ? Math.round((good / total) * 100) : null;
            const sleepHours = fitnessData?.sleepHistory?.slice(-1)[0]?.sleepHours || 0;
            const sleepScore = Math.min(Math.round((sleepHours / 9) * 100), 100);
            healthScore = bioScore !== null ? Math.round(bioScore * 0.7 + sleepScore * 0.3) : null;
            if (healthScore !== null) {
                recoveryStatus = healthScore >= 80 ? "Optimal" : healthScore >= 60 ? "Good" : "Low";
            }
        }

        res.json({
            // AI Fields
            healthScore,
            healthScoreBreakdown: aiAnalysis?.healthScoreBreakdown || null,
            recoveryStatus,
            recoveryNarrative: aiAnalysis?.recoveryNarrative || null,
            trainingBalance,
            weeklyNarrative: aiAnalysis?.weeklyNarrative || null,
            aiCacheHit: aiAnalysis?.cacheHit || false,

            // Original Fields
            diagnosticsMeta,
            completedWorkoutsThisWeek: completedThisWeek,
            totalWorkoutsThisWeek: totalThisWeek,
            recentActivity,
            avgSleepThisWeek: avgSleep,
            nutritionSummary,
        });

    } catch (error) {
        console.error("getDashboardSummary error:", error);
        res.status(500).json({ message: "Failed to load dashboard summary" });
    }
};
