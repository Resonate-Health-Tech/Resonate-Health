/**
 * Shared MemoryService singleton.
 *
 * Problem: every controller and service previously called `new MemoryService()`
 * at module load time, creating N separate instances — each with its own config
 * validation, retry state, and outbound HTTP connection pool.
 *
 * Under 1000 concurrent users with 10+ controllers, that's 10+ simultaneous
 * Mem0 connection pools competing for the same rate-limited API key.
 *
 * Solution: export one frozen, shared instance. All callers get the same
 * object — same connection pool, same rate-limit budget, same retry state.
 */
import { MemoryService } from '../memory.service.js';

export const memoryService = new MemoryService();
