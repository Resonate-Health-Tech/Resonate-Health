/**
 * Centralized error handling middleware for Express.
 * Provides consistent error responses and logging.
 */

import logger from '../utils/logger.js';

// Custom error class for application errors
export class AppError extends Error {
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.isOperational = true; // Distinguishes from programming errors

        Error.captureStackTrace(this, this.constructor);
    }
}

// Common error factory functions
export const errors = {
    badRequest: (message = 'Bad Request', details = null) =>
        new AppError(message, 400, 'BAD_REQUEST', details),

    unauthorized: (message = 'Unauthorized') =>
        new AppError(message, 401, 'UNAUTHORIZED'),

    forbidden: (message = 'Forbidden') =>
        new AppError(message, 403, 'FORBIDDEN'),

    notFound: (resource = 'Resource') =>
        new AppError(`${resource} not found`, 404, 'NOT_FOUND'),

    validation: (errors) =>
        new AppError('Validation failed', 422, 'VALIDATION_ERROR', errors),

    internal: (message = 'Internal server error') =>
        new AppError(message, 500, 'INTERNAL_ERROR'),
};

/**
 * Express error handling middleware.
 * Should be registered after all routes.
 */
export function errorHandler(err, req, res, next) {
    // Log the error
    const logLevel = err.statusCode >= 500 ? 'error' : 'warn';
    logger[logLevel]('ErrorHandler', err.message, {
        statusCode: err.statusCode,
        code: err.code,
        path: req.path,
        method: req.method,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });

    // Default to 500 if no status code
    const statusCode = err.statusCode || 500;
    const isOperational = err.isOperational || false;

    // Send error response
    res.status(statusCode).json({
        success: false,
        error: {
            message: isOperational ? err.message : 'An unexpected error occurred',
            code: err.code || 'INTERNAL_ERROR',
            ...(err.details && { details: err.details }),
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
}

/**
 * Async handler wrapper to catch errors in async route handlers.
 * Usage: router.get('/path', asyncHandler(async (req, res) => { ... }))
 */
export function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

/**
 * Not found handler for undefined routes.
 */
export function notFoundHandler(req, res, next) {
    next(errors.notFound(`Route ${req.method} ${req.path}`));
}

export default {
    AppError,
    errors,
    errorHandler,
    asyncHandler,
    notFoundHandler
};
