
import cloudinary from "../config/cloudinary.js";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

import { FoodLog } from "../models/FoodLog.js";
import { NutritionIngestor } from "../services/ingestors/nutrition.ingestor.js";
import { MemoryService } from "../services/memory.service.js";
import { getMealTypeFromTime } from "../utils/timeUtils.js";

const memoryService = new MemoryService();
const nutritionIngestor = new NutritionIngestor(memoryService);

export const analyzeFood = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.file) {
        return res.status(400).json({ message: "Image file required" });
    }

    try {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: "image",
                folder: "resonate-food",
            },
            async (error, result) => {
                if (error) {
                    console.error("Cloudinary upload error:", error);
                    return res.status(500).json({ message: "Image upload failed" });
                }

                const imageUrl = result.secure_url;

                try {

                    const microserviceUrl = process.env.MICROSERVICE_URL || "http://127.0.0.1:8000";
                    const response = await axios.post(`${microserviceUrl}/analyze-food`, {
                        imageUrl,
                        cuisine: req.body.cuisine || "General"
                    }, {
                        headers: {
                            "x-internal-secret": process.env.INTERNAL_API_SECRET
                        }
                    });

                    const aiData = response.data.analysis;

                    const log = await FoodLog.create({
                        userId: req.user.firebaseUid,
                        imageUrl,
                        cuisineContext: req.body.cuisine || "General",

                        foodName: aiData.food_name,
                        description: aiData.description,
                        ingredients: aiData.ingredients,

                        nutritionalInfo: {
                            calories: aiData.nutritional_info.calories,
                            protein: aiData.nutritional_info.protein,
                            carbohydrates: aiData.nutritional_info.carbohydrates,
                            fats: aiData.nutritional_info.fats,
                            fiber: aiData.nutritional_info.fiber
                        },

                        healthRating: aiData.health_rating,
                        suggestions: aiData.suggestions
                    });


                    try {
                        const mealEvent = {
                            type: getMealTypeFromTime(),
                            description: log.foodName,
                            calories: log.nutritionalInfo.calories,
                            macros: {
                                protein: parseInt(log.nutritionalInfo.protein) || 0,
                                carbs: parseInt(log.nutritionalInfo.carbohydrates) || 0,
                                fat: parseInt(log.nutritionalInfo.fats) || 0
                            },
                            adherence: true // Assuming adherence if they are logging it; could be enhanced later
                        };
                        await nutritionIngestor.processMealEvent(req.user.firebaseUid, mealEvent);
                    } catch (memError) {
                        console.error("Memory ingestion failed:", memError.message);
                        // Fail open - do not block response
                    }

                    return res.json({
                        message: "Food analyzed and saved successfully",
                        data: aiData,
                        imageUrl: imageUrl,
                        logId: log._id
                    });

                } catch (apiError) {
                    console.error("Microservice error:", apiError.response?.data || apiError.message);
                    return res.status(500).json({
                        message: "Failed to analyze food image with AI",
                        detail: apiError.response?.data?.detail
                    });
                }
            }
        );

        uploadStream.end(req.file.buffer);

    } catch (err) {
        console.error("Server error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getFoodHistory = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const history = await FoodLog.find({ userId: req.user.firebaseUid })
            .sort({ createdAt: -1 });

        return res.json({
            status: "success",
            history
        });
    } catch (err) {
        console.error("Fetch history error:", err);
        return res.status(500).json({ message: "Failed to fetch food history" });
    }
};
