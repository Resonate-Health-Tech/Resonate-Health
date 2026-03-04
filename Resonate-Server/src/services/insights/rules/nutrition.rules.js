
/**
 * Nutrition Rules for Insights Engine
 * Focus: Diet, Compliance, Macros, Hydration
 */

// Rule 3: Consistent Compliance + No Progress
export const checkComplianceAndProgress = (context) => {
    const { nutrition_adherence_percent } = context.trends;

    const stalledEvents = context.recent_events.filter(e =>
        e.toLowerCase().includes('weight stalled') ||
        e.toLowerCase().includes('plateau') ||
        e.toLowerCase().includes('no weight loss')
    );

    if (nutrition_adherence_percent > 85 && stalledEvents.length > 0) {
        return {
            type: 'action',
            title: 'Plateau Detected',
            description: `Nutrition adherence is high (${nutrition_adherence_percent}%) but you reported a plateau. Your body may have adapted — a small calorie adjustment or diet break might help restart progress.`,
            evidence: [
                `Adherence: ${nutrition_adherence_percent}%`,
                ...stalledEvents
            ],
            suggested_intervention: 'adjust_calories'
        };
    }
    return null;
};

// Rule 2: CGM Spikes After Late Dinner
export const checkCGMSpikes = (context) => {
    const spikeEvents = context.recent_events.filter(e =>
        (e.toLowerCase().includes('dinner') || e.toLowerCase().includes('late meal')) &&
        (e.toLowerCase().includes('glucose spike') || e.toLowerCase().includes('high sugar') || e.toLowerCase().includes('> 140'))
    );

    if (spikeEvents.length > 0) {
        return {
            type: 'suggestion',
            title: 'Carb Timing Optimization',
            description: 'Recent logs show glucose spikes after late meals. Shifting carbohydrates to earlier in the day may improve blood sugar stability and sleep quality.',
            evidence: spikeEvents,
            suggested_intervention: 'adjust_meal_timing'
        };
    }
    return null;
};

// Rule 7: Protein Intake Low
export const checkProteinIntake = (context) => {
    const lowProteinEvents = context.recent_events.filter(e =>
        e.toLowerCase().includes('low protein') ||
        e.toLowerCase().includes('missed protein target')
    );

    if (lowProteinEvents.length >= 2) {
        return {
            type: 'warning',
            title: 'Protein Intake Alert',
            description: 'You have missed your protein target multiple times recently. Adequate protein is essential for muscle recovery and body composition — aim for your daily target consistently.',
            evidence: lowProteinEvents,
            suggested_intervention: 'increase_protein'
        };
    }
    return null;
};

// Rule 14: Hydration Check (keyword-based)
export const checkHydration = (context) => {
    const dehydrationEvents = context.recent_events.filter(e =>
        e.toLowerCase().includes('dehydrated') ||
        e.toLowerCase().includes('thirsty') ||
        e.toLowerCase().includes('headache')
    );

    if (dehydrationEvents.length >= 2) {
        return {
            type: 'suggestion',
            title: 'Hydration Check',
            description: 'You reported symptoms often linked to dehydration (headache, thirst). Make sure you are drinking at least 2-3L of water daily, more on training days.',
            evidence: dehydrationEvents.slice(0, 2),
            suggested_intervention: 'active_hydration_tracking'
        };
    }
    return null;
};

// Rule 11: Intervention Compliance Low
export const checkInterventionCompliance = (context) => {
    if (context.active_interventions && context.active_interventions.length > 0) {
        const nonComplianceEvents = context.recent_events.filter(e =>
            e.toLowerCase().includes('could not follow plan') ||
            e.toLowerCase().includes('cheated on diet') ||
            e.toLowerCase().includes('skipped intervention')
        );

        if (nonComplianceEvents.length > 0) {
            return {
                type: 'warning',
                title: 'Intervention Compliance',
                description: 'It seems you are struggling with the current interventions. Consistency matters more than perfection — consider simplifying the plan to make it sustainable.',
                evidence: nonComplianceEvents,
                suggested_intervention: 'simplify_plan'
            };
        }
    }
    return null;
};
