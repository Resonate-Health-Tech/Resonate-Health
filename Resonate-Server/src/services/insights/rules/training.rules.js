
/**
 * Training Rules for Insights Engine
 * Focus: Workouts, Intensity, Soreness, Performance
 */

// Rule 5: High Intensity + Low Energy (replaces keyword-matching soreness check)
export const checkSorenessAndIntensity = (context) => {
    const { avg_workout_intensity, avg_energy_level } = context.trends;

    // Fire when training hard but energy is low — strong signal of overreaching
    if (avg_workout_intensity != null && avg_workout_intensity >= 8) {
        if (avg_energy_level != null && avg_energy_level <= 5) {
            return {
                type: 'warning',
                title: 'High Intensity with Low Energy',
                description: `You've been training at high intensity (avg RPE ${avg_workout_intensity}) while reporting low energy levels (${avg_energy_level}/10). This combination can lead to overtraining. Consider a deload or active recovery session.`,
                evidence: [
                    `Avg workout intensity: RPE ${avg_workout_intensity}`,
                    `Avg energy level: ${avg_energy_level}/10`
                ],
                suggested_intervention: 'active_recovery_session'
            };
        }

        // High intensity alone is worth noting
        return {
            type: 'suggestion',
            title: 'Sustained High Training Load',
            description: `Your average workout intensity has been RPE ${avg_workout_intensity} recently. Make sure you are prioritising sleep and recovery to keep performing at this level.`,
            evidence: [`Avg workout intensity: RPE ${avg_workout_intensity}`],
            suggested_intervention: 'monitor_recovery'
        };
    }
    return null;
};

// Rule 8: Workout Skips Pattern (Motivation) — keyword-based, kept as-is
export const checkWorkoutSkips = (context) => {
    const skippedEvents = context.recent_events.filter(e =>
        e.toLowerCase().includes('missed workout') ||
        e.toLowerCase().includes('skipped training') ||
        e.toLowerCase().includes('could not workout')
    );

    if (skippedEvents.length >= 2) {
        return {
            type: 'suggestion',
            title: 'Workout Consistency',
            description: 'You missed multiple workouts recently. Is the current schedule too demanding? Consider adjusting training frequency or volume.',
            evidence: skippedEvents,
            suggested_intervention: 'adjust_schedule'
        };
    }
    return null;
};

// Rule 13: Performance Improving — kept as-is
export const checkPerformanceImprovement = (context) => {
    const { avg_workout_intensity } = context.trends;

    const prEvents = context.recent_events.filter(e =>
        e.toLowerCase().includes('pr') ||
        e.toLowerCase().includes('personal best') ||
        e.toLowerCase().includes('increased weight') ||
        e.toLowerCase().includes('stronger')
    );

    if (prEvents.length > 0) {
        return {
            type: 'positive',
            title: 'Performance Improving',
            description: `Great job! You're hitting personal bests${avg_workout_intensity ? ` while maintaining solid training intensity (Avg RPE ${avg_workout_intensity})` : ''}. Keep up the progressive overload.`,
            evidence: prEvents,
            suggested_intervention: 'continue_progression'
        };
    }
    return null;
};

// Rule 9: Post-workout Recovery Poor — uses avg_energy_level from trends
export const checkPostWorkoutRecovery = (context) => {
    const { avg_energy_level, avg_workout_intensity } = context.trends;

    // If user logs workouts but energy is very low, flag post-workout recovery
    if (avg_energy_level != null && avg_energy_level <= 3 && avg_workout_intensity != null) {
        return {
            type: 'warning',
            title: 'Post-Workout Fatigue Signal',
            description: `Your energy levels (avg ${avg_energy_level}/10) are very low despite active training (RPE ${avg_workout_intensity}). Ensure you're fuelling adequately with post-workout nutrition and prioritising sleep.`,
            evidence: [
                `Avg energy level: ${avg_energy_level}/10`,
                `Avg workout intensity: RPE ${avg_workout_intensity}`
            ],
            suggested_intervention: 'post_workout_nutrition'
        };
    }
    return null;
};
