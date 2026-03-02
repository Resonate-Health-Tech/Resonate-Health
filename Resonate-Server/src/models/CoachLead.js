import mongoose from "mongoose";

const coachLeadSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      default: null,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    goal: {
  type: [String],
  required: true,
  validate: {
    validator: function (arr) {
      return Array.isArray(arr) && arr.length > 0;
    },
    message: "At least one goal is required",
  },
},


    source: {
      type: String,
      default: "get_coach_form",
    },

    status: {
      type: String,
      enum: ["new", "contacted", "converted", "rejected"],
      default: "new",
    },
  },
  { timestamps: true }
);

export const CoachLead = mongoose.model("CoachLead", coachLeadSchema);
