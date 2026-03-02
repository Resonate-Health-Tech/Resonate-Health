import mongoose from "mongoose";

const dailyLogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        date: {
            type: Date,
            required: true,
            default: Date.now,
        },
        energyLevel: {
            type: Number,
            min: 1,
            max: 10,
        },
        sleepQuality: {
            type: Number,
            min: 1,
            max: 10,
        },
        stressLevel: {
            type: Number,
            min: 1,
            max: 10,
        },
        mood: {
            type: String,
            trim: true,
        },
        symptoms: [
            {
                type: String,
                trim: true,
            },
        ],
        notes: {
            type: String,
        },
    },
    { timestamps: true }
);

// Ensure one log per user per day is likely a good constraint, but for now we'll handle uniqueness in logic or compound index if needed.
// unique compound index for user + date (normalized to day) could be added later.

// Index for fast per-user log retrieval, most recent first
dailyLogSchema.index({ user: 1, date: -1 });

export const DailyLog = mongoose.model("DailyLog", dailyLogSchema);
