
import React, { useEffect, useState } from "react";
import { fetchWeeklyLogs } from "../api";

const WeeklyTrends = ({ refreshTrigger = 0 }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const getLogs = async () => {
            try {
                const data = await fetchWeeklyLogs();
                if (data.success) {
                    setLogs(data.logs);
                } else {
                    setError("Failed to load logs");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        getLogs();
    }, [refreshTrigger]);

    const getMetricColor = (value, type) => {
        if (type === 'stress') {
            if (value <= 4) return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' };
            if (value <= 7) return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' };
            return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' };
        } else {
            if (value >= 7) return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' };
            if (value >= 4) return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' };
            return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' };
        }
    };

    const getMetricIcon = (type) => {
        switch (type) {
            case 'energy':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                );
            case 'sleep':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                );
            case 'stress':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                );
            default:
                return null;
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return {
            day: date.toLocaleDateString("en-US", { weekday: 'short' }),
            date: date.toLocaleDateString("en-US", { month: 'numeric', day: 'numeric' })
        };
    };

    if (loading) {
        return (
            <div className="glass-card rounded-3xl p-6 shimmer">
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-20 bg-slate-800/50 rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-card rounded-3xl p-6 border-red-500/20">
                <div className="flex items-center gap-3 text-red-400">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">{error}</span>
                </div>
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="glass-card rounded-3xl p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/50 flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <p className="text-sm text-slate-400">No logs for this week yet. Start checking in!</p>
            </div>
        );
    }

    return (
        <div className="glass-card rounded-3xl p-6 hover:bg-white/10 transition-all duration-300">
            <div className="space-y-3">
                {logs.map((log, index) => {
                    const dateInfo = formatDate(log.date);
                    const energyColor = getMetricColor(log.energyLevel, 'energy');
                    const sleepColor = getMetricColor(log.sleepQuality, 'sleep');
                    const stressColor = getMetricColor(log.stressLevel, 'stress');

                    return (
                        <div
                            key={log._id}
                            className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl p-4 
                                     hover:border-primary/30 hover:bg-slate-900/80 transition-all duration-300 
                                     hover:scale-[1.02] hover:shadow-premium group"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            {/* Date Header */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center 
                                                  group-hover:bg-primary/20 transition-colors">
                                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-50">{dateInfo.day}</p>
                                        <p className="text-xs text-slate-500">{dateInfo.date}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-3 gap-2">
                                {/* Energy */}
                                <div className={`${energyColor.bg} ${energyColor.border} border rounded-xl p-3 
                                              hover:scale-105 transition-transform duration-200`}>
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <div className={energyColor.text}>
                                            {getMetricIcon('energy')}
                                        </div>
                                        <span className="text-xs font-medium text-slate-400">Energy</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className={`text-xl font-black ${energyColor.text}`}>
                                            {log.energyLevel}
                                        </span>
                                        <span className="text-xs text-slate-500">/10</span>
                                    </div>
                                    {/* Mini bar */}
                                    <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${energyColor.text.replace('text-', 'bg-')} transition-all duration-500`}
                                            style={{ width: `${log.energyLevel * 10}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Sleep */}
                                <div className={`${sleepColor.bg} ${sleepColor.border} border rounded-xl p-3 
                                              hover:scale-105 transition-transform duration-200`}>
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <div className={sleepColor.text}>
                                            {getMetricIcon('sleep')}
                                        </div>
                                        <span className="text-xs font-medium text-slate-400">Sleep</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className={`text-xl font-black ${sleepColor.text}`}>
                                            {log.sleepQuality}
                                        </span>
                                        <span className="text-xs text-slate-500">/10</span>
                                    </div>
                                    {/* Mini bar */}
                                    <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${sleepColor.text.replace('text-', 'bg-')} transition-all duration-500`}
                                            style={{ width: `${log.sleepQuality * 10}%` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Stress */}
                                <div className={`${stressColor.bg} ${stressColor.border} border rounded-xl p-3 
                                              hover:scale-105 transition-transform duration-200`}>
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <div className={stressColor.text}>
                                            {getMetricIcon('stress')}
                                        </div>
                                        <span className="text-xs font-medium text-slate-400">Stress</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className={`text-xl font-black ${stressColor.text}`}>
                                            {log.stressLevel}
                                        </span>
                                        <span className="text-xs text-slate-500">/10</span>
                                    </div>
                                    {/* Mini bar */}
                                    <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${stressColor.text.replace('text-', 'bg-')} transition-all duration-500`}
                                            style={{ width: `${log.stressLevel * 10}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WeeklyTrends;

