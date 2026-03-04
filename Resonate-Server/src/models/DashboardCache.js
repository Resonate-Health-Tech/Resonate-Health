import mongoose from 'mongoose';

/**
 * DashboardCache — persists AI-generated dashboard analysis per user.
 * Same pattern as InsightCache: 24h TTL, invalidated on new health data.
 */
const dashboardCacheSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        // AI-generated fields that replace the manual formulas
        healthScore: { type: Number, default: null },
        healthScoreBreakdown: { type: String, default: null },
        recoveryStatus: { type: String, default: null },
        recoveryNarrative: { type: String, default: null },
        trainingBalance: { type: mongoose.Schema.Types.Mixed, default: null },
        weeklyNarrative: { type: String, default: null },

        generatedAt: { type: Date, default: Date.now },
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
    },
    { timestamps: true }
);

// TTL index — MongoDB auto-deletes the document when expiresAt is reached
dashboardCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const DashboardCache = mongoose.model('DashboardCache', dashboardCacheSchema);
