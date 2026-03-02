import axios from "axios";
import Workout from "../models/Workout.js";
import { FitnessIngestor } from "../services/ingestors/fitness.ingestor.js";
import { memoryService } from "../services/memory/memoryService.singleton.js";
import { MemoryContextBuilder } from "../services/memory/memoryContext.builder.js";
import { insightsCacheService } from "../services/insights/insights.cache.service.js";

// Shared singleton — reuses one MemoryService connection pool across all requests
const fitnessIngestor = new FitnessIngestor(memoryService);

export const generateWorkout = async (req, res) => {
    try {
        const { fitnessLevel, equipment, timeAvailable, injuries, motivationLevel, workoutTiming, goalBarriers } = req.body;

        if (!fitnessLevel || !timeAvailable) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const MICROSERVICE_URL = process.env.MICROSERVICE_URL || "http://127.0.0.1:10000";

        let age = null, gender = null, weight = null, cyclePhase = null;
        if (req.user) {
            age = req.user.age;
            gender = req.user.gender;
            weight = req.user.weight;
            if (req.user.menstrualProfile) {
                cyclePhase = req.user.menstrualProfile.phase;
            }
        }

        const memoryContextBuilder = new MemoryContextBuilder();
        let memoryContext = {};
        if (req.user) {
            try {
                memoryContext = await memoryContextBuilder.buildMemoryContext(req.user.firebaseUid, 'fitness_plan');
            } catch (err) {
                console.error("Failed to build memory context:", err);
            }
        }

        const response = await axios.post(`${MICROSERVICE_URL}/generate-workout`, {
            fitnessLevel,
            equipment: equipment || [],
            timeAvailable: parseInt(timeAvailable),
            injuries: injuries || [],
            motivationLevel,
            workoutTiming,
            goalBarriers: goalBarriers || [],
            age,
            gender,
            weight,
            cyclePhase,
            memoryContext
        }, {
            headers: {
                "x-internal-secret": process.env.INTERNAL_API_SECRET
            },
            timeout: 60_000, // 60s — prevents a slow microservice from hanging a Node worker indefinitely
        });

        const plan = response.data.plan;

        if (req.user) {
            const newWorkout = new Workout({
                user: req.user._id,
                inputs: { fitnessLevel, equipment, timeAvailable, injuries, motivationLevel, workoutTiming, goalBarriers },
                plan: plan
            });
            await newWorkout.save();
            return res.status(200).json({ status: "success", plan, workoutId: newWorkout._id });
        }

        res.status(200).json({ status: "success", plan });
    } catch (error) {
        console.error("Error generating workout:", error.message);

        if (error.response) {
            return res.status(error.response.status).json({ message: "Error from generator service", detail: error.response.data });
        }
        res.status(500).json({ message: "Failed to generate workout" });
    }
};

export const getWorkoutHistory = async (req, res) => {
    try {
        const workouts = await Workout.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50); // Cap at 50 — prevents returning 500+ documents as one JSON blob

        res.status(200).json({ status: "success", workouts });
    } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).json({ message: "Failed to fetch workout history" });
    }
};

export const completeWorkout = async (req, res) => {
    try {
        const { workoutId, rpe, energyLevel, notes, durationMinutes, actualExercises } = req.body;

        if (!workoutId) {
            return res.status(400).json({ message: "Workout ID is required" });
        }

        const workout = await Workout.findOne({ _id: workoutId, user: req.user._id });

        if (!workout) {
            return res.status(404).json({ message: "Workout not found" });
        }


        workout.status = 'completed';
        workout.completedAt = new Date();
        workout.rpe = rpe;
        workout.energyLevel = energyLevel;
        workout.notes = notes;
        if (durationMinutes) workout.durationMinutes = durationMinutes;

        if (actualExercises) {
            workout.plan.exercises = actualExercises;
        }

        await workout.save();

        try {
            const workoutEvent = {
                name: workout.plan.title || "Workout",
                type: workout.inputs?.fitnessLevel || "General", // or map inputs to type
                totalSets: workout.plan.exercises.reduce((acc, ex) => acc + (ex.sets || 0), 0),
                durationMinutes: durationMinutes || parseInt(workout.plan.duration) || 45,
                rpe: rpe,
                energyLevel: energyLevel,
                caloriesBurned: 300, // Estimate or calc
                exercises: workout.plan.exercises,
                timestamp: new Date().toISOString()
            };

            await fitnessIngestor.processWorkoutEvent(req.user.firebaseUid, workoutEvent);

        } catch (memError) {
            console.error("Memory ingestion failed:", memError.message);
        }

        // Invalidate insights cache — completed workout changes training frequency insights
        insightsCacheService.invalidateCache(req.user.firebaseUid).catch(() => { });

        res.status(200).json({ status: "success", message: "Workout completed", workout });

    } catch (error) {
        console.error("Error completing workout:", error);
        res.status(500).json({ message: "Failed to complete workout" });
    }
};
