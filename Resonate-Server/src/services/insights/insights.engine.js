
import { MemoryContextBuilder } from '../memory/memoryContext.builder.js';
import { logger } from '../../utils/memoryLogger.js';
import * as recoveryRules from './rules/recovery.rules.js';
import * as trainingRules from './rules/training.rules.js';
import * as nutritionRules from './rules/nutrition.rules.js';
import * as biomarkerRules from './rules/biomarker.rules.js';

export class InsightsEngine {
    constructor() {
        this.contextBuilder = new MemoryContextBuilder();
        this.rules = [
            ...Object.values(recoveryRules),
            ...Object.values(trainingRules),
            ...Object.values(nutritionRules),
            ...Object.values(biomarkerRules)
        ];
    }

    async generateInsights(userId) {
        try {
            logger.debug('INSIGHTS', 'Generating insights', { userId });

            // 1. Build rich context
            const context = await this.contextBuilder.buildMemoryContext(userId, 'insights');

            const insights = [];

            // 2. Apply all rules
            for (const rule of this.rules) {
                if (typeof rule === 'function') {
                    try {
                        const result = rule(context);
                        if (result) {
                            // If rule returns an array, spread it; otherwise push single object
                            if (Array.isArray(result)) {
                                insights.push(...result);
                            } else {
                                insights.push(result);
                            }
                        }
                    } catch (ruleError) {
                        logger.warn('INSIGHTS', `Rule execution failed: ${rule.name}`, { error: ruleError.message });
                    }
                }
            }

            // 3. Deduplicate based on title+type to avoid spam
            const uniqueInsights = this._deduplicate(insights);

            // 4. Sort by priority
            const sortedInsights = this._prioritize(uniqueInsights);

            logger.info('INSIGHTS', 'Insights generated', { userId, count: sortedInsights.length });
            return sortedInsights;

        } catch (error) {
            logger.logError('INSIGHTS', error, { userId });
            return [];
        }
    }

    _deduplicate(insights) {
        const seen = new Set();
        return insights.filter(insight => {
            const key = `${insight.type}:${insight.title}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    _prioritize(insights) {
        const priorityMap = {
            'critical': 4,
            'warning': 3,
            'action': 2,
            'suggestion': 1,
            'positive': 0
        };

        return insights.sort((a, b) => {
            return (priorityMap[b.type] || 0) - (priorityMap[a.type] || 0);
        });
    }
}
