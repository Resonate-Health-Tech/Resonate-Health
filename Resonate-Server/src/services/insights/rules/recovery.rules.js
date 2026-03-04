
/**
 * Recovery Rules for Insights Engine
 * Focus: Sleep, Stress, Energy, Recovery Status
 * These rules use NUMERIC TRENDS extracted from daily log metadata.
 */

// Rule 1: Sleep Decline + High Training (uses device sync sleep_hours)
export const checkSleepDeclineAndTraining = (context) => {
    const { avg_sleep_hours, avg_workout_intensity } = context.trends;

    if (avg_sleep_hours != null && avg_workout_intensity != null) {
        if (avg_sleep_hours < 6.5 && avg_workout_intensity >= 8) {
            return {
                type: 'warning',
                title: 'Recovery Risk',
                description: `Over the last 7 days, sleep averaged ${avg_sleep_hours}h while maintaining high training intensity (RPE ${avg_workout_intensity}). This increases injury risk.`,
                evidence: [
                    `Sleep average: ${avg_sleep_hours}h`,
                    `Workout intensity: RPE ${avg_workout_intensity}`
                ],
                suggested_intervention: 'reduce_volume'
            };
        }
    }
    return null;
};

// Rule 4: High Stress Score (from daily logs)
export const checkHighStressScore = (context) => {
    const { avg_stress_level } = context.trends;
    if (avg_stress_level != null && avg_stress_level >= 6) {
        const severity = avg_stress_level >= 8 ? 'critical' : 'warning';
        return {
            type: severity,
            title: 'Elevated Stress Detected',
            description: `Your average self-reported stress level is ${avg_stress_level}/10 over recent logs. Chronic stress can impair recovery and performance.`,
            evidence: [`Avg stress score: ${avg_stress_level}/10`],
            suggested_intervention: 'recovery_protocol'
        };
    }
    return null;
};

// Rule 12: Low Energy Score (from daily logs)
export const checkLowEnergyScore = (context) => {
    const { avg_energy_level } = context.trends;
    if (avg_energy_level != null && avg_energy_level <= 5) {
        return {
            type: avg_energy_level <= 3 ? 'warning' : 'suggestion',
            title: 'Low Energy Levels',
            description: `Your average self-reported energy level is ${avg_energy_level}/10 over recent logs. This may indicate under-recovery, poor sleep quality, or nutritional gaps.`,
            evidence: [`Avg energy score: ${avg_energy_level}/10`],
            suggested_intervention: 'check_hydration_iron'
        };
    }
    return null;
};

// Rule 15: Poor Sleep Quality Score (from daily logs)
export const checkPoorSleepQuality = (context) => {
    const { avg_sleep_quality } = context.trends;
    if (avg_sleep_quality != null && avg_sleep_quality <= 5) {
        return {
            type: 'suggestion',
            title: 'Poor Sleep Quality Reported',
            description: `You've been reporting poor sleep quality (avg ${avg_sleep_quality}/10) in your daily logs. This can affect next-day performance and recovery even if sleep duration is adequate.`,
            evidence: [`Avg sleep quality: ${avg_sleep_quality}/10`],
            suggested_intervention: 'optimize_sleep_environment'
        };
    }
    return null;
};

// Rule: Combined Low Energy + High Stress (burnout signal)
export const checkBurnoutSignal = (context) => {
    const { avg_energy_level, avg_stress_level } = context.trends;
    if (avg_energy_level != null && avg_stress_level != null) {
        if (avg_energy_level <= 5 && avg_stress_level >= 6) {
            return {
                type: 'critical',
                title: 'Burnout Risk',
                description: `You are reporting low energy (${avg_energy_level}/10) alongside high stress (${avg_stress_level}/10). This combination is a strong signal of burnout. Prioritize rest and recovery.`,
                evidence: [
                    `Avg energy: ${avg_energy_level}/10`,
                    `Avg stress: ${avg_stress_level}/10`
                ],
                suggested_intervention: 'rest_day'
            };
        }
    }
    return null;
};

// Rule: Low Hydration Alert (from daily water logs)
export const checkLowHydration = (context) => {
    const { avg_water_liters } = context.trends;
    if (avg_water_liters != null && avg_water_liters < 1.5) {
        return {
            type: 'suggestion',
            title: 'Low Hydration',
            description: `Your recent average water intake is only ${avg_water_liters}L/day. Aim for 2-3L daily for optimal performance and recovery.`,
            evidence: [`Avg daily water: ${avg_water_liters}L`],
            suggested_intervention: 'active_hydration_tracking'
        };
    }
    return null;
};

// Fallback Rule: No Daily Log Data — prompt user to start logging
export const checkNoDataPrompt = (context) => {
    const { daily_log_count, avg_energy_level, avg_stress_level, avg_sleep_quality, avg_water_liters } = context.trends;

    // Only fire if we have absolutely no numeric data from daily logs
    const hasAnyData = avg_energy_level != null || avg_stress_level != null ||
        avg_sleep_quality != null || avg_water_liters != null;

    if (!hasAnyData && (!daily_log_count || daily_log_count === 0)) {
        return {
            type: 'suggestion',
            title: 'Start Your Daily Check-In',
            description: 'Insights are generated from your daily logs. Head to the Daily Log section and track your energy, stress, sleep quality, and water intake — even once a day unlocks personalised recommendations.',
            evidence: [],
            suggested_intervention: 'start_daily_logging'
        };
    }
    return null;
};
