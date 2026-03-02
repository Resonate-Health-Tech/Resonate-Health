const LOG_LEVELS = {
    ERROR: 'ERROR',
    WARN: 'WARN',
    INFO: 'INFO',
    DEBUG: 'DEBUG'
};

class MemoryLogger {
    constructor(level = LOG_LEVELS.INFO) {
        this.level = level;
        this.levelPriority = {
            [LOG_LEVELS.ERROR]: 0,
            [LOG_LEVELS.WARN]: 1,
            [LOG_LEVELS.INFO]: 2,
            [LOG_LEVELS.DEBUG]: 3
        };
    }

    shouldLog(level) {
        return this.levelPriority[level] <= this.levelPriority[this.level];
    }

    formatMessage(level, operation, message, context = {}) {
        const timestamp = new Date().toISOString();
        const contextStr = Object.keys(context).length > 0 ? JSON.stringify(context) : '';
        return `[${timestamp}] [MEMORY] [${level}] [${operation}] ${message} ${contextStr}`;
    }

    error(operation, message, context = {}) {
        if (this.shouldLog(LOG_LEVELS.ERROR)) {
            console.error(this.formatMessage(LOG_LEVELS.ERROR, operation, message, context));
        }
    }

    warn(operation, message, context = {}) {
        if (this.shouldLog(LOG_LEVELS.WARN)) {
            console.warn(this.formatMessage(LOG_LEVELS.WARN, operation, message, context));
        }
    }

    info(operation, message, context = {}) {
        if (this.shouldLog(LOG_LEVELS.INFO)) {
            console.log(this.formatMessage(LOG_LEVELS.INFO, operation, message, context));
        }
    }

    debug(operation, message, context = {}) {
        if (this.shouldLog(LOG_LEVELS.DEBUG)) {
            console.log(this.formatMessage(LOG_LEVELS.DEBUG, operation, message, context));
        }
    }

    logOperation(operation, userId, details = {}) {
        this.info(operation, `Operation executed`, { userId, ...details });
    }

    logError(operation, error, context = {}) {
        this.error(operation, error.message, {
            ...context,
            stack: error.stack,
            name: error.name
        });
    }

    measureDuration(operation, startTime) {
        const duration = Date.now() - startTime;
        this.debug(operation, `Duration: ${duration}ms`, { duration });
        return duration;
    }
}

const logger = new MemoryLogger(
    process.env.MEMORY_LOG_LEVEL || LOG_LEVELS.INFO
);

export { MemoryLogger, LOG_LEVELS, logger };
