import React, { useState } from 'react';
import { createDailyLog } from '../api';

const DailyCheckInModal = ({ isOpen, onClose, onCheckInComplete }) => {
    const [formData, setFormData] = useState({
        energyLevel: 5,
        sleepQuality: 5,
        stressLevel: 5,
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
            await createDailyLog({
                ...formData,
                energyLevel: Number(formData.energyLevel),
                sleepQuality: Number(formData.sleepQuality),
                stressLevel: Number(formData.stressLevel)
            });

            onCheckInComplete();
            onClose();
        } catch (err) {
            setError(err.message || "Failed to submit check-in");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700/50 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">


                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="text-2xl font-black text-white mb-1">Daily Check-in</h2>
                <p className="text-slate-400 text-sm mb-6">How are you feeling today?</p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm font-semibold text-slate-300">
                            <label>Energy Level</label>
                            <span className="text-emerald-400">{formData.energyLevel}/10</span>
                        </div>
                        <input
                            type="range"
                            name="energyLevel"
                            min="1"
                            max="10"
                            value={formData.energyLevel}
                            onChange={handleChange}
                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>Exhausted</span>
                            <span>Limitless</span>
                        </div>
                    </div>


                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm font-semibold text-slate-300">
                            <label>Sleep Quality</label>
                            <span className="text-indigo-400">{formData.sleepQuality}/10</span>
                        </div>
                        <input
                            type="range"
                            name="sleepQuality"
                            min="1"
                            max="10"
                            value={formData.sleepQuality}
                            onChange={handleChange}
                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>Terrible</span>
                            <span>Amazing</span>
                        </div>
                    </div>


                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm font-semibold text-slate-300">
                            <label>Stress Level</label>
                            <span className="text-amber-400">{formData.stressLevel}/10</span>
                        </div>
                        <input
                            type="range"
                            name="stressLevel"
                            min="1"
                            max="10"
                            value={formData.stressLevel}
                            onChange={handleChange}
                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>Zen</span>
                            <span>Panicked</span>
                        </div>
                    </div>


                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-300">Notes (Optional)</label>
                        <textarea
                            name="notes"
                            placeholder="Any symptoms, thoughts, or observations?"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="2"
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary transition-all text-sm"
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-emerald-600 text-slate-950 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Saving...' : 'Log It ✓'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DailyCheckInModal;

