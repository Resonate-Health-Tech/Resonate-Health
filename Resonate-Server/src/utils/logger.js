/**
 * Structured logger for Resonate Server using pino.
 *
 * - Production: JSON output (parseable by Railway log search, Datadog, etc.)
 * - Development: pretty-printed output via pino-pretty
 *
 * Interface is identical to the previous custom logger so no other files need changes:
 *   logger.info(context, message, data?)
 *   logger.warn(context, message, data?)
 *   logger.error(context, message, error?)
 *   logger.debug(context, message, data?)
 */

import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

const pinoLogger = pino({
    level: process.env.LOG_LEVEL?.toLowerCase() ?? "info",
    ...(isDev
        ? {
            transport: {
                target: "pino-pretty",
                options: {
                    colorize: true,
                    translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
                    ignore: "pid,hostname",
                },
            },
        }
        : {
            // Production: structured JSON — never log pretty in prod (breaks log parsers)
            formatters: {
                level(label) {
                    return { level: label };
                },
            },
            timestamp: pino.stdTimeFunctions.isoTime,
        }),
});

/**
 * Thin wrapper around pino to preserve the existing logger.X(context, message, data) signature.
 */
const logger = {
    debug(context, message, data = null) {
        pinoLogger.debug({ context, ...(data && { data }) }, message);
    },

    info(context, message, data = null) {
        pinoLogger.info({ context, ...(data && { data }) }, message);
    },

    warn(context, message, data = null) {
        pinoLogger.warn({ context, ...(data && { data }) }, message);
    },

    error(context, message, error = null) {
        if (error instanceof Error) {
            pinoLogger.error({ context, err: error }, message);
        } else {
            pinoLogger.error({ context, ...(error && { data: error }) }, message);
        }
    },

    // Keep older helper methods for backward compatibility
    request(method, path, userId = "anonymous") {
        this.info("HTTP", `${method} ${path} [user: ${userId}]`);
    },

    response(method, path, status, durationMs) {
        const level = status >= 400 ? "warn" : "info";
        this[level]("HTTP", `${method} ${path} → ${status} (${durationMs}ms)`);
    },

    db(operation, collection, message = "") {
        this.debug("DB", `${operation} ${collection} ${message}`.trim());
    },

    external(service, operation, message = "") {
        this.info("API", `${service}: ${operation} ${message}`.trim());
    },
};

export default logger;

