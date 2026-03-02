import { MemoryService } from "../memory.service.js";
import { logger } from "../../utils/memoryLogger.js";

/**
 * Service to handle memory hygiene, deduplication, and cleanup
 */
export class MemoryHygieneService {
    constructor(memoryService) {
        this.memoryService = memoryService || new MemoryService();
    }

    /**
     * Check if a similar memory already exists to prevent duplication
     * @param {string} userId
     * @param {string} text
     * @param {Object} metadata
     * @returns {Promise<boolean>} true if duplicate found
     */
    async isDuplicate(userId, text, metadata) {
        try {
            const searchResults = await this.memoryService.searchMemory(userId, text, {
                category: metadata.category
            }, 5);

            if (!searchResults || !searchResults.results) return false;

            for (const result of searchResults.results) {
                if (result.score > 0.95 && result.memory === text) {
                    logger.warn('HYGIENE', 'Duplicate memory detected', { userId, text });
                    return true;
                }

                // Check if module_specific data is identical for same date
                if (metadata.module_specific && result.metadata && result.metadata.module_specific) {
                    const meta1 = JSON.stringify(metadata.module_specific);
                    const meta2 = JSON.stringify(result.metadata.module_specific);
                    if (meta1 === meta2 && metadata.category === result.metadata.category) {
                        logger.warn('HYGIENE', 'Duplicate metadata detected', { userId });
                        return true;
                    }
                }
            }

            return false;
        } catch (error) {
            logger.error('HYGIENE', 'Duplicate check failed', error);
            return false; // Fail open to avoid losing data
        }
    }

    /**
     * Delete memories older than retention period
     * @param {string} userId
     * @param {number} retentionDays default 730 (2 years)
     * @returns {Promise<{ deleted: number, failed: number }>}
     */
    async cleanupOldMemories(userId, retentionDays = 730) {
        logger.info('HYGIENE', `Starting old memory cleanup for user ${userId} (retention: ${retentionDays} days)`);

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

        let deleted = 0;
        let failed = 0;

        try {
            const { results } = await this.memoryService.getAllMemories(userId);

            const oldMemories = results.filter(record => {
                const createdAt = record.created_at ? new Date(record.created_at) : null;
                return createdAt && createdAt < cutoffDate;
            });

            logger.info('HYGIENE', `Found ${oldMemories.length} memories older than ${retentionDays} days`, { userId });

            for (const record of oldMemories) {
                try {
                    await this.memoryService.deleteMemory(record.id);
                    deleted++;
                } catch (err) {
                    logger.warn('HYGIENE', `Failed to delete memory ${record.id}`, { error: err.message });
                    failed++;
                }
            }

            logger.info('HYGIENE', `Old memory cleanup complete`, { userId, deleted, failed });
            return { deleted, failed };

        } catch (error) {
            logger.error('HYGIENE', 'cleanupOldMemories failed', { userId, error: error.message });
            return { deleted, failed };
        }
    }

    /**
     * Delete low confidence memories
     * @param {string} userId
     * @param {number} threshold default 0.7
     * @returns {Promise<{ deleted: number, failed: number }>}
     */
    async cleanupLowConfidence(userId, threshold = 0.7) {
        logger.info('HYGIENE', `Starting low-confidence cleanup for user ${userId} (threshold: ${threshold})`);

        let deleted = 0;
        let failed = 0;

        try {
            const { results } = await this.memoryService.getAllMemories(userId);

            const lowConfidenceMemories = results.filter(record => {
                const confidence = record.metadata?.confidence;
                // Only delete if confidence is explicitly set and below threshold
                return typeof confidence === 'number' && confidence < threshold;
            });

            logger.info('HYGIENE', `Found ${lowConfidenceMemories.length} low-confidence memories`, { userId, threshold });

            for (const record of lowConfidenceMemories) {
                try {
                    await this.memoryService.deleteMemory(record.id);
                    deleted++;
                } catch (err) {
                    logger.warn('HYGIENE', `Failed to delete memory ${record.id}`, { error: err.message });
                    failed++;
                }
            }

            logger.info('HYGIENE', `Low-confidence cleanup complete`, { userId, deleted, failed });
            return { deleted, failed };

        } catch (error) {
            logger.error('HYGIENE', 'cleanupLowConfidence failed', { userId, error: error.message });
            return { deleted, failed };
        }
    }
}
