import React, { useState, useEffect } from 'react';
import { getWithCookie, postWithCookie } from '../api';

export default function WaterTracker({ externalData, setExternalData }) {
    const [localData, setLocalData] = useState({ amountMl: 0, goalMl: 2500 });
    const [loading, setLoading] = useState(true);
    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [newGoal, setNewGoal] = useState(0);
    const [waterHistory, setWaterHistory] = useState([]);
    const [todayLogs, setTodayLogs] = useState([]);
    const [hoveredBar, setHoveredBar] = useState(null);

    const isControlled = !!externalData;
    const data = isControlled ? externalData : localData;
    const updateData = isControlled ? setExternalData : setLocalData;

    useEffect(() => {
        if (!isControlled) {
            fetchWaterData();
        } else {
            setNewGoal(externalData.goalMl || 2500);
            setLoading(false);
        }
    }, [externalData, isControlled]);

    const fetchWaterData = async () => {
        try {
            const res = await getWithCookie('/api/water');
            if (res && res.today) {
                const fetchedData = {
                    amountMl: res.today.amountMl || 0,
                    goalMl: res.today.goalMl || 2500
                };
                updateData(fetchedData);
                setNewGoal(fetchedData.goalMl);
            }
            if (res && res.history) {
                setWaterHistory(res.history);
            }
            if (res && res.today && res.today.logs) {
                setTodayLogs(res.today.logs);
            }
        } catch (error) {
            console.error("Failed to fetch water data", error);
        } finally {
            setLoading(false);
        }
    };

    const updateGoal = async () => {
        try {
            const res = await postWithCookie('/api/water/goal', { goalMl: parseInt(newGoal) });
            if (res) {
                updateData({ ...data, goalMl: res.goalMl || parseInt(newGoal) });
            }
            setIsEditingGoal(false);
        } catch (error) {
            console.error("Failed to set goal", error);
        }
    };

    const progress = data.goalMl ? Math.min((data.amountMl / data.goalMl) * 100, 100) : 0;
    const remaining = Math.max((data.goalMl || 0) - (data.amountMl || 0), 0);

    // Build last 7 days chart data from real API history
    const last7DaysData = (() => {
        const fallbackGoal = data.goalMl || 2500;
        const today = new Date();
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(today);
            d.setDate(today.getDate() - (6 - i));
            const dateStr = d.toISOString().split('T')[0];
            const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
            const entry = waterHistory.find(w => w.date === dateStr);
            if (!entry) return { pct: 0, label: dayLabel, amountMl: 0 };
            const goal = entry.goalMl || fallbackGoal;
            return {
                pct: Math.min(Math.round((entry.amountMl / goal) * 100), 100),
                label: dayLabel,
                amountMl: entry.amountMl
            };
        });
    })();

    if (loading) return null;

    return (
        <div className="bg-white/40 border border-[#1A1A18]/10 rounded-[28px] p-6 lg:p-10 relative">
            <h2 className="text-[22px] font-bold text-[#1A1A18] mb-8">Hydration Log</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

                {/* Circular Progress */}
                <div className="flex items-center justify-center md:justify-start">
                    <div className="relative w-36 h-36">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="72" cy="72" r="64"
                                fill="none"
                                stroke="#F1ECE4"
                                strokeWidth="12"
                            />
                            <circle
                                cx="72" cy="72" r="64"
                                fill="none"
                                stroke="#A195F9"
                                strokeWidth="12"
                                strokeDasharray={`${2 * Math.PI * 64}`}
                                strokeDashoffset={`${2 * Math.PI * 64 * (1 - progress / 100)}`}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[24px] font-bold text-[#1A1A18]">{Math.round(progress)}%</span>
                        </div>
                    </div>
                </div>

                {/* Vertical Stats */}
                <div className="flex flex-col justify-center gap-6">
                    <div>
                        <p className="text-[13px] text-[#1A1A18]/60 mb-1">Logged</p>
                        <p className="text-[22px] font-bold text-[#1A1A18] leading-none">{data.amountMl}ml</p>
                    </div>
                    <div>
                        <p className="text-[13px] text-[#1A1A18]/60 mb-1">Goal</p>
                        <p className="text-[22px] font-bold text-[#1A1A18] leading-none">{data.goalMl}ml</p>
                    </div>
                    <div>
                        <p className="text-[13px] text-[#1A1A18]/60 mb-1">Remaining</p>
                        <p className="text-[22px] font-bold text-[#1A1A18] leading-none">{remaining}ml</p>
                    </div>
                </div>

                {/* Small Bar Chart */}
                <div className="flex flex-col justify-center items-center md:items-end w-full">
                    <div className="w-full max-w-[200px]">
                        <p className="text-[13px] text-[#1A1A18]/60 mb-4 text-left">Last 7 Days</p>
                        <div className="flex items-end justify-between h-24 gap-1.5 w-full relative">
                            {last7DaysData.map((item, i) => (
                                <div
                                    key={i}
                                    className="relative flex-1 flex flex-col justify-end h-full cursor-default"
                                    onMouseEnter={() => setHoveredBar(i)}
                                    onMouseLeave={() => setHoveredBar(null)}
                                >
                                    {/* Tooltip */}
                                    {hoveredBar === i && (
                                        <div className="absolute -top-14 left-1/2 -translate-x-1/2 z-30 bg-[#1A1A18] text-white px-2.5 py-1.5 rounded-xl text-[12px] shadow-lg whitespace-nowrap">
                                            <span className="font-semibold block">{item.label}</span>
                                            <span style={{ color: '#A195F9' }}>{item.amountMl}ml</span>
                                        </div>
                                    )}
                                    {/* Background wash */}
                                    {hoveredBar === i && (
                                        <div className="absolute inset-0 bg-black/5 rounded-t-sm" />
                                    )}
                                    {/* Bar */}
                                    <div
                                        className="w-full bg-[#A195F9] rounded-t-sm transition-all duration-200"
                                        style={{ height: `${item.pct || 2}%`, opacity: hoveredBar === i ? 0.75 : 1 }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <hr className="border-[#1A1A18]/20 my-6" />

            {/* Timeline & Actions */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-6 text-[13px] text-[#1A1A18]/70 font-medium overflow-x-auto pb-2 custom-scrollbar">
                    {todayLogs.length > 0 ? (
                        todayLogs.map((log, i) => (
                            <span key={i} className="whitespace-nowrap">
                                {log.time} · {log.amountMl}ml
                            </span>
                        ))
                    ) : (
                        <span className="whitespace-nowrap text-[#1A1A18]/40 italic">No entries logged today</span>
                    )}
                </div>

                {isEditingGoal ? (
                    <div className="flex items-center gap-3">
                        <input
                            type="number"
                            value={newGoal}
                            onChange={(e) => setNewGoal(e.target.value)}
                            className="border border-[#1A1A18]/20 rounded-lg px-3 py-1.5 text-[14px] w-24 outline-none focus:border-[#CADB00]"
                            autoFocus
                        />
                        <button onClick={updateGoal} className="text-[#CADB00] font-bold text-[14px]">Save</button>
                        <button onClick={() => setIsEditingGoal(false)} className="text-[#1A1A18]/50 font-medium text-[14px]">Cancel</button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsEditingGoal(true)}
                        className="text-[14px] font-semibold text-[#1A1A18] hover:text-[#CADB00] w-fit text-left transition-colors"
                    >
                        Set Goal
                    </button>
                )}
            </div>
        </div>
    );
}
