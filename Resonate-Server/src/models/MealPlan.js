import mongoose from "mongoose";

const mealPlanSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        plan: {
            type: Object, // Stores breakfast, lunch, dinner, snacks, etc.
            required: true
        },
        date: {
            type: Date,
            default: Date.now,
            index: true
        },
        status: {
            type: String,
            enum: ['generated', 'completed', 'skipped'],
            default: 'generated'
        }
    },
    { timestamps: true }
);

// Compound index to ensure one plan per user per day usually, 
// but we might want to allow regeneration so we won't enforce unique strictness here 
// unless we want to strictly limit one per day. 
// For now, we will query by date range.

export const MealPlan = mongoose.model("MealPlan", mealPlanSchema);
