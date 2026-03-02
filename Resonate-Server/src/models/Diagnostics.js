import mongoose from "mongoose";

const biomarkerSchema = new mongoose.Schema({
  value: { type: Number, default: null },
  isAvailable: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ["good", "bad", "unavailable", "unknown"],
    default: "good"
  },
  unit: { type: String, default: null },
  category: { type: String, default: null },
  reason: { type: String, default: null },
  categoryLabel: { type: String, default: null }
}, { _id: false });

const diagnosticsSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    pdfUrl: { type: String, required: true },

    biomarkers: {
      type: Map,
      of: biomarkerSchema,
      default: {}
    },

    biomarkersByCategory: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    category: {
      type: String,
      enum: ["blood", "urine", "bca", "cgm", "other"],
      default: "blood"
    },

    status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" }
  },
  { timestamps: true }
);

// Compound index: fast per-user history queries sorted by most recent first
diagnosticsSchema.index({ userId: 1, createdAt: -1 });

export const Diagnostics = mongoose.model("Diagnostics", diagnosticsSchema);
