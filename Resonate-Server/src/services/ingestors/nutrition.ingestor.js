import { MemoryService } from '../memory.service.js';

export class NutritionIngestor {
    constructor(memoryService) {
        this.memoryService = memoryService || new MemoryService();
    }

    /**
     * Process a meal log event
     * @param {string} userId - The user ID
     * @param {Object} meal - The meal data object
     * @returns {Promise<Object>} - The result of the memory addition
     */
    async processMealEvent(userId, meal) {
        try {
            const processedData = this._extractMealData(meal);
            const memoryText = this._generateMemoryText(processedData);
            const metadata = this._formatMetadata(processedData);

            return await this.memoryService.addMemory(userId, memoryText, metadata);
        } catch (error) {
            console.error('Error processing meal event:', error);
            throw error;
        }
    }

    /**
     * Extract relevant data from meal object
     * @param {Object} meal 
     * @returns {Object}
     */
    _extractMealData(meal) {
        return {
            mealType: meal.type || meal.mealType || 'Snack',
            description: meal.description || meal.name || 'Food entry',
            calories: meal.calories || 0,
            macros: {
                protein: meal.macros?.protein || meal.protein || 0,
                carbs: meal.macros?.carbs || meal.carbs || 0,
                fat: meal.macros?.fat || meal.fat || 0
            },
            adherence: meal.adherence !== undefined ? meal.adherence : (meal.planAdherence || false),
            timestamp: meal.timestamp || new Date().toISOString()
        };
    }

    /**
     * Generate compact memory text
     * @param {Object} data 
     * @returns {string}
     */
    _generateMemoryText(data) {
        let text = `${data.mealType}: ${data.description}, ${data.calories} cal`;

        if (data.macros.protein || data.macros.carbs || data.macros.fat) {
            text += ` (${data.macros.protein}g protein, ${data.macros.carbs}g carbs, ${data.macros.fat}g fat)`;
        }

        text += '.';

        if (data.adherence) {
            text += ' Adhered to meal plan.';
        }

        return text;
    }

    /**
     * Format metadata for Mem0
     * @param {Object} data 
     * @returns {Object}
     */
    _formatMetadata(data) {
        return {
            category: 'nutrition.intake',
            source: 'user_input',
            timestamp: data.timestamp,
            module_specific: {
                meal_type: data.mealType,
                calories: data.calories,
                protein_g: data.macros.protein,
                carbs_g: data.macros.carbs,
                fat_g: data.macros.fat,
                plan_adherence: data.adherence
            }
        };
    }
}


