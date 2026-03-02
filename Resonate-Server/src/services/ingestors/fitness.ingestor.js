import { MemoryService } from '../memory.service.js';

export class FitnessIngestor {
    constructor(memoryService) {
        this.memoryService = memoryService || new MemoryService();
    }

    /**
     * Process a workout completion event
     * @param {string} userId - The user ID
     * @param {Object} workout - The workout data object
     * @returns {Promise<Object>} - The result of the memory addition
     */
    async processWorkoutEvent(userId, workout) {
        try {
            const processedData = this._extractWorkoutData(workout);
            const memoryText = this._generateMemoryText(processedData);
            const metadata = this._formatMetadata(processedData);

            return await this.memoryService.addMemory(userId, memoryText, metadata);
        } catch (error) {
            console.error('Error processing workout event:', error);
            throw error;
        }
    }

    /**
     * Extract relevant data from workout object
     * @param {Object} workout 
     * @returns {Object}
     */
    _extractWorkoutData(workout) {
        // Calculate total sets if not provided
        let totalSets = workout.totalSets;
        if (!totalSets && workout.exercises) {
            totalSets = workout.exercises.reduce((acc, ex) => acc + (ex.sets ? ex.sets.length : (ex.setCount || 0)), 0);
        }

        return {
            workoutType: workout.name || workout.type || 'Workout',
            totalSets: totalSets || 0,
            durationMins: workout.durationMinutes || 0,
            rpe: workout.rpe || 0,
            energyLevel: workout.energyLevel || 0,
            caloriesBurned: workout.caloriesBurned || 0,
            exercises: workout.exercises || [],
            timestamp: workout.timestamp || new Date().toISOString()
        };
    }

    /**
     * Generate compact memory text
     * @param {Object} data 
     * @returns {string}
     */
    _generateMemoryText(data) {
        let text = `Completed ${data.workoutType}: ${data.totalSets} sets, ${data.durationMins} mins`;

        if (data.rpe) text += `, RPE ${data.rpe}`;
        if (data.energyLevel) text += `, energy ${data.energyLevel}/10`;

        text += '.';

        if (data.exercises && data.exercises.length > 0) {
            const exerciseSummary = data.exercises.map(ex => {
                const sets = ex.sets ? ex.sets.length : (ex.setCount || 0);
                return `${ex.name} ${sets}x${ex.reps || '?'}`;
            }).join(', ');

            text += ` Exercises: ${exerciseSummary}.`;
        }

        return text;
    }

    /**
     * Format metadata for Mem0
     * @param {Object} data 
     * @returns {Object}
     */
    _formatMetadata(data) {
        return {
            category: 'fitness.training',
            source: 'user_input',
            timestamp: data.timestamp,
            module_specific: {
                workout_type: data.workoutType,
                total_sets: data.totalSets,
                duration_mins: data.durationMins,
                rpe: data.rpe,
                energy_level: data.energyLevel,
                calories_burned: data.caloriesBurned
            }
        };
    }
    async processDailySummary(userId, summaryData) {
        // summaryData: { date, steps, sleepHours, workoutCount }
        const memoryText = `Daily Activity (${summaryData.date}): ${summaryData.steps} steps, ${summaryData.sleepHours}h sleep, ${summaryData.workoutCount} workouts.`;

        const metadata = {
            category: 'fitness.daily_summary',
            source: 'device_sync',
            timestamp: new Date().toISOString(),
            module_specific: {
                date: summaryData.date,
                steps: summaryData.steps,
                sleep_hours: summaryData.sleepHours,
                workout_count: summaryData.workoutCount
            }
        };

        return await this.memoryService.addMemory(userId, memoryText, metadata);
    }
}


