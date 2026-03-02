import swaggerJsdoc from 'swagger-jsdoc';

/**
 * Swagger/OpenAPI configuration for Resonate Server API.
 */
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Resonate Fitness API',
            version: '1.0.0',
            description: `
# Resonate Fitness API Documentation

RESTful API for the Resonate Health & Fitness platform.

## Authentication
Most endpoints require Firebase Authentication. Include the Firebase ID token in cookies or Authorization header.

## Rate Limiting
- Default: 100 requests per 15 minutes
- Auth routes: 10 requests per 15 minutes

## Response Format
All responses follow this structure:
\`\`\`json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
\`\`\`
      `,
            contact: {
                name: 'Resonate Team'
            }
        },
        servers: [
            {
                url: 'http://localhost:3001',
                description: 'Development server'
            },
            {
                url: process.env.API_URL || 'https://api.resonate.health',
                description: 'Production server'
            }
        ],
        components: {
            securitySchemes: {
                cookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'session'
                },
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Firebase ID token'
                }
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        error: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'Error message' },
                                code: { type: 'string', example: 'VALIDATION_ERROR' }
                            }
                        }
                    }
                },
                User: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        firebaseUid: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        name: { type: 'string' },
                        gender: { type: 'string', enum: ['male', 'female', 'other'] },
                        heightCm: { type: 'number' },
                        weightKg: { type: 'number' },
                        dateOfBirth: { type: 'string', format: 'date' },
                        dietType: { type: 'string', enum: ['vegetarian', 'eggetarian', 'non_vegetarian'] },
                        goals: { type: 'string' }
                    }
                },
                WorkoutPlan: {
                    type: 'object',
                    properties: {
                        title: { type: 'string', example: 'Morning Power Session' },
                        duration: { type: 'string', example: '45 Minutes' },
                        focus: { type: 'string', example: 'Full Body Strength' },
                        warmup: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    duration: { type: 'string' }
                                }
                            }
                        },
                        exercises: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    sets: { type: 'integer' },
                                    reps: { type: 'string' },
                                    notes: { type: 'string' }
                                }
                            }
                        },
                        cooldown: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    duration: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                MealPlan: {
                    type: 'object',
                    properties: {
                        breakfast: { $ref: '#/components/schemas/Meal' },
                        lunch: { $ref: '#/components/schemas/Meal' },
                        dinner: { $ref: '#/components/schemas/Meal' },
                        snacks: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Meal' }
                        },
                        total_calories: { type: 'integer', example: 1500 },
                        total_protein: { type: 'string', example: '60g' }
                    }
                },
                Meal: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', example: 'Oatmeal with Fruits' },
                        description: { type: 'string' },
                        calories: { type: 'integer', example: 350 },
                        protein: { type: 'string', example: '12g' },
                        carbs: { type: 'string', example: '45g' },
                        fats: { type: 'string', example: '8g' }
                    }
                },
                WaterLog: {
                    type: 'object',
                    properties: {
                        date: { type: 'string', format: 'date' },
                        amountMl: { type: 'integer', example: 2000 },
                        logs: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    time: { type: 'string', format: 'date-time' },
                                    amountMl: { type: 'integer' }
                                }
                            }
                        }
                    }
                }
            }
        },
        tags: [
            { name: 'Auth', description: 'Authentication endpoints' },
            { name: 'User', description: 'User profile management' },
            { name: 'Workout', description: 'Workout plan generation and tracking' },
            { name: 'Nutrition', description: 'Meal plan generation and tracking' },
            { name: 'Food', description: 'Food analysis and logging' },
            { name: 'Water', description: 'Water intake tracking' },
            { name: 'Diagnostics', description: 'Biomarker and health data' },
            { name: 'Fitness Connect', description: 'Google Fit integration' },
            { name: 'Admin', description: 'Admin and memory management' }
        ]
    },
    apis: ['./src/routes/*.js', './src/docs/*.yaml']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;
