/**
 * Production-grade rate limiting using express-rate-limit.
 *
 * Replaces the previous hand-rolled in-memory Map which:
 *   - Was not shared across cluster workers
 *   - Was lost on every server restart
 *   - Blocked the event loop during cleanup intervals
 *
 * For a future multi-instance deployment (e.g. Railway horizontal scaling),
 * upgrade to: https://github.com/nfriedly/express-rate-limit-redis
 */

import rateLimit from "express-rate-limit";

/**
 * Strict rate limiter for sensitive endpoints (auth, upload).
 * 30 requests per minute per IP.
 */
export const strictRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    standardHeaders: true,  // Return RateLimit-* headers (RFC 6585)
    legacyHeaders: false,   // Disable X-RateLimit-* headers
    message: {
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again in 60 seconds.",
        retryAfter: 60,
    },
});

/**
 * Default rate limiter for general API endpoints.
 * 200 requests per minute per IP.
 */
export const defaultRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "Too many requests",
        message: "Rate limit exceeded. Please slow down.",
        retryAfter: 60,
    },
});

/**
 * Generic factory — kept for backward compatibility if any route imports rateLimiter(opts).
 */
export function rateLimiter(options = {}) {
    return rateLimit({
        windowMs: options.windowMs || 60 * 1000,
        max: options.max || 200,
        standardHeaders: true,
        legacyHeaders: false,
    });
}
