import { z } from 'zod';

/**
 * Zod validation schemas for nutrition-related requests.
 */

export const generateNutritionSchema = z.object({
    age: z.number().int().min(10).max(120).optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    weight: z.number().min(20).max(300).optional(),
    height: z.number().min(50).max(300).optional(),
    goals: z.string().max(500).optional(),
    dietType: z.enum(['vegetarian', 'eggetarian', 'non_vegetarian', 'vegan']).optional(),
    allergies: z.array(z.string()).optional().default([]),
    cuisine: z.string().optional().default('Indian'),
    memoryContext: z.record(z.any()).optional(),
});

export const getMealHistorySchema = z.object({
    limit: z.number().int().min(1).max(100).optional().default(30),
    offset: z.number().int().min(0).optional().default(0),
});

/**
 * Validate request body against a schema.
 * Returns { success: true, data } or { success: false, errors }
 */
export function validateRequest(schema, data) {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return {
        success: false,
        errors: result.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
        }))
    };
}
