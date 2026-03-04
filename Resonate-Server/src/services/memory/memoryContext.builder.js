import { memoryService } from './memoryService.singleton.js';
import { logger } from '../../utils/memoryLogger.js';

/**
 * Service to build structured memory context for AI generation
 */
export class MemoryContextBuilder {
    constructor() {
        this.memoryService = memoryService; // shared singleton — one connection pool for all callers
    }

    /**
     * Build context pack for specific user intent
     * @param {string} userId - User ID
     * @param {string} intent - One of: 'fitness_plan', 'nutrition_plan', 'insights'
     * @returns {Promise<Object>} Structured memory pack
     */
    async buildMemoryContext(userId, intent) {
        try {

            logger.debug('BUILD_CONTEXT', `Building context for intent: ${intent}`, { userId });

            const context = {
                intent,
                timestamp: new Date().toISOString(),
                key_facts: [],
                recent_events: [],
                intervention_history: [],
                trends: {}
            };

            switch (intent) {
                case 'fitness_plan':
                    await this._enrichFitnessContext(userId, context);
                    break;
                case 'nutrition_plan':
                    await this._enrichNutritionContext(userId, context);
                    break;
                case 'insights':
                    await this._enrichInsightsContext(userId, context);
                    break;
                case 'intervention_suggestion':
                    await this._enrichInterventionContext(userId, context);
                    break;
                default:
                    logger.warn('BUILD_CONTEXT', `Unknown intent: ${intent}`);
            }

            return context;
        } catch (error) {
            logger.logError('BUILD_CONTEXT', error, { userId, intent });
            // Return empty safe structure on error to not block AI generation
            return {
                intent,
                error: true,
                key_facts: [],
                recent_events: [],
                intervention_history: [],
                trends: {}
            };
        }
    }

    /**
     * Enrich context for fitness planning
     * Focus: Recent workouts, recovery status, injuries, program adherence
     */
    async _enrichFitnessContext(userId, context) {
        // 1. Get recent training logs (last 14 days)
        const trainingLogs = await this.memoryService.searchMemory(userId, 'workout training session', {
            category: 'fitness.training'
        }, 5);

        // 2. Get recent recovery status (sleep, stress)
        const recoveryData = await this.memoryService.searchMemory(userId, 'sleep stress recovery energy', {
            category: 'recovery.sleep' // Mem0 might return mixed results for semantic query, but filter helps
        }, 5);

        // Also fetch stress specifically if needed, or rely on semantic search 'recovery' covering it
        const stressData = await this.memoryService.searchMemory(userId, 'stress fatigue soreness', {
            category: 'recovery.stress'
        }, 3);

        // 3. Get active interventions
        const activeInterventions = await this.memoryService.searchMemory(userId, 'active training intervention', {
            category: 'intervention.plan'
        }, 3);

        // 4. Structure the data

        // Process workouts
        if (trainingLogs.results.length > 0) {
            context.recent_events.push(...trainingLogs.results.map(r => r.memory));

            // Extract facts (simplified for now, ideally would process metadata)
            const recentRPE = trainingLogs.results
                .map(r => {
                    const md = typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata;
                    return md?.module_specific?.rpe;
                })
                .filter(Boolean);

            if (recentRPE.length) {
                const avgRpe = recentRPE.reduce((a, b) => a + Number(b), 0) / recentRPE.length;
                context.trends.avg_workout_intensity = Math.round(avgRpe * 10) / 10;
            }
        } else {
            context.key_facts.push("No recent workout history found.");
        }

        // Process recovery
        if (recoveryData.results.length > 0) {
            context.key_facts.push(...recoveryData.results.map(r => `Recovery: ${r.memory}`));

            // Simple trend detection
            const sleepHours = recoveryData.results
                .map(r => {
                    const md = typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata;
                    return md?.module_specific?.sleep_hours;
                })
                .filter(Boolean);

            if (sleepHours.length) {
                const avgSleep = sleepHours.reduce((a, b) => a + b, 0) / sleepHours.length;
                context.trends.avg_sleep_hours = Math.round(avgSleep * 10) / 10;

                if (avgSleep < 6) {
                    context.trends.recovery_status = 'poor';
                    context.key_facts.push("⚠️ Sleep average is below 6 hours (Poor Recovery)");
                } else if (avgSleep > 7.5) {
                    context.trends.recovery_status = 'good';
                } else {
                    context.trends.recovery_status = 'moderate';
                }
            }
        }

        // Process stress
        if (stressData.results.length > 0) {
            context.key_facts.push(...stressData.results.map(r => `Stress: ${r.memory}`));

            const stressScores = stressData.results
                .map(r => {
                    const md = typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata;
                    return md?.module_specific?.stress_score;
                })
                .filter(s => s !== undefined && s !== null);

            if (stressScores.length) {
                const avgStress = stressScores.reduce((a, b) => a + Number(b), 0) / stressScores.length;
                context.trends.avg_stress_score = Math.round(avgStress * 10) / 10;
            }
        }


        // Process interventions
        if (activeInterventions.results.length > 0) {
            context.intervention_history.push(...activeInterventions.results.map(r => r.memory));
        }

        // 5. Get recent daily logs (Mood/Symptoms)
        const dailyLogs = await this.memoryService.searchMemory(userId, 'daily log mood symptoms energy', {
            category: 'recovery.daily_log'
        }, 5);

        if (dailyLogs.results.length > 0) {
            context.recent_events.push(...dailyLogs.results.map(r => `Daily Log: ${r.memory}`));
        }
    }

