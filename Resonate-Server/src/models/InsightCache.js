import mongoose from 'mongoose';

/**
 * InsightCache — persists generated insights per user in MongoDB.
 *
 * Why MongoDB instead of node-cache?
 *   node-cache is in-process memory and resets on every server restart.
 *   MongoDB persists across restarts, and the TTL index handles automatic cleanup.
 *
 * expiresAt TTL index: MongoDB will auto-delete documents 24 hours after creation.
 * This is a safety net; explicit invalidation (on data change) is the primary mechanism.
 */

const insightSchema = new mongoose.Schema(
    {
        type: { type: String },        // 'critical' | 'warning' | 'action' | 'suggestion' | 'positive'
        title: { type: String },
        body: { type: String },
        category: { type: String },
        icon: { type: String }
    },
    { _id: false }
);

const insightCacheSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true,          // one cache doc per user
            index: true
        },

        insights: {
            type: [insightSchema],
            default: []
        },

        /**
         * ISO timestamp of the data event that last triggered (re)generation.
         * Used to detect whether the cache is stale relative to the latest data change.
         */
        dataVersion: {
            type: String,
            default: null
        },

        generatedAt: {
            type: Date,
            default: Date.now
        },

        /**
         * MongoDB TTL index: documents are automatically deleted 24 hours after generatedAt.
         * This guarantees insights are never served for more than one day without regeneration.
         */
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
    },
    { timestamps: true }
);

// TTL index — MongoDB auto-deletes the document when `expiresAt` is reached
insightCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const InsightCache = mongoose.model('InsightCache', insightCacheSchema);
