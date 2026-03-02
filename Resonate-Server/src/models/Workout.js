import mongoose from "mongoose";

const workoutSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    inputs: {
        fitnessLevel: String,
        equipment: [String],
        timeAvailable: Number,
        injuries: [String],
        motivationLevel: String,
        workoutTiming: String,
        goalBarriers: [String]
    },
    plan: {
        type: Object,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
    },
    rpe: {
        type: Number,
        min: 1,
        max: 10,
        default: null
    },
    energyLevel: {
        type: Number,
        min: 1,
        max: 10,
        default: null
    },
    notes: {
        type: String,
        default: ''
    },
    durationMinutes: {
        type: Number,
        default: null
    },
    completedAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for fast per-user workout history queries
workoutSchema.index({ user: 1 });

export default mongoose.model("Workout", workoutSchema);