    /**
     * Enrich context for nutrition planning
     * Focus: Meal patterns, macro adherence, food preferences (implicit), interventions
     */
    async _enrichNutritionContext(userId, context) {
        // 1. Get recent meal logs
        const mealLogs = await this.memoryService.searchMemory(userId, 'meal food intake calories', {
            category: 'nutrition.intake'
        }, 10);

        // 2. Get active nutrition interventions
        const interventions = await this.memoryService.searchMemory(userId, 'nutrition diet intervention', {
            category: 'intervention.plan'
        }, 3);

        // 3. Get recent daily logs (Gut health, energy)
        const dailyLogs = await this.memoryService.searchMemory(userId, 'daily log digestion bloating energy', {
            category: 'recovery.daily_log'
        }, 5);

        // 4. Get insights/trends (if any exist in generic store, or compute from logs)
        // For now, rely on logs

        if (mealLogs.results.length > 0) {
            context.recent_events.push(...mealLogs.results.slice(0, 5).map(r => r.memory));

            const adherenceCount = mealLogs.results.filter(r => {
                const text = r.memory.toLowerCase();
                return text.includes('adhered') && !text.includes('not adhered');
            }).length;
            const adherenceRate = Math.round((adherenceCount / mealLogs.results.length) * 100);

            context.trends.plan_adherence_percent = adherenceRate;
            context.key_facts.push(`Recent plan adherence: ${adherenceRate}%`);
        } else {
            context.key_facts.push("No recent nutrition logs found.");
        }

        if (dailyLogs.results.length > 0) {
            context.recent_events.push(...dailyLogs.results.map(r => `Daily Log: ${r.memory}`));
        }

        if (interventions.results.length > 0) {
            context.intervention_history.push(...interventions.results.map(r => r.memory));
        }
    }

