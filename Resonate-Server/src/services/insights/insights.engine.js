
import { MemoryContextBuilder } from '../memory/memoryContext.builder.js';
import { aiInsightsService } from './ai.insights.service.js';
import { User } from '../../models/User.js';
import { logger } from '../../utils/memoryLogger.js';
import * as recoveryRules from './rules/recovery.rules.js';
import * as trainingRules from './rules/training.rules.js';
import * as nutritionRules from './rules/nutrition.rules.js';
import * as biomarkerRules from './rules/biomarker.rules.js';

export class InsightsEngine {
    constructor() {
        this.contextBuilder = new MemoryContextBuilder();

        // Rule engine — used as fallback only if AI call fails
        this.rules = [
            ...Object.values(recoveryRules),
            ...Object.values(trainingRules),
            ...Object.values(nutritionRules),
            ...Object.values(biomarkerRules)
        ].filter(r => typeof r === 'function');
    }

    async generateInsights(userId) {
        try {
            logger.debug('INSIGHTS', 'Generating insights', { userId });

            // 1. Build rich context from Mem0 memories
            const context = await this.contextBuilder.buildMemoryContext(userId, 'insights');

            // 2. Fetch user profile for personalisation (age, gender)
            let userProfile = {};
            try {
                const user = await User.findOne({ firebaseUid: userId }).select('age gender').lean();
                if (user) userProfile = { age: user.age, gender: user.gender };
            } catch (profileErr) {
                // Non-critical — AI will work without profile, just less personalised
                logger.warn('INSIGHTS', 'Could not fetch user profile for AI insights', { userId });
            }

            // 3. Try AI generation first
            const aiInsights = await aiInsightsService.generate(userId, context, userProfile);

            if (aiInsights && aiInsights.length > 0) {
                logger.info('INSIGHTS', 'AI insights generated', { userId, count: aiInsights.length });
                return this._prioritize(this._deduplicate(aiInsights));
            }

            // 4. Fallback: rule engine if AI fails / returns empty
            logger.warn('INSIGHTS', 'AI returned no insights — falling back to rule engine', { userId });
            return this._runRuleEngine(context);

        } catch (error) {
            logger.logError('INSIGHTS', error, { userId });
            return [];
        }
    }

    /**
     * Original rule-based engine — kept as fallback.
     */
    _runRuleEngine(context) {
        const insights = [];

        for (const rule of this.rules) {
            try {
                const result = rule(context);
                if (result) {
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

        logger.info('INSIGHTS', 'Rule engine fallback finished', { count: insights.length });
        return this._prioritize(this._deduplicate(insights));
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
