import { Intervention } from '../models/Intervention.js';
import { MemoryService } from './memory.service.js';

/** Truncate user-supplied strings to prevent oversized Mem0 payloads */
const trunc = (str, max = 500) =>
    typeof str === 'string' && str.length > max ? str.slice(0, max) : (str ?? '');

export class InterventionService {
    constructor(memoryService) {
        this.memoryService = memoryService || new MemoryService();
    }

    /**
     * Create a new intervention plan
     * @param {string} userId - User ID
     * @param {Object} interventionData - Intervention details
     */
    async createIntervention(userId, interventionData, memoryUserId = userId) {
        try {
            const intervention = new Intervention({
                ...interventionData,
                user: userId,
                status: 'active'
            });

            await intervention.save();

            // Store in Mem0 — truncate user-supplied fields to prevent oversized payloads
            const memoryText = `Intervention: ${trunc(intervention.recommendation)} (Started: ${intervention.startDate.toISOString().split('T')[0]}, Duration: ${intervention.durationDays} days). Reason: ${trunc(intervention.rationale)}`;

            const metadata = {
                category: 'intervention.plan',
                source: 'coach_input', // or system_generated based on logic
                timestamp: new Date().toISOString(),
                module_specific: {
                    intervention_type: intervention.type,
                    recommendation: intervention.recommendation,
                    start_date: intervention.startDate.toISOString().split('T')[0],
                    status: intervention.status,
                    target_metric: intervention.targetMetric,
                    target_value: intervention.targetValue,
                    intervention_id: intervention._id.toString()
                }
            };

            const targetUserId = memoryUserId || userId;
            await this.memoryService.addMemory(targetUserId, memoryText, metadata);

            return intervention;
        } catch (error) {
            console.error('Error creating intervention:', error);
            throw error;
        }
    }

    /**
     * Get active interventions for a user
     * @param {string} userId 
     */
    async getActiveInterventions(userId) {
        try {
            return await Intervention.find({ user: userId, status: 'active' }).sort({ createdAt: -1 });
        } catch (error) {
            console.error('Error fetching active interventions:', error);
            throw error;
        }
    }

    /**
     * Record an outcome for an intervention
     * @param {string} interventionId 
     * @param {Object} outcomeData 
     */
    async recordOutcome(interventionId, outcomeData, memoryUserId = null) {
        try {
            const intervention = await Intervention.findById(interventionId);
            if (!intervention) {
                throw new Error('Intervention not found');
            }

            intervention.outcomes.push({
                date: new Date(),
                metricValue: outcomeData.metricValue,
                notes: outcomeData.notes
            });

            if (outcomeData.status) {
                intervention.status = outcomeData.status;
            }

            // If completed or abandoned, set end date if not present
            if (['completed', 'abandoned'].includes(intervention.status) && !intervention.endDate) {
                intervention.endDate = new Date();
            }

            await intervention.save();

            // Store outcome in Mem0 — truncate user-supplied fields
            const memoryText = `Outcome: ${trunc(intervention.type)} intervention (${intervention.startDate.toISOString().split('T')[0]} to ${new Date().toISOString().split('T')[0]}). Status: ${intervention.status}. Notes: ${trunc(outcomeData.notes)}. Final Value: ${outcomeData.metricValue}`;

            const metadata = {
                category: 'intervention.outcome',
                source: 'user_input',
                timestamp: new Date().toISOString(),
                module_specific: {
                    intervention_id: intervention._id.toString(),
                    intervention_type: intervention.type,
                    outcome: intervention.status === 'completed' ? 'success' : intervention.status,
                    completion_date: new Date().toISOString().split('T')[0],
                    final_metric_value: outcomeData.metricValue
                }
            };

            const targetUserId = memoryUserId || intervention.user.toString();
            await this.memoryService.addMemory(targetUserId, memoryText, metadata);

            return intervention;
        } catch (error) {
            console.error('Error recording outcome:', error);
            throw error;
        }
    }

    /**
     * Analyze effectiveness of an intervention
     * @param {string} interventionId 
     */
    async analyzeEffectiveness(interventionId) {
        // Placeholder for more complex analysis
        const intervention = await Intervention.findById(interventionId);
        if (!intervention) return null;

        // Simple comparison of latest outcome vs target
        const latestOutcome = intervention.outcomes[intervention.outcomes.length - 1];
        if (!latestOutcome) return { effective: false, reason: 'No outcomes recorded' };

        // This logic is simplistic and assumes higher is better or exact match. 
        // Real logic would depend on the metric type (e.g. lower RPE is better, higher sleep is better).
        // For now, returning the raw data for the client/caller to decide.

        return {
            interventionId,
            target: intervention.targetValue,
            actual: latestOutcome.metricValue,
            notes: latestOutcome.notes
        };
    }

    /**
     * Get all interventions for a user
     * @param {string} userId 
     */
    async getInterventions(userId) {
        try {
            return await Intervention.find({ user: userId }).sort({ createdAt: -1 });
        } catch (error) {
            console.error('Error fetching interventions:', error);
            throw error;
        }
    }

    /**
     * Stop/Discontinue an intervention
     * @param {string} interventionId 
     * @param {string} reason 
     */
    async stopIntervention(interventionId, reason, memoryUserId = null) {
        try {
            const intervention = await Intervention.findById(interventionId);
            if (!intervention) throw new Error('Intervention not found');

            intervention.status = 'discontinued';
            intervention.endDate = new Date();
            intervention.discontinuationReason = reason;

            await intervention.save();

            // Mem0 update — truncate user-supplied reason
            const memoryText = `Intervention Discontinued: ${trunc(intervention.type)} - ${trunc(intervention.recommendation)}. Reason: ${trunc(reason)}`;
            const targetUserId = memoryUserId || intervention.user.toString();
            await this.memoryService.addMemory(targetUserId, memoryText, {
                category: 'intervention.outcome',
                source: 'user_input',
                timestamp: new Date().toISOString(),
                module_specific: {
                    intervention_id: intervention._id.toString(),
                    intervention_type: intervention.type,
                    outcome: 'discontinued',
                    completion_date: new Date().toISOString().split('T')[0]
                }
            });

            return intervention;
        } catch (error) {
            console.error('Error stopping intervention:', error);
            throw error;
        }
    }

    /**
     * Update an intervention
     * @param {string} interventionId 
     * @param {Object} updates 
     */
    async updateIntervention(interventionId, updates) {
        try {
            const intervention = await Intervention.findByIdAndUpdate(interventionId, updates, { new: true });
            if (!intervention) throw new Error('Intervention not found');
            return intervention;
        } catch (error) {
            console.error('Error updating intervention:', error);
            throw error;
        }
    }
}
