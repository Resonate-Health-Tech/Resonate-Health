
/**
 * Recovery Rules for Insights Engine
 * Focus: Sleep, Stress, Energy, Recovery Status
 */

// Rule 1: Sleep Decline + High Training
export const checkSleepDeclineAndTraining = (context) => {
    const { avg_sleep_hours, avg_workout_intensity } = context.trends;

    if (avg_sleep_hours && avg_workout_intensity) {
        if (avg_sleep_hours < 6.5 && avg_workout_intensity >= 8) {
            return {
                type: 'warning',
                title: 'Recovery Risk',
                message: `Over last 7 days, sleep avg ${avg_sleep_hours}h while maintaining high training intensity (RPE ${avg_workout_intensity}).`,
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

// Rule 4: Stress + Poor Sleep (Recovery Protocol)
export const checkStressAndSleep = (context) => {
    const { avg_sleep_hours } = context.trends;
    // Check for stress events in recent history
    const stressEvents = context.recent_events.filter(e =>
        e.toLowerCase().includes('stress') &&
        (e.toLowerCase().includes('high') || e.toLowerCase().includes('elevated'))
    );

    if (stressEvents.length >= 2 && avg_sleep_hours < 7) {
        return {
            type: 'warning',
            title: 'High Stress & Low Sleep',
            message: `You've reported high stress multiple times while averaging only ${avg_sleep_hours}h of sleep.`,
            evidence: [
                `Sleep average: ${avg_sleep_hours}h`,
                ...stressEvents.slice(0, 2)
            ],
            suggested_intervention: 'recovery_protocol'
        };
    }
    return null;
};

// Rule 12: Energy Levels Declining
export const checkEnergyDecline = (context) => {
    // Look for recent mentions of low energy
    const lowEnergyEvents = context.recent_events.filter(e =>
        (e.toLowerCase().includes('energy') && e.toLowerCase().includes('low')) ||
        e.toLowerCase().includes('fatigue') ||
        e.toLowerCase().includes('tired')
    );

    if (lowEnergyEvents.length >= 3) {
        return {
            type: 'warning',
            title: 'Persistent Low Energy',
            message: 'You have reported low energy or fatigue multiple times recently. Consider checking hydration or iron levels.',
            evidence: lowEnergyEvents.slice(0, 3),
            suggested_intervention: 'check_hydration_iron'
        };
    }
    return null;
};

// Rule 15: Deep Sleep Analysis (Simplified based on existing data)
export const checkDeepSleep = (context) => {
    // If we had deep sleep data specifically, we'd use it. 
    // For now, let's use a proxy if "quality" is low despite "hours" being okay.

    const { avg_sleep_hours } = context.trends;
    const poorQualityEvents = context.recent_events.filter(e =>
        e.toLowerCase().includes('sleep') &&
        (e.toLowerCase().includes('poor quality') || e.toLowerCase().includes('restless'))
    );

    if (avg_sleep_hours > 7 && poorQualityEvents.length >= 2) {
        return {
            type: 'suggestion',
            title: 'Sleep Quality Check',
            message: `You are getting enough duration (${avg_sleep_hours}h) but quality is reported as poor. Deep sleep might be compromised.`,
            evidence: poorQualityEvents.slice(0, 2),
            suggested_intervention: 'optimize_sleep_environment'
        };
    }
    return null;
};
