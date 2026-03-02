
/**
 * Training Rules for Insights Engine
 * Focus: Workouts, Intensity, Soreness, Performance
 */

// Rule 5: High Soreness + Planned High Intensity
export const checkSorenessAndIntensity = (context) => {
    // Check for recent soreness
    const sorenessEvents = context.recent_events.filter(e =>
        e.toLowerCase().includes('sore') ||
        (e.toLowerCase().includes('muscle pain') && !e.toLowerCase().includes('injury'))
    );

    // If we have soreness and high intensity trend, warn
    if (sorenessEvents.length > 0 && context.trends.avg_workout_intensity >= 8) {
        return {
            type: 'warning',
            title: 'High Intensity with Soreness',
            message: 'You are reporting soreness while maintaining high training intensity (RPE 8+). Consider a lighter session or active recovery.',
            evidence: sorenessEvents,
            suggested_intervention: 'active_recovery_session'
        };
    }
    return null;
};

// Rule 8: Workout Skips Pattern (Motivation)
export const checkWorkoutSkips = (context) => {
    // Look for memories about missed workouts
    const skippedEvents = context.recent_events.filter(e =>
        e.toLowerCase().includes('missed workout') ||
        e.toLowerCase().includes('skipped training') ||
        e.toLowerCase().includes('could not workout')
    );

    if (skippedEvents.length >= 2) {
        return {
            type: 'suggestion',
            title: 'Workout Consistency',
            message: 'You missed multiple workouts recently. Is the current schedule too demanding?',
            evidence: skippedEvents,
            suggested_intervention: 'adjust_schedule'
        };
    }
    return null;
};

// Rule 13: Performance Improving
export const checkPerformanceImprovement = (context) => {
    const { avg_workout_intensity } = context.trends;

    // Check for "PR" or "personal best" or "increased weight"
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
            message: `Great job! You're hitting personal bests while maintaining intensity (Avg RPE ${avg_workout_intensity}).`,
            evidence: prEvents,
            suggested_intervention: 'continue_progression' // Positive reinforcement
        };
    }
    return null;
};

// Rule 9: Post-workout Recovery Poor
export const checkPostWorkoutRecovery = (context) => {
    // Look for "drained", "exhausted", "collapsed" after workout context
    const exhaustedEvents = context.recent_events.filter(e =>
        e.toLowerCase().includes('exhausted after workout') ||
        e.toLowerCase().includes('drained') ||
        e.toLowerCase().includes('dizzy')
    );

    if (exhaustedEvents.length > 0) {
        return {
            type: 'warning',
            title: 'Post-Workout Fatigue',
            message: 'You reported extreme fatigue after recent workouts. Ensure you are consuming post-workout chords/protein.',
            evidence: exhaustedEvents,
            suggested_intervention: 'post_workout_nutrition'
        };
    }
    return null;
};
