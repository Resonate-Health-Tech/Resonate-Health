import React, { useState, useEffect } from 'react';
import { createIntervention, updateIntervention } from '../api';

export default function AddInterventionModal({ isOpen, onClose, onInterventionAdded, initialData = null }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        type: 'supplement',
        recommendation: '',
        rationale: '',
        startDate: new Date().toISOString().split('T')[0],
        durationDays: 30,
        targetMetric: 'adherence_rate',
        targetValue: 80,
        status: 'active'
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                type: initialData.type || 'supplement',
                recommendation: initialData.recommendation || '',
                rationale: initialData.rationale || '',
                startDate: initialData.startDate ? initialData.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
                durationDays: initialData.durationDays || 30,
                targetMetric: initialData.targetMetric || 'adherence_rate',
                targetValue: initialData.targetValue || 80,
                status: initialData.status || 'active'
            });
        } else {
            // Reset if adding new
            setFormData({
                type: 'supplement',
                recommendation: '',
                rationale: '',
                startDate: new Date().toISOString().split('T')[0],
                durationDays: 30,
                targetMetric: 'adherence_rate',
                targetValue: 80,
                status: 'active'
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Prepare payload - filter out empty endDate if active
            const payload = { ...formData };
            if (payload.status === 'active') {
                payload.endDate = null;
            }

            // If initialData has an _id, it's an update. Otherwise, it's a new intervention (including restarts)
            if (initialData?._id) {
                await updateIntervention(initialData._id, payload);
            } else {
                await createIntervention(payload);
            }

            onInterventionAdded();
            onClose();
        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to save intervention');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h3 className="text-lg font-bold text-[#1A1A18]">
                        {initialData ? 'Edit Intervention' : 'Add New Intervention'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-[#1A1A18] transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                            Type
                        </label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-200 text-[#1A1A18] rounded-xl px-4 py-2.5 
                                     focus:ring-2 focus:ring-[#CADB00]/50 focus:border-[#CADB00] transition-all outline-none appearance-none"
                        >
                            <option value="supplement">💊 Supplement</option>
                            <option value="diet">🥗 Diet / Nutrition</option>
                            <option value="fitness">💪 Fitness / Workout</option>
                            <option value="meditation">🧘 Meditation / Mindfulness</option>
                            <option value="other">⚡ Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                            Recommendation
                        </label>
                        <input
                            type="text"
                            name="recommendation"
                            placeholder="e.g. Take Vitamin D3 5000 IU daily"
                            required
                            value={formData.recommendation}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-200 text-[#1A1A18] rounded-xl px-4 py-2.5 
                                     focus:ring-2 focus:ring-[#CADB00]/50 focus:border-[#CADB00] transition-all outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 text-[#1A1A18] rounded-xl px-4 py-2.5 
                                         focus:ring-2 focus:ring-[#CADB00]/50 focus:border-[#CADB00] transition-all outline-none appearance-none"
                            >
                                <option value="active">🟢 Active (Ongoing)</option>
                                <option value="completed">✅ Completed</option>
                                <option value="discontinued">🛑 Discontinued</option>
                                <option value="paused">⏸️ Paused</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                Start Date
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                required
                                value={formData.startDate}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 text-[#1A1A18] rounded-xl px-4 py-2.5 
                                         focus:ring-2 focus:ring-[#CADB00]/50 focus:border-[#CADB00] transition-all outline-none"
                            />
                        </div>
                    </div>

                    {formData.status !== 'active' && (
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                End Date
                            </label>
                            <input
                                type="date"
                                name="endDate"
                                required={formData.status !== 'active'}
                                value={formData.endDate}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 text-[#1A1A18] rounded-xl px-4 py-2.5 
                                         focus:ring-2 focus:ring-[#CADB00]/50 focus:border-[#CADB00] transition-all outline-none"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                Duration (Days)
                            </label>
                            <input
                                type="number"
                                name="durationDays"
                                placeholder="e.g. 30"
                                value={formData.durationDays}
                                onChange={handleChange}
                                required
                                min="1"
                                className="w-full bg-gray-50 border border-gray-200 text-[#1A1A18] rounded-xl px-4 py-2.5 
                                         focus:ring-2 focus:ring-[#CADB00]/50 focus:border-[#CADB00] transition-all outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                Target Value (%)
                            </label>
                            <input
                                type="number"
                                name="targetValue"
                                placeholder="e.g. 80"
                                value={formData.targetValue}
                                onChange={handleChange}
                                required
                                min="0"
                                max="100"
                                className="w-full bg-gray-50 border border-gray-200 text-[#1A1A18] rounded-xl px-4 py-2.5 
                                         focus:ring-2 focus:ring-[#CADB00]/50 focus:border-[#CADB00] transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                            Target Metric
                        </label>
                        <select
                            name="targetMetric"
                            value={formData.targetMetric}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-200 text-[#1A1A18] rounded-xl px-4 py-2.5 
                                     focus:ring-2 focus:ring-[#CADB00]/50 focus:border-[#CADB00] transition-all outline-none appearance-none"
                        >
                            <option value="adherence_rate">Adherence Rate</option>
                            <option value="completion_rate">Completion Rate</option>
                            <option value="sleep_hours">Sleep Hours</option>
                            <option value="rpe_avg">Average RPE</option>
                            <option value="stress_level">Stress Level</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                            Rationale
                        </label>
                        <textarea
                            name="rationale"
                            rows="3"
                            placeholder="Why is this intervention recommended?"
                            value={formData.rationale}
                            onChange={handleChange}
                            required
                            className="w-full bg-gray-50 border border-gray-200 text-[#1A1A18] rounded-xl px-4 py-2.5 
                                     focus:ring-2 focus:ring-[#CADB00]/50 focus:border-[#CADB00] transition-all outline-none resize-none"
                        ></textarea>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium 
                                     hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-[#CADB00] text-[#1A1A18] font-bold 
                                     hover:bg-[#b5c400] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving...' : (initialData ? 'Update Intervention' : 'Start Intervention')}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}


