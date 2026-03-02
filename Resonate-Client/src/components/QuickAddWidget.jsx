import React, { useState } from 'react';
import { createIntervention } from '../api';
import AddInterventionModal from './AddInterventionModal';

const COMMON_INTERVENTIONS = [
    { name: 'Vitamin D3', type: 'supplement', icon: '☀️', defaultDosage: '5000 IU', defaultFreq: 'Daily' },
    { name: 'Magnesium', type: 'supplement', icon: '💊', defaultDosage: '400mg', defaultFreq: 'Nightly' },
    { name: 'Creatine', type: 'supplement', icon: '⚡', defaultDosage: '5g', defaultFreq: 'Daily' },
    { name: 'Keto Diet', type: 'diet', icon: '🥑', defaultDosage: '', defaultFreq: 'Daily' },
    { name: 'Meditation', type: 'meditation', icon: '🧘', defaultDosage: '10 mins', defaultFreq: 'Daily' },
];

export default function QuickAddWidget({ onInterventionAdded }) {
    const [loading, setLoading] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleQuickAdd = async (item) => {
        if (loading) return;
        setLoading(item.name);

        try {
            await createIntervention({
                type: item.type,
                recommendation: `${item.name} - ${item.defaultDosage} ${item.defaultFreq}`,
                rationale: `Quick add intervention for ${item.name}`,
                startDate: new Date().toISOString().split('T')[0],
                durationDays: 30, // Default 30-day intervention
                targetMetric: item.type === 'supplement' ? 'adherence_rate' : 'completion_rate',
                targetValue: 80, // 80% adherence/completion target
                status: 'active',
            });

            if (onInterventionAdded) onInterventionAdded();
            alert(`Started ${item.name}!`);
        } catch (error) {
            console.error(error);
            alert("Failed to add intervention");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="relative bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 mb-6 overflow-hidden shadow-xl">

            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-emerald-500/5 pointer-events-none" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-black text-slate-50 tracking-tight">Quick Add</h3>
                    </div>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 custom-scrollbar">
                    {COMMON_INTERVENTIONS.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => handleQuickAdd(item)}
                            disabled={loading !== null}
                            className="flex-shrink-0 flex flex-col items-center justify-center w-28 h-32 rounded-2xl 
                                     bg-gradient-to-br from-slate-800/90 via-slate-800/70 to-slate-900/90 
                                     ring-2 ring-slate-700/60 shadow-lg
                                     hover:ring-primary/70 hover:from-slate-800 hover:to-slate-800/90 hover:scale-105
                                     hover:shadow-2xl hover:shadow-primary/20
                                     transition-all duration-300 active:scale-95 group relative overflow-hidden
                                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >

                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 via-primary/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            <div className="relative z-10 flex flex-col items-center justify-center gap-2 px-2">
                                <span className="text-4xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 drop-shadow-lg">
                                    {item.icon}
                                </span>

                                <span className="text-xs font-bold text-slate-300 text-center leading-tight group-hover:text-white transition-colors">
                                    {loading === item.name ? (
                                        <span className="flex flex-col items-center gap-1">
                                            <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span className="text-primary text-[10px]">Adding...</span>
                                        </span>
                                    ) : (
                                        item.name
                                    )}
                                </span>
                            </div>
                        </button>
                    ))}


                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex-shrink-0 flex flex-col items-center justify-center w-28 h-32 rounded-2xl 
                                 border-2 border-dashed border-slate-600/60 bg-slate-800/40
                                 hover:border-primary/60 hover:bg-slate-800/60 hover:scale-105
                                 transition-all duration-300 active:scale-95 group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="relative z-10 flex flex-col items-center justify-center gap-2">
                            <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center group-hover:border-primary/60 group-hover:bg-primary/20 transition-all duration-300 group-hover:rotate-90">
                                <svg className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <span className="text-xs font-bold text-slate-400 group-hover:text-primary transition-colors">
                                Custom
                            </span>
                        </div>
                    </button>
                </div>
            </div>

            <AddInterventionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onInterventionAdded={onInterventionAdded}
            />
        </div>
    );
}

