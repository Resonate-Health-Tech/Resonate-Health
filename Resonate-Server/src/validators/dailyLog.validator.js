import { z } from "zod";

export const dailyLogSchema = z.object({
    energyLevel: z.number().int().min(1).max(10),
    sleepQuality: z.number().int().min(1).max(10),
    stressLevel: z.number().int().min(1).max(10),
    notes: z.string().max(500).optional()
});

export const validateDailyLog = (req, res, next) => {
    try {
        dailyLogSchema.parse(req.body);
        next();
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: err.errors.map((e) => ({
                    field: e.path.join("."),
                    message: e.message,
                })),
            });
        }
        next(err);
    }
};
