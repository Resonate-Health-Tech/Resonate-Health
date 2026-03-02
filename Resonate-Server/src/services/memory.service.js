import axios from 'axios';
import { getMem0Config, validateMem0Config } from '../config/mem0.config.js';
import { validateMemoryMetadata, sanitizePII, normalizeMetadata, ValidationError } from '../utils/memoryValidator.js';
import { logger } from '../utils/memoryLogger.js';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

class MemoryServiceError extends Error {
    constructor(message, code = 'MEMORY_ERROR', originalError = null) {
        super(message);
        this.name = 'MemoryServiceError';
        this.code = code;
        this.originalError = originalError;
    }
}

const LEGACY_EVENTS_PAGE_SIZE = 100;
const LEGACY_EVENTS_MAX_PAGES = 10;
const LEGACY_FALLBACK_LIMIT = 100;

/**
 * Per-user TTL cache for the legacy event-scraping path.
 *
 * Problem: getLegacyMemoriesFromEvents makes up to 10 sequential HTTP pages
 * to Mem0's /events/ endpoint, then N individual /memories/{id}/ fetches.
 * At 1000 concurrent users that's ~10,000 outbound requests per search wave.
 *
 * Solution: Cache results per userId for 60 seconds. Active users hit the
 * cache on every dashboard refresh; only cold/new users pay the scraping cost.
 */
const LEGACY_CACHE_TTL_MS = 60_000; // 60 seconds
const _legacyCache = new Map(); // userId → { ids: string[], ts: number }

// Evict stale entries every 5 minutes to prevent unbounded growth
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of _legacyCache.entries()) {
        if (now - entry.ts > LEGACY_CACHE_TTL_MS) _legacyCache.delete(key);
    }
}, 5 * 60_000);

/** Hard cap on memory text to prevent unbounded Mem0 payloads */
const MAX_MEMORY_TEXT_LENGTH = 2000;

export class MemoryService {
    constructor() {
        const currentConfig = getMem0Config();
        try {
            const validatedConfig = validateMem0Config();
            this.apiKey = validatedConfig.apiKey;
            this.baseUrl = validatedConfig.baseUrl;

            // Validate agentId format (must be UUID)
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (validatedConfig.agentId && uuidRegex.test(validatedConfig.agentId)) {
                this.agentId = validatedConfig.agentId;
            } else {
                if (validatedConfig.agentId) {
                    logger.warn('INIT', `Invalid Agent ID format: ${validatedConfig.agentId}. Must be a UUID. Proceeding without Agent ID.`);
                }
                this.agentId = undefined;
            }

            this.isAvailable = true;
        } catch (error) {
            logger.error('INIT', 'Failed to initialize MemoryService', { error: error.message });
            this.isAvailable = false;
            this.apiKey = currentConfig.apiKey;
            this.baseUrl = currentConfig.baseUrl;
            this.agentId = undefined;
        }
    }

