import { z } from 'zod';

/**
 * Zod validation schemas for workout-related requests.
 * Provides runtime type safety and clear error messages.
 */

export const generateWorkoutSchema = z.object({
    fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced'], {
        errorMap: () => ({ message: 'Fitness level must be beginner, intermediate, or advanced' })
    }),
    equipment: z.array(z.string()).optional().default([]),
    timeAvailable: z.number()
        .int()
        .min(10, 'Workout must be at least 10 minutes')
        .max(180, 'Workout cannot exceed 180 minutes'),
    injuries: z.array(z.string()).optional().default([]),
    motivationLevel: z.enum(['low', 'medium', 'high']).optional(),
    workoutTiming: z.enum(['morning', 'afternoon', 'evening']).optional(),
    goalBarriers: z.array(z.string()).optional().default([]),
});

export const completeWorkoutSchema = z.object({
    workoutId: z.string().min(1, 'Workout ID is required'),
    rpe: z.number()
        .int()
        .min(1, 'RPE must be at least 1')
        .max(10, 'RPE cannot exceed 10')
        .optional(),
    energyLevel: z.enum(['low', 'medium', 'high']).optional(),
    notes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
    durationMinutes: z.number()
        .int()
        .min(1)
        .max(300)
        .optional(),
    actualExercises: z.array(z.object({
        name: z.string(),
        sets: z.number().int().optional(),
        reps: z.string().optional(),
        notes: z.string().optional()
    })).optional(),
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