    /**
     * Enrich context for intervention suggestions
     * Focus: Holistic view of health, adherence, and recent issues
     */
    async _enrichInterventionContext(userId, context) {
        // 1. Recent Health Trends (Sleep, Stress, Weight)
        const recoveryData = await this.memoryService.searchMemory(userId, 'sleep stress recovery', {
            category: 'recovery.sleep'
        }, 7);

        // 2. Daily Logs (Symptoms, Mood)
        const dailyLogs = await this.memoryService.searchMemory(userId, 'symptoms mood energy pain', {
            category: 'recovery.daily_log'
        }, 7);

        // 3. Adherence Issues
        const adherenceLogs = await this.memoryService.searchMemory(userId, 'adherence missed skipped cheat', {}, 5);

        // 4. Latest Diagnostics
        const bloodTest = await this.memoryService.searchMemory(userId, 'blood test results', {
            category: 'diagnostics.blood'
        }, 1);

        // 5. Active Interventions (to avoid duplicates)
        const activeInterventions = await this.memoryService.searchMemory(userId, 'active health intervention', {
            category: 'intervention.plan'
        }, 5);

        // --- Structure Data ---

        if (recoveryData.results.length > 0) {
            context.recent_events.push(...recoveryData.results.map(r => `Recovery: ${r.memory}`));
        }

        if (dailyLogs.results.length > 0) {
            context.recent_events.push(...dailyLogs.results.map(r => `Daily Log: ${r.memory}`));
        }

        if (adherenceLogs.results.length > 0) {
            context.key_facts.push(...adherenceLogs.results.map(r => `Adherence Note: ${r.memory}`));
        }

        if (bloodTest.results.length > 0) {
            context.key_facts.push(`Latest Blood Test: ${bloodTest.results[0].memory}`);
        }

        if (activeInterventions.results.length > 0) {
            context.active_interventions = activeInterventions.results.map(r => r.memory);
        }
    }

