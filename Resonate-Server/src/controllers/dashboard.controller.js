import { Diagnostics } from "../models/Diagnostics.js";
import { FitnessData } from "../models/FitnessData.js";
import Workout from "../models/Workout.js";
import { FoodLog } from "../models/FoodLog.js";
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
            FoodLog.find({ userId: userId.toString(), date: { $gte: sevenDaysAgo } })
                .select("nutritionalInfo date"),
        ]);

        // ── Health Score ─────────────────────────────────────────────────────
        let healthScore = null;
        let diagnosticsMeta = { score: null, flaggedCount: 0, dots: [], lastUpdated: null };

        if (latestDiag?.biomarkers) {
            // Filter out null / non-object entries — some marker keys are stored as null
            const markers = Object.values(latestDiag.biomarkers).filter(m => m && typeof m === "object");
            const total = markers.length;
            const normal = markers.filter(m => m.status === "normal").length;
            const high = markers.filter(m => m.status === "high").length;
            const low = markers.filter(m => m.status === "low").length;
            const critical = markers.filter(m => m.status === "critical").length;
            const flagged = high + low + critical;

            const bioScore = total > 0 ? Math.round((normal / total) * 100) : null;

            // Sleep score, capped at 100
            const sleepHours = fitnessData?.sleepHistory?.slice(-1)[0]?.sleepHours || 0;
            const sleepScore = Math.min(Math.round((sleepHours / 9) * 100), 100);

            // Composite health score: 70% bio, 30% sleep
            healthScore = bioScore !== null
                ? Math.round(bioScore * 0.7 + sleepScore * 0.3)
                : null;

            // Status dots: green = normal, amber = high/low, red = critical
            const dots = [
                ...Array(normal).fill("normal"),
                ...Array(high + low).fill("flagged"),
                ...Array(critical).fill("critical"),
            ].slice(0, 8); // cap at 8 dots for display

            diagnosticsMeta = {
                score: bioScore,
                flaggedCount: flagged,
                dots,
                lastUpdated: latestDiag.createdAt,
            };
        }

        // ── Training Balance ─────────────────────────────────────────────────
        const recentWorkouts = workoutsRaw.filter(w => new Date(w.createdAt) >= sevenDaysAgo);
        const completedThisWeek = recentWorkouts.filter(w => w.status === "completed").length;
        const totalThisWeek = recentWorkouts.length;

        // Classify by motivationLevel: high → Anaerobic, low → Rest/Recovery, else → Aerobic
        const anaerobic = recentWorkouts.filter(w => w.inputs?.motivationLevel === "high").length;
        const rest = recentWorkouts.filter(w => w.inputs?.motivationLevel === "low").length;
        const aerobic = totalThisWeek - anaerobic - rest;
        const tb = totalThisWeek > 0
            ? {
                aerobic: Math.round((aerobic / totalThisWeek) * 100),
                anaerobic: Math.round((anaerobic / totalThisWeek) * 100),
                rest: Math.round((rest / totalThisWeek) * 100),
            }
            : null; // null = no data yet

        // ── Recent Activity (merge AI workouts + Google Fit workouts) ─────────
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

        // ── Weekly Summary ────────────────────────────────────────────────────
        const sleepThisWeek = (fitnessData?.sleepHistory || []).slice(-7);
        const avgSleep = sleepThisWeek.length
            ? (sleepThisWeek.reduce((s, d) => s + d.sleepHours, 0) / sleepThisWeek.length).toFixed(1)
            : null;

        // Recovery status derived from health score
        let recoveryStatus = null;
        if (healthScore !== null) {
            recoveryStatus = healthScore >= 80 ? "Optimal" : healthScore >= 60 ? "Good" : "Low";
        }

        // ── Nutrition Summary (last 7 days of food logs) ──────────────────────
        let nutritionSummary = null;
        if (recentFoodLogs && recentFoodLogs.length > 0) {
            // Group by day to compute per-day averages and tracking adherence
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

        res.json({
            healthScore,
            diagnosticsMeta,
            trainingBalance: tb,
            completedWorkoutsThisWeek: completedThisWeek,
            totalWorkoutsThisWeek: totalThisWeek,
            recentActivity,
            avgSleepThisWeek: avgSleep,
            recoveryStatus,
            nutritionSummary,
        });

    } catch (error) {
        console.error("getDashboardSummary error:", error);
        res.status(500).json({ message: "Failed to load dashboard summary" });
    }
};
