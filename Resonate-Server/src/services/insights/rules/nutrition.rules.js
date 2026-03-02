
/**
 * Nutrition Rules for Insights Engine
 * Focus: Diet, Compliance, Macros, Hydration
 */

// Rule 3: Consistent Compliance + No Progress
export const checkComplianceAndProgress = (context) => {
    const { nutrition_adherence_percent, current_weight_kg } = context.trends;

    // We need historical weight to compare, but context builder only gives current.
    // Let's assume we can infer "no progress" if weight hasn't changed in memories, 
    // or if the user explicitly says "stalled".

    const stalledEvents = context.recent_events.filter(e =>
        e.toLowerCase().includes('weight stalled') ||
        e.toLowerCase().includes('plateau') ||
        e.toLowerCase().includes('no weight loss')
    );

    if (nutrition_adherence_percent > 85 && stalledEvents.length > 0) {
        return {
            type: 'action',
            title: 'Plateau Detected',
            message: `Nutrition adherence is high (${nutrition_adherence_percent}%) but you reported a plateau. May need calorie adjustment.`,
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
    // Look for memories combining late dinner and high glucose
    const spikeEvents = context.recent_events.filter(e =>
        (e.toLowerCase().includes('dinner') || e.toLowerCase().includes('late meal')) &&
        (e.toLowerCase().includes('glucose spike') || e.toLowerCase().includes('high sugar') || e.toLowerCase().includes('> 140'))
    );

    if (spikeEvents.length > 0) {
        return {
            type: 'suggestion',
            title: 'Carb Timing Optimization',
            message: 'Recent logs show glucose spikes after late meals. Shifting carbs earlier may improve stability.',
            evidence: spikeEvents,
            suggested_intervention: 'adjust_meal_timing'
        };
    }
    return null;
};

// Rule 7: Protein Intake Low + Muscle Loss (or just low protein)
export const checkProteinIntake = (context) => {
    // Check for "low protein" memories or logs with low protein counts
    // This is hard without structured macros in trends, so rely on semantic search results
    const lowProteinEvents = context.recent_events.filter(e =>
        e.toLowerCase().includes('low protein') ||
        e.toLowerCase().includes('missed protein target')
    );

    if (lowProteinEvents.length >= 2) {
        return {
            type: 'warning',
            title: 'Protein Intake Alert',
            message: 'You have missed your protein target multiple times recently. This may affect muscle recovery.',
            evidence: lowProteinEvents,
            suggested_intervention: 'increase_protein'
        };
    }
    return null;
};

// Rule 14: Hydration Alert
export const checkHydration = (context) => {
    const dehydrationEvents = context.recent_events.filter(e =>
        e.toLowerCase().includes('dehydrated') ||
        e.toLowerCase().includes('thirsty') ||
        e.toLowerCase().includes('headache') // often hydration related
    );

    if (dehydrationEvents.length >= 2) {
        return {
            type: 'suggestion',
            title: 'Hydration Check',
            message: 'You reported symptoms often linked to dehydration (headache, thirst). Ensure you are drinking enough water.',
            evidence: dehydrationEvents.slice(0, 2),
            suggested_intervention: 'active_hydration_tracking'
        };
    }
    return null;
};

// Rule 11: Intervention Compliance Low
export const checkInterventionCompliance = (context) => {
    // Check if there are active interventions but user says they aren't following them
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
                message: 'It seems you are struggling with the current interventions. Should we simplify the plan?',
                evidence: nonComplianceEvents,
                suggested_intervention: 'simplify_plan'
            };
        }
    }
    return null;
};