    extractResults(data) {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.results)) return data.results;
        if (Array.isArray(data?.data)) return data.data;
        return [];
    }

    normalizeMemoryRecord(record) {
        if (!record || typeof record !== 'object') return null;

        return {
            id: record.id,
            memory: record.memory || record.text || record.data?.memory || '',
            user_id: record.user_id,
            metadata: record.metadata || {},
            created_at: record.created_at || null,
            updated_at: record.updated_at || null
        };
    }

    async fetchLegacyMemoryIdsFromEvents(userId) {
        // Cache hit: return previously scraped IDs without re-hitting Mem0
        const cached = _legacyCache.get(userId);
        if (cached && Date.now() - cached.ts < LEGACY_CACHE_TTL_MS) {
            logger.debug('LEGACY_CACHE', `Cache HIT for user ${userId}`);
            return cached.ids;
        }

        const ids = new Set();
        let page = 1;

        while (page <= LEGACY_EVENTS_MAX_PAGES) {
            const response = await axios.get(
                `${this.baseUrl}/events/`,
                {
                    params: {
                        event_type: 'ADD',
                        page,
                        page_size: LEGACY_EVENTS_PAGE_SIZE
                    },
                    headers: this.getHeaders()
                }
            );

            const events = response.data?.results || [];
            if (!events.length) break;

            for (const event of events) {
                if (event?.status !== 'SUCCEEDED') continue;
                if (event?.payload?.user_id !== userId) continue;

                const resultItems = event?.metadata?.results || event?.results || [];
                for (const item of resultItems) {
                    if (item?.id) ids.add(item.id);
                }
            }

            if (!response.data?.next) break;
            page += 1;
        }

        const result = Array.from(ids);
        // Store fresh result in cache
        _legacyCache.set(userId, { ids: result, ts: Date.now() });
        return result;
    }

    async getLegacyMemoriesFromEvents(userId, filters = {}, limit = LEGACY_FALLBACK_LIMIT) {
        try {
            const memoryIds = await this.fetchLegacyMemoryIdsFromEvents(userId);
            if (!memoryIds.length) return [];

            const records = [];
            for (const memoryId of memoryIds.slice(0, limit)) {
                try {
                    const response = await axios.get(
                        `${this.baseUrl}/memories/${memoryId}/`,
                        { headers: this.getHeaders() }
                    );
                    const normalized = this.normalizeMemoryRecord(response.data);
                    if (normalized) records.push(normalized);
                } catch (error) {
                    // Ignore individual memory fetch failures in fallback mode
                    continue;
                }
            }

            let filtered = records;
            if (filters?.category) {
                filtered = filtered.filter(r => r.metadata?.category === filters.category);
            }

            filtered.sort((a, b) => {
                const aTime = new Date(a.created_at || 0).getTime();
                const bTime = new Date(b.created_at || 0).getTime();
                return bTime - aTime;
            });

            return filtered;
        } catch (error) {
            logger.warn('LEGACY_FALLBACK', 'Failed to fetch legacy memories from events', {
                userId,
                error: error.message
            });
            return [];
        }
    }

    applyQueryFallbackFilter(records, query) {
        if (!query || query === '*') return records;

        const q = query.toLowerCase().trim();
        if (!q) return records;

        return records.filter((record) => {
            const text = (record?.memory || '').toLowerCase();
            return text.includes(q);
        });
    }

    getHeaders() {
        return {
            'Authorization': `Token ${this.apiKey}`,
            'Content-Type': 'application/json'
        };
    }

    async retryWithBackoff(operation, maxRetries = MAX_RETRIES) {
        let lastError;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;

                if (error.response?.status === 401 || error.response?.status === 403) {
                    throw new MemoryServiceError('Authentication failed', 'AUTH_ERROR', error);
                }

                if (error.response?.status === 400) {
                    throw new MemoryServiceError('Invalid request', 'VALIDATION_ERROR', error);
                }

                if (attempt < maxRetries - 1) {
                    const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
                    logger.warn('RETRY', `Attempt ${attempt + 1} failed, retrying in ${delay}ms`, {
                        error: error.message,
                        attempt: attempt + 1,
                        maxRetries
                    });
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        throw new MemoryServiceError(
            `Operation failed after ${maxRetries} attempts`,
            'MAX_RETRIES_EXCEEDED',
            lastError
        );
    }

    async addMemory(userId, text, metadata) {
        const startTime = Date.now();

        if (!this.isAvailable) {
            logger.warn('ADD_MEMORY', 'Service unavailable, skipping memory storage');
            return null;
        }

        try {
            const normalizedMetadata = normalizeMetadata(metadata);
            validateMemoryMetadata(normalizedMetadata);

            const sanitizedMetadata = sanitizePII(normalizedMetadata);

            // Hard cap: prevent unbounded payloads from being sent to Mem0
            const safeText = typeof text === 'string' && text.length > MAX_MEMORY_TEXT_LENGTH
                ? text.slice(0, MAX_MEMORY_TEXT_LENGTH)
                : text;

            const payload = {
                messages: [
                    {
                        role: 'user',
                        content: safeText
                    }
                ],
                user_id: userId,
                metadata: sanitizedMetadata
            };

            if (this.agentId) {
                payload.agent_id = this.agentId;
            }

            logger.debug('ADD_MEMORY', 'Adding memory', { userId, category: sanitizedMetadata.category });
            logger.debug('ADD_MEMORY', 'Payload', JSON.stringify(payload, null, 2));

            const response = await this.retryWithBackoff(async () => {
                return await axios.post(
                    `${this.baseUrl}/memories/`,
                    payload,
                    { headers: this.getHeaders() }
                );
            });

            const memoryId = response.data?.id ||
                response.data?.[0]?.id ||
                response.data?.results?.id ||
                response.data?.results?.[0]?.id;

            const eventId = response.data?.event_id || response.data?.[0]?.event_id;
            const status = response.data?.status || response.data?.[0]?.status;

            logger.measureDuration('ADD_MEMORY', startTime);
            logger.info('ADD_MEMORY', 'Memory add request processed', {
                userId,
                memoryId,
                eventId,
                status,
                category: sanitizedMetadata.category
            });

            return {
                success: true,
                memoryId,
                eventId,
                status,
                data: response.data
            };



        } catch (error) {
            if (error.response) {
                logger.error('ADD_MEMORY', 'Mem0 API Error', {
                    status: error.response.status,
                    data: error.response.data
                });
            }
            logger.logError('ADD_MEMORY', error, { userId });

            if (error instanceof ValidationError) {
                throw error;
            }

            if (error instanceof MemoryServiceError) {
                throw error;
            }

            throw new MemoryServiceError('Failed to add memory', 'ADD_ERROR', error);
        }
    }

    async searchMemory(userId, query, filters = {}, limit = 10) {
        const startTime = Date.now();

        if (!this.isAvailable) {
            logger.warn('SEARCH_MEMORY', 'Service unavailable, returning empty results');
            return { results: [] };
        }

        try {
            const payload = {
                query,
                user_id: userId,
                limit
            };

            if (this.agentId) {
                payload.agent_id = this.agentId;
            }

            if (filters.category) {
                payload.filters = { category: filters.category };
            }

            logger.debug('SEARCH_MEMORY', 'Searching memories', { userId, query, filters });

            const response = await this.retryWithBackoff(async () => {
                return await axios.post(
                    `${this.baseUrl}/memories/search/`,
                    payload,
                    { headers: this.getHeaders() }
                );
            });

            const results = this.extractResults(response.data);

            // Skip the legacy cascade entirely if the primary API already returned
            // enough results — this is the common path for active users and avoids
            // up to 10 sequential HTTP pages + N individual fetches to Mem0.
            let finalResults = results;
            if (results.length < limit) {
                const legacyResults = await this.getLegacyMemoriesFromEvents(userId, filters, limit);

                // Merge and deduplicate by ID
                const currentIds = new Set(results.map(r => r.id));
                const uniqueLegacy = legacyResults.filter(r => !currentIds.has(r.id));
                finalResults = [...results, ...uniqueLegacy];
            }

            // Sort combined results by creation date (newest first)
            finalResults.sort((a, b) => {
                const aTime = new Date(a.created_at || 0).getTime();
                const bTime = new Date(b.created_at || 0).getTime();
                return bTime - aTime;
            });

            if (limit && finalResults.length > limit) {
                finalResults = finalResults.slice(0, limit);
            }

            logger.measureDuration('SEARCH_MEMORY', startTime);
            logger.info('SEARCH_MEMORY', 'Search completed', {
                userId,
                resultCount: finalResults.length
            });

            return {
                success: true,
                results: finalResults,
                count: finalResults.length
            };

        } catch (error) {
            logger.logError('SEARCH_MEMORY', error, { userId, query });

            if (error instanceof MemoryServiceError) {
                throw error;
            }

            throw new MemoryServiceError('Failed to search memories', 'SEARCH_ERROR', error);
        }
    }

    async getAllMemories(userId, filters = {}) {
        const startTime = Date.now();

        if (!this.isAvailable) {
            logger.warn('GET_ALL_MEMORIES', 'Service unavailable, returning empty results');
            return { results: [] };
        }

        try {
            const params = {
                user_id: userId
            };

            if (this.agentId) {
                params.agent_id = this.agentId;
            }

            if (filters.category) {
                params.category = filters.category;
            }

            logger.debug('GET_ALL_MEMORIES', 'Fetching all memories', { userId, filters });
            logger.debug('GET_ALL_MEMORIES', 'Params', JSON.stringify(params, null, 2));

            const response = await this.retryWithBackoff(async () => {
                return await axios.get(
                    `${this.baseUrl}/memories/`,
                    {
                        params,
                        headers: this.getHeaders()
                    }
                );
            });

            const results = this.extractResults(response.data);

            // Always merge primary + legacy so no memories are hidden.
            // The 60s TTL cache on fetchLegacyMemoryIdsFromEvents keeps this
            // cheap — the HTTP scrape fires at most once per minute per user.
            const legacyResults = await this.getLegacyMemoriesFromEvents(userId, filters);

            // Deduplicate by ID
            const primaryIds = new Set(results.map(r => r.id));
            const uniqueLegacy = legacyResults.filter(r => !primaryIds.has(r.id));
            let finalResults = [...results, ...uniqueLegacy];


            // Sort combined results by creation date (newest first)
            finalResults.sort((a, b) => {
                const aTime = new Date(a.created_at || 0).getTime();
                const bTime = new Date(b.created_at || 0).getTime();
                return bTime - aTime;
            });

            logger.measureDuration('GET_ALL_MEMORIES', startTime);
            logger.info('GET_ALL_MEMORIES', 'Memories retrieved', {
                userId,
                count: finalResults.length
            });

            return {
                success: true,
                results: finalResults,
                count: finalResults.length
            };

        } catch (error) {
            logger.logError('GET_ALL_MEMORIES', error, { userId });

            if (error instanceof MemoryServiceError) {
                throw error;
            }

            throw new MemoryServiceError('Failed to get memories', 'GET_ERROR', error);
        }
    }

    async getMemoryById(memoryId) {
        const startTime = Date.now();

        if (!this.isAvailable) {
            logger.warn('GET_MEMORY', 'Service unavailable');
            return null;
        }

        try {
            logger.debug('GET_MEMORY', 'Fetching memory by ID', { memoryId });

            const response = await this.retryWithBackoff(async () => {
                return await axios.get(
                    `${this.baseUrl}/memories/${memoryId}/`,
                    { headers: this.getHeaders() }
                );
            });

            logger.measureDuration('GET_MEMORY', startTime);
            logger.info('GET_MEMORY', 'Memory retrieved', { memoryId });

            return {
                success: true,
                data: response.data
            };

        } catch (error) {
            logger.logError('GET_MEMORY', error, { memoryId });

            if (error.response?.status === 404) {
                throw new MemoryServiceError('Memory not found', 'NOT_FOUND', error);
            }

            if (error instanceof MemoryServiceError) {
                throw error;
            }

            throw new MemoryServiceError('Failed to get memory', 'GET_ERROR', error);
        }
    }

    async updateMemory(memoryId, text, metadata) {
        const startTime = Date.now();

        if (!this.isAvailable) {
            logger.warn('UPDATE_MEMORY', 'Service unavailable, skipping update');
            return null;
        }

        try {
            const normalizedMetadata = normalizeMetadata(metadata);
            validateMemoryMetadata(normalizedMetadata);

            const sanitizedMetadata = sanitizePII(normalizedMetadata);

            const payload = {
                text,
                metadata: sanitizedMetadata
            };

            logger.debug('UPDATE_MEMORY', 'Updating memory', { memoryId });

            const response = await this.retryWithBackoff(async () => {
                return await axios.put(
                    `${this.baseUrl}/memories/${memoryId}/`,
                    payload,
                    { headers: this.getHeaders() }
                );
            });

            logger.measureDuration('UPDATE_MEMORY', startTime);
            logger.info('UPDATE_MEMORY', 'Memory updated', { memoryId });

            return {
                success: true,
                data: response.data
            };

        } catch (error) {
            logger.logError('UPDATE_MEMORY', error, { memoryId });

            if (error instanceof ValidationError) {
                throw error;
            }

            if (error.response?.status === 404) {
                throw new MemoryServiceError('Memory not found', 'NOT_FOUND', error);
            }

            if (error instanceof MemoryServiceError) {
                throw error;
            }

            throw new MemoryServiceError('Failed to update memory', 'UPDATE_ERROR', error);
        }
    }

    async deleteMemory(memoryId) {
        const startTime = Date.now();

        if (!this.isAvailable) {
            logger.warn('DELETE_MEMORY', 'Service unavailable, skipping deletion');
            return null;
        }

        try {
            logger.debug('DELETE_MEMORY', 'Deleting memory', { memoryId });

            await this.retryWithBackoff(async () => {
                return await axios.delete(
                    `${this.baseUrl}/memories/${memoryId}/`,
                    { headers: this.getHeaders() }
                );
            });

            logger.measureDuration('DELETE_MEMORY', startTime);
            logger.info('DELETE_MEMORY', 'Memory deleted', { memoryId });

            return {
                success: true,
                memoryId
            };

        } catch (error) {
            logger.logError('DELETE_MEMORY', error, { memoryId });

            if (error.response?.status === 404) {
                throw new MemoryServiceError('Memory not found', 'NOT_FOUND', error);
            }

            if (error instanceof MemoryServiceError) {
                throw error;
            }

            throw new MemoryServiceError('Failed to delete memory', 'DELETE_ERROR', error);
        }
    }

    checkHealth() {
        return {
            available: this.isAvailable,
            configured: !!this.apiKey,
            agentIdPresent: !!this.agentId
        };
    }
}

export { MemoryServiceError };
