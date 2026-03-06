import { Worker } from 'bullmq';
import axios from 'axios';
import { connection } from '../config/redis.js';
import { Diagnostics } from '../models/Diagnostics.js';
import { User } from '../models/User.js';
import { processBiomarkers } from '../utils/biomarkerReference.js';
import { BIOMARKERS_LIST } from '../config/biomarkers.js';
import sendReportReady from '../services/notification.js';
import { DiagnosticsIngestor } from '../services/ingestors/diagnostics.ingestor.js';
import { MemoryService } from '../services/memory.service.js';
import { insightsCacheService } from '../services/insights/insights.cache.service.js';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';
import { redisClient } from '../config/redis.js';

dotenv.config();

const memoryService = new MemoryService();
const diagnosticsIngestor = new DiagnosticsIngestor(memoryService);

// Helper to build the cache key for a user's diagnostics history
const diagCacheKey = (userId, category) => `diag_history:${userId}:${category || 'all'}`;

const processPdfJob = async (job) => {
    const { userId, pdfUrl, category, recordId } = job.data;
    logger.info(`Started processing PDF for record ${recordId} (User: ${userId})`);

    try {
        const user = await User.findOne({ firebaseUid: userId });
        const userGender = user?.gender || null;

        const parsingResponse = await axios.post(
            `${process.env.MICROSERVICE_URL}/parse-report`,
            {
                pdfUrl,
                biomarkers: BIOMARKERS_LIST
            },
            {
                headers: {
                    "x-internal-secret": process.env.INTERNAL_API_SECRET
                },
                timeout: 120000 // 120s timeout for the worker since it runs in the background
            }
        );

        const rawBiomarkers = parsingResponse.data.values || {};

        if (!rawBiomarkers || Object.keys(rawBiomarkers).length === 0) {
            throw new Error("No biomarkers found in the report");
        }

        const processed = processBiomarkers(rawBiomarkers, userGender, null);

        // Update record in database
        const record = await Diagnostics.findById(recordId);
        if (!record) {
            throw new Error(`Diagnostics record ${recordId} not found`);
        }
        record.biomarkers = processed.all;
        record.biomarkersByCategory = processed.byCategory;
        record.status = "completed";
        await record.save();

        // Notifications
        try {
            if (user.phone) {
                await sendReportReady(user.phone);
            } else {
                logger.warn(`Skipped notification: No phone number for user ${userId}`);
            }
        } catch (notifError) {
            logger.error(`Notification error for ${userId}`, notifError);
        }

        // Memory ingestion (same logic as before)
        try {
            if (category === 'cgm') {
                const cgmSummary = {
                    description: `CGM data from report on ${new Date().toISOString().split('T')[0]}`,
                    period: new Date().toISOString().split('T')[0],
                    avg_glucose_mg_dl: processed.all?.avg_glucose?.value ?? null,
                    time_in_range_percent: processed.all?.time_in_range?.value ?? null,
                    spike_count: processed.all?.spike_count?.value ?? null,
                    fasting_glucose_mg_dl: processed.all?.fasting_glucose?.value ?? null
                };
                await diagnosticsIngestor.processCGM(userId, cgmSummary);
                logger.info(`Pushed CGM diagnostics memory for user ${userId}`);
            } else {
                const memoryMarkers = Object.entries(processed.all).map(([key, data]) => ({
                    name: key,
                    value: data.value,
                    unit: data.unit,
                    status: data.status,
                    previous_value: null
                }));

                await diagnosticsIngestor.processReport(userId, {
                    date: new Date().toISOString().split('T')[0],
                    markers: memoryMarkers
                }, category);
                logger.info(`Pushed ${category} report memory for user ${userId}`);
            }
        } catch (memoryError) {
            logger.error(`Memory push error for ${userId}`, memoryError);
        }

        // Clear Redis cache (invalidate cached history)
        await redisClient.del(diagCacheKey(userId, null));
        await redisClient.del(diagCacheKey(userId, record.category));

        // Invalidate insights cache
        insightsCacheService.invalidateCache(userId).catch(err =>
            logger.error('invalidateInsightsCache', 'Failed to invalidate insight cache', err)
        );

        logger.info(`Successfully finished processing PDF for record ${recordId}`);
        return { success: true, recordId };

    } catch (err) {
        logger.error(`Processing error for PDF job ${job.id}`, err.response?.data || err);

        // Update database record to failed
        const record = await Diagnostics.findById(recordId);
        if (record) {
            record.status = "failed";
            await record.save();
        }

        // Rethrow for BullMQ retry/fail tracking
        throw err;
    }
};

export const pdfWorker = new Worker('pdf-parsing-queue', processPdfJob, {
    connection,
    concurrency: 5, // Process up to 5 PDFs at the same time to limit load on microservice/OpenAI
});

pdfWorker.on('completed', (job) => {
    logger.info(`PDF Job ${job.id} completed!`);
});

pdfWorker.on('failed', (job, err) => {
    logger.error(`PDF Job ${job.id} failed with error ${err.message}`);
});
