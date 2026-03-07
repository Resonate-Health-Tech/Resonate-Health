import Redis from 'ioredis';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';
dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const createRedisClient = (instanceName) => {
    const client = new Redis(REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        family: 0,
        retryStrategy(times) {
            const delay = Math.min(times * 50, 2000);
            return delay;
        }
    });

    client.on('error', (err) => {
        logger.error(`Redis Error [${instanceName}]`, err);
    });

    client.on('ready', () => {
        logger.info(`Redis Connected [${instanceName}]`, `Successfully connected to Redis`);
    });

    return client;
};

// Default client for raw caching operations
export const redisClient = createRedisClient('CacheClient');

// Connections specifically for BullMQ
export const connection = createRedisClient('BullMQConnection');
