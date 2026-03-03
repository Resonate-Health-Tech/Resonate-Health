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
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Computed age from dateOfBirth — avoids storing a value that goes stale every year
userSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  return Math.floor((Date.now() - new Date(this.dateOfBirth)) / (365.25 * 24 * 3600 * 1000));
});

export const User = mongoose.model("User", userSchema);
