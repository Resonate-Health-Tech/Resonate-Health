import { CoachLead } from "../models/CoachLead.js";

const PHONE_REGEX = /^\+91[6-9]\d{9}$/;


export const createCoachLead = async (req, res) => {
  try {
    const { name, phone, goal } = req.body;

    if (!name || !phone || !goal) {
      return res.status(400).json({
        message: "Name, phone number, and goal are required",
      });
    }

    if (!PHONE_REGEX.test(phone)) {
      return res.status(400).json({
        message: "Invalid phone number",
      });
    }

    const leadData = {
      name,
      phone,
      goal,
    };

    if (req.user?.firebaseUid) {
      leadData.firebaseUid = req.user.firebaseUid;
    }

    const lead = await CoachLead.create(leadData);

    return res.status(201).json({
      message: "Coach request submitted successfully",
      lead: {
        _id: lead._id,
        firebaseUid: lead.firebaseUid ?? null,
        name: lead.name,
        phone: lead.phone,
        goal: lead.goal,
        status: lead.status,
        createdAt: lead.createdAt,
      },
    });

  } catch (err) {
    console.error("Create coach lead error:", err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
