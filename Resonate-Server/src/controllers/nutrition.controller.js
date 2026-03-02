import { User } from "../models/User.js";
import { MealPlan } from "../models/MealPlan.js";
import { MemoryContextBuilder } from "../services/memory/memoryContext.builder.js";
import axios from "axios";

const generatePlanFromAI = async (user) => {
    // Calculate age from DOB if available
    let age = user.age; // fallback if it exists
    if (!age && user.dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(user.dateOfBirth);
        age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
    }

    const payload = {
        age: age || 25, // Default age if missing to satisfy validation
        gender: user.gender || "female", // Default gender
        weight: user.weightKg || 60, // Default weight
        height: user.heightCm || 160, // Default height
        goals: user.goals || "Stay Healthy",
        dietType: user.dietType || "vegetarian",
        allergies: user.medicalConditions || [],
        cuisine: "Indian",
        memoryContext: user.memoryContext || {} // injected from controller wrapper
    };

    const microserviceUrl = process.env.MICROSERVICE_URL || "http://localhost:10000";
    const response = await axios.post(`${microserviceUrl}/generate-nutrition`, payload, {
        headers: {
            "x-internal-secret": process.env.INTERNAL_API_SECRET
        },
        timeout: 60_000, // 60s — prevents a slow microservice from hanging a Node worker indefinitely
    });
    return response.data;
};


export const getDailySuggestions = async (req, res) => {
    try {
        const userId = req.user.firebaseUid;
        const user = await User.findOne({ firebaseUid: userId });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check for existing plan for today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const existingPlan = await MealPlan.findOne({
            user: user._id,
            date: { $gte: startOfDay, $lte: endOfDay }
        }).sort({ createdAt: -1 }); // Get latest if multiple

        if (existingPlan) {
            return res.json({ status: "success", plan: existingPlan.plan, date: existingPlan.date });
        }

        // If no plan exists for today, return null/empty 
        // effectively telling frontend to show "Generate" button
        return res.json({ status: "no_plan", message: "No plan generated for today" });

    } catch (error) {
        console.error("Controller Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const generateNewDailySuggestions = async (req, res) => {
    try {
        const userId = req.user.firebaseUid;
        const user = await User.findOne({ firebaseUid: userId });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        try {
            const memoryContextBuilder = new MemoryContextBuilder();
            try {
                const memoryContext = await memoryContextBuilder.buildMemoryContext(userId, 'nutrition_plan');
                user.memoryContext = memoryContext;
            } catch (err) {
                console.error("Failed to build memory context for nutrition:", err);
                user.memoryContext = {};
            }

            const aiResponse = await generatePlanFromAI(user);
            const planData = aiResponse.plan || aiResponse;

            const mealPlan = new MealPlan({
                user: user._id,
                plan: planData,
                date: new Date()
            });

            await mealPlan.save();

            // Also update user for backward compatibility if needed, or just remove later
            user.dailyMealPlan = planData;
            user.mealPlanDate = new Date();
            await user.save();

            return res.json({ status: "success", plan: mealPlan.plan });

        } catch (error) {
            console.error("AI Generation failed:", error.message);
            return res.status(500).json({ message: "Failed to regenerate plan" });
        }

    } catch (error) {
        console.error("Controller Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getMealHistory = async (req, res) => {
    try {
        const userId = req.user.firebaseUid;
        const user = await User.findOne({ firebaseUid: userId });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const history = await MealPlan.find({ user: user._id })
            .sort({ date: -1 })
            .limit(30); // Limit to last 30 entries for now

        return res.json({ status: "success", history });

    } catch (error) {
        console.error("History Error:", error);
        return res.status(500).json({ message: "Failed to fetch history" });
    }
};
