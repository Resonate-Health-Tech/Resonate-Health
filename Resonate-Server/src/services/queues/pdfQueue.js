import { Queue } from 'bullmq';
import { connection } from '../../config/redis.js';

export const pdfQueue = new Queue('pdf-parsing-queue', { connection });

export const addPdfJob = async (jobName, data) => {
    return await pdfQueue.add(jobName, data, {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
    });
};
