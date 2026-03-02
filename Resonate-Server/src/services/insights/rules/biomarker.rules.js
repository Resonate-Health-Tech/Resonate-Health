
/**
 * Biomarker & Diagnostics Rules for Insights Engine
 * Focus: Blood Tests, Body Comp, Lab Data
 */

// Rule 6: Vitamin D Low + Fatigue
export const checkVitaminDAndFatigue = (context) => {
    const { latest_blood_test } = context.trends;

    // Check if we have a recent blood test mentioning low Vitamin D
    if (latest_blood_test) {
        const isLowVitD = latest_blood_test.memory.toLowerCase().includes('vitamin d') &&
            (latest_blood_test.memory.toLowerCase().includes('low') ||
                latest_blood_test.memory.toLowerCase().includes('deficient'));

        if (isLowVitD) {
            // Check for fatigue in recent events
            const fatigueEvents = context.recent_events.filter(e =>
                e.toLowerCase().includes('fatigue') ||
                e.toLowerCase().includes('tired') ||
                e.toLowerCase().includes('low energy')
            );

            if (fatigueEvents.length > 0) {
                return {
                    type: 'warning',
                    title: 'Vitamin D Deficiency',
                    message: 'Your recent blood test showed low Vitamin D, and you are reporting fatigue. Supplementation may be needed.',
                    evidence: [
                        `Blood Test: ${latest_blood_test.memory}`,
                        ...fatigueEvents
                    ],
                    suggested_intervention: 'vitamin_dt_supplement'
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
        // Look for keywords like "improved", "decreased" (for bad things), "increased" (for good things)
        // This is a bit linguistic without structured data, but we store summary text like "LDL 148 (down from 160)"

        const isImproving = latest_blood_test.memory.toLowerCase().includes('improved') ||
            latest_blood_test.memory.toLowerCase().includes('better') ||
            latest_blood_test.memory.toLowerCase().includes('normal range'); // moved into normal

        if (isImproving) {
            return {
                type: 'positive',
                title: 'Health Markers Improving',
                message: 'Your latest blood test shows improvements in key markers. Keep up the good work!',
                evidence: [latest_blood_test.memory],
                suggested_intervention: 'maintain_protocol'
            };
        }
    }
    return null;
};

// Bonus: BCA Change
export const checkBodyCompChange = (context) => {
    // If we had previous weight, we could compare. 
    // relying on memory text for now "Weight 91kg (down 2kg)"
    const { latest_body_comp } = context.trends; // Assuming we add this to context if we want
    // But we have context.key_facts with "Latest Body Comp"

    // Not strictly a rule in list, but good to have. 
    // Skipping for now to stick to 15.
    return null;
};
