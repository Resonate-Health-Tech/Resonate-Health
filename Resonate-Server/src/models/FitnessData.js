import mongoose from "mongoose";

const stepsSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true
    },
    steps: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const sleepSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true
    },
    sleepHours: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const workoutSchema = new mongoose.Schema(
  {
    type: String,
    durationMinutes: Number,
    caloriesBurned: Number
  },
  { _id: false }
);

const dailyWorkoutSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true
    },
    workouts: {
      type: [workoutSchema],
      default: []
    }
  },
  { _id: false }
);

const waterSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true
    },
    amountMl: {
      type: Number,
      default: 0
    },
    goalMl: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const fitnessDataSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    provider: {
      type: String,
      enum: ["google_fit", "apple_health", "resonate"],
      required: true
    },

    stepsHistory: {
      type: [stepsSchema],
      default: []
    },

    sleepHistory: {
      type: [sleepSchema],
      default: []
    },

    workoutHistory: {
      type: [dailyWorkoutSchema],
      default: []
    },

    waterHistory: {
      type: [waterSchema],
      default: []
    },

    lastSyncTime: {
      type: Date
    },

    stepGoal: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

fitnessDataSchema.index(
  { userId: 1, provider: 1 },
  { unique: true }
);

export const FitnessData = mongoose.model("FitnessData", fitnessDataSchema);
