import { User } from "../models/User.js";
import { memoryService } from "../services/memory/memoryService.singleton.js";

// Use shared singleton — no separate connection pool per controller

export const getProfile = async (req, res) => {
  try {
    if (!req.user) return res.status(404).json({ message: "User not found" });

    return res.json({ user: req.user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      name,
      gender,
      dateOfBirth,
      heightCm,
      weightKg,
      height, // legacy alias
      weight, // legacy alias
      dietType,
      goals,
      hasMedicalCondition,
      medicalConditions,
      phone,
      menstrualProfile
    } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (gender !== undefined) updates.gender = gender;
    if (dietType !== undefined) updates.dietType = dietType;
    if (goals !== undefined) updates.goals = goals;
    if (hasMedicalCondition !== undefined) updates.hasMedicalCondition = hasMedicalCondition;
    if (medicalConditions !== undefined) updates.medicalConditions = medicalConditions;
    if (phone !== undefined) updates.phone = phone;
    if (menstrualProfile !== undefined) updates.menstrualProfile = menstrualProfile;

    if (dateOfBirth !== undefined) {
      updates.dateOfBirth = dateOfBirth || null;
    }

    const resolvedHeightCm = heightCm ?? height;
    if (resolvedHeightCm !== undefined) {
      updates.heightCm = resolvedHeightCm === null || resolvedHeightCm === "" ? null : Number(resolvedHeightCm);
    }

    const resolvedWeightKg = weightKg ?? weight;
    if (resolvedWeightKg !== undefined) {
      updates.weightKg = resolvedWeightKg === null || resolvedWeightKg === "" ? null : Number(resolvedWeightKg);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    return res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getMemories = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { category } = req.query;

    // Map client tab names to Mem0 category *prefixes*.
    // Using the broad prefix (e.g. 'fitness') rather than a single subcategory
    // (e.g. 'fitness.training') means all subcategories are included:
    //   'workout'      -> matches fitness.training, fitness.workout, etc.
    //   'diet'         -> matches nutrition.intake, nutrition.plan, etc.
    //   'health'       -> matches diagnostics.blood, diagnostics.bca, etc.
    //   'recovery'     -> matches recovery.sleep, recovery.stress, recovery.daily_log, etc.
    //   'intervention' -> matches intervention.plan, intervention.outcome, etc.
    const categoryMap = {
      'workout': 'fitness',
      'diet': 'nutrition',
      'health': 'diagnostics',
      'recovery': 'recovery',
      'intervention': 'intervention',
    };

    const mappedCategory = categoryMap[category] || category || undefined;

    console.log(`[getMemories] Fetching memories for user ${req.user.firebaseUid}. Category: ${category} -> ${mappedCategory}`);

    const memories = await memoryService.getAllMemories(req.user.firebaseUid, { category: mappedCategory });

    return res.json(memories);
  } catch (error) {
    console.error("Get Memories Error:", error);
    return res.status(500).json({ message: "Failed to fetch memories" });
  }
};
