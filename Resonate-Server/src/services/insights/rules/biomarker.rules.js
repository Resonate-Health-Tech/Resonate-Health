
/**
 * Biomarker & Diagnostics Rules for Insights Engine
 * Focus: Blood Tests, Body Comp, Lab Data
 */

// Rule 6: Vitamin D Low + Fatigue
export const checkVitaminDAndFatigue = (context) => {
    const { latest_blood_test } = context.trends;

    if (latest_blood_test) {
        const isLowVitD = latest_blood_test.memory.toLowerCase().includes('vitamin d') &&
            (latest_blood_test.memory.toLowerCase().includes('low') ||
                latest_blood_test.memory.toLowerCase().includes('deficient'));

        if (isLowVitD) {
            // Check energy levels from numeric trends first, then fall back to event keywords
            const hasLowEnergy = (context.trends.avg_energy_level != null && context.trends.avg_energy_level <= 5) ||
                context.recent_events.some(e =>
                    e.toLowerCase().includes('fatigue') ||
                    e.toLowerCase().includes('tired') ||
                    e.toLowerCase().includes('low energy')
                );

            if (hasLowEnergy) {
                return {
                    type: 'warning',
                    title: 'Vitamin D Deficiency',
                    description: 'Your recent blood test showed low Vitamin D, and you are reporting low energy or fatigue. Vitamin D deficiency is a common and correctable cause — supplementation typically makes a noticeable difference.',
                    evidence: [
                        `Blood Test: ${latest_blood_test.memory}`,
                        ...(context.trends.avg_energy_level != null ? [`Avg energy level: ${context.trends.avg_energy_level}/10`] : [])
                    ],
                    suggested_intervention: 'vitamin_d_supplement'
                };
            }
        }
    }
    return null;
};

// Rule 10: Blood Markers Improving (Positive)
export const checkBiomarkerImprovement = (context) => {
    const { latest_blood_test } = context.trends;

    if (latest_blood_test) {
        const isImproving = latest_blood_test.memory.toLowerCase().includes('improved') ||
            latest_blood_test.memory.toLowerCase().includes('better') ||
            latest_blood_test.memory.toLowerCase().includes('normal range');

        if (isImproving) {
            return {
                type: 'positive',
                title: 'Health Markers Improving',
                description: 'Your latest blood test shows improvements in key markers. Your lifestyle interventions are working — keep up the good habits!',
                evidence: [latest_blood_test.memory],
                suggested_intervention: 'maintain_protocol'
            };
        }
    }
    return null;
};

// Bonus: BCA Change (placeholder, not yet triggered)
export const checkBodyCompChange = (context) => {
    return null;
};
