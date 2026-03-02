import mongoose from "mongoose";

const interventionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: ["sleep", "training", "nutrition", "stress", "recovery", "supplement", "supplementation", "diet", "fitness", "lifestyle", "meditation", "other"],
            required: true,
        },
        recommendation: {
            type: String,
            required: true,
            trim: true,
        },
        rationale: {
            type: String,
            required: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        durationDays: {
            type: Number,
            required: true,
        },
        endDate: { // calculated or actual end
            type: Date
        },
        targetMetric: {
            type: String, // e.g., "sleep_hours", "rpe_avg" — optional for AI-generated interventions
        },
        targetValue: {
            type: Number, // optional for AI-generated interventions
        },
        status: {
            type: String,
            enum: ["active", "completed", "abandoned", "discontinued"],
            default: "active",
        },
        discontinuationReason: {
            type: String
        },
        checkInFrequency: { // implementation detail, maybe useful
            type: String,
            enum: ["daily", "weekly"],
            default: "daily"
        },
        outcomes: [{
            date: Date,
            metricValue: Number,
            notes: String
        }]
    },
    { timestamps: true }
);

// Index for fast per-user active intervention lookups
interventionSchema.index({ user: 1, status: 1 });

export const Intervention = mongoose.model("Intervention", interventionSchema);