    /**
     * Enrich context for general insights
     * Focus: Broad trends, changes in diagnostics, correlation between categories
     */
    /**
     * Enrich context for general insights
     * Focus: Broad trends, changes in diagnostics, correlation between categories
     */
    async _enrichInsightsContext(userId, context) {
        // 1. Fetch recent sleep logs (last 7 days)
        const sleepLogs = await this.memoryService.searchMemory(userId, 'sleep duration quality', {
            category: 'recovery.sleep'
        }, 7);

        // 2. Fetch recent workout logs (last 7 days)
        const workoutLogs = await this.memoryService.searchMemory(userId, 'workout training session', {
            category: 'fitness.training'
        }, 7);

        // 3. Fetch recent nutrition logs (last 14 days)
        const nutritionLogs = await this.memoryService.searchMemory(userId, 'meal food intake calories', {
            category: 'nutrition.intake'
        }, 14);

        // 4. Fetch latest diagnostics
        const bloodTest = await this.memoryService.searchMemory(userId, 'blood test results', {
            category: 'diagnostics.blood'
        }, 1);

        const bca = await this.memoryService.searchMemory(userId, 'body composition weight', {
            category: 'diagnostics.bca'
        }, 1);

        // 5. Fetch recent outcomes
        const outcomes = await this.memoryService.searchMemory(userId, 'intervention outcome result', {
            category: 'intervention.outcome'
        }, 5);

        // 6. Fetch active interventions
        const interventions = await this.memoryService.searchMemory(userId, 'active health intervention', {
            category: 'intervention.plan'
        }, 5);

        // --- Process and Attach to Context ---

        // Sleep Analysis
        if (sleepLogs.results.length > 0) {
            context.recent_events.push(...sleepLogs.results.map(r => r.memory));

            const sleepHours = sleepLogs.results
                .map(r => {
                    const md = typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata;
                    return md?.module_specific?.sleep_hours;
                })
                .filter(h => h !== undefined && h !== null);

            if (sleepHours.length) {
                const avgSleep = sleepHours.reduce((a, b) => a + b, 0) / sleepHours.length;
                context.trends.avg_sleep_hours = parseFloat(avgSleep.toFixed(1));
                context.trends.sleep_log_count = sleepHours.length;
            }
        }

        // Workout Analysis
        if (workoutLogs.results.length > 0) {
            context.recent_events.push(...workoutLogs.results.map(r => r.memory));

            const rpeValues = workoutLogs.results
                .map(r => {
                    const md = typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata;
                    return md?.module_specific?.rpe;
                })
                .filter(r => r !== undefined && r !== null);

            if (rpeValues.length) {
                const avgRpe = rpeValues.reduce((a, b) => a + Number(b), 0) / rpeValues.length;
                context.trends.avg_workout_intensity = parseFloat(avgRpe.toFixed(1));
                context.trends.workout_count_last_7d = rpeValues.length;
            }
        }

        // Nutrition Analysis
        if (nutritionLogs.results.length > 0) {
            context.recent_events.push(...nutritionLogs.results.slice(0, 5).map(r => r.memory));

            const compliantCount = nutritionLogs.results.filter(r =>
                (r.metadata?.module_specific?.plan_adherence === true) ||
                (r.memory && r.memory.toLowerCase().includes('adhered'))
            ).length;

            const adherenceRate = (compliantCount / nutritionLogs.results.length) * 100;
            context.trends.nutrition_adherence_percent = Math.round(adherenceRate);
        }

        // Diagnostics
        if (bloodTest.results.length > 0) {
            const latest = bloodTest.results[0];
            context.key_facts.push(`Latest Blood Test: ${latest.memory}`);
            context.trends.latest_blood_test = latest; // Store full object for rules
        }

        if (bca.results.length > 0) {
            const latest = bca.results[0];
            context.key_facts.push(`Latest Body Comp: ${latest.memory}`);

            const weight = latest.metadata?.module_specific?.weight_kg ||
                latest.metadata?.module_specific?.weight;
            if (weight) context.trends.current_weight_kg = weight;
        }

        // 7. Fetch recent daily logs — this is the primary source of user-reported data
        const dailyLogs = await this.memoryService.searchMemory(userId, 'daily log energy stress sleep quality', {
            category: 'recovery.daily_log'
        }, 10);

        if (dailyLogs.results.length > 0) {
            // Extract numeric metrics from daily log metadata
            const energyLevels = [];
            const stressLevels = [];
            const sleepQualityScores = [];
            const waterIntakes = [];

            for (const r of dailyLogs.results) {
                const md = typeof r.metadata === 'string' ? JSON.parse(r.metadata) : r.metadata;
                const ms = md?.module_specific;
                if (!ms) continue;

                if (ms.energy_level !== undefined && ms.energy_level !== null) energyLevels.push(Number(ms.energy_level));
                if (ms.stress_level !== undefined && ms.stress_level !== null) stressLevels.push(Number(ms.stress_level));
                if (ms.sleep_quality !== undefined && ms.sleep_quality !== null) sleepQualityScores.push(Number(ms.sleep_quality));
                if (ms.water_liters !== undefined && ms.water_liters !== null) waterIntakes.push(Number(ms.water_liters));
            }

            if (energyLevels.length > 0) {
                context.trends.avg_energy_level = parseFloat((energyLevels.reduce((a, b) => a + b, 0) / energyLevels.length).toFixed(1));
            }
            if (stressLevels.length > 0) {
                context.trends.avg_stress_level = parseFloat((stressLevels.reduce((a, b) => a + b, 0) / stressLevels.length).toFixed(1));
            }
            if (sleepQualityScores.length > 0) {
                context.trends.avg_sleep_quality = parseFloat((sleepQualityScores.reduce((a, b) => a + b, 0) / sleepQualityScores.length).toFixed(1));
            }
            if (waterIntakes.length > 0) {
                context.trends.avg_water_liters = parseFloat((waterIntakes.reduce((a, b) => a + b, 0) / waterIntakes.length).toFixed(2));
            }
            context.trends.daily_log_count = dailyLogs.results.length;
        }

        // Outcomes & Interventions
        if (outcomes.results.length > 0) {
            context.intervention_history.push(...outcomes.results.map(r => r.memory));
        }

        if (interventions.results.length > 0) {
            context.active_interventions = interventions.results.map(r => ({
                id: r.id,
                text: r.memory,
                metadata: r.metadata
            }));
        }
    }
}
