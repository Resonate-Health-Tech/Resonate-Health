import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    email: { type: String },
    name: { type: String },
    phone: { type: String },

    // Role-based access control — replaces single-email ADMIN_EMAIL check
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"]
    },

    fitnessProvider: {
      type: String,
      enum: ["google_fit", "apple_health"],
    },

    fitnessConnected: {
      type: Boolean
    },

    dateOfBirth: Date,
    heightCm: Number,
    weightKg: Number,

    goals: String,

    dietType: {
      type: String,
      enum: ["vegetarian", "eggetarian", "non_vegetarian"],
    },

    googleFit: {
      accessToken: String,
      refreshToken: String,
      expiryDate: Number
    },

    hasMedicalCondition: { type: Boolean, default: false },
    medicalConditions: [String],

    menstrualProfile: {
      cycleLengthDays: Number,
      lastPeriodDate: Date,
      phase: String
    },

    dailyMealPlan: { type: Object, default: null },
    mealPlanDate: { type: Date, default: null }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
