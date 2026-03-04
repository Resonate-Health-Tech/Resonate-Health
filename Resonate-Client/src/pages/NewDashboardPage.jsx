import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Heart, Activity, Moon, Zap, ArrowUpRight, Star,
    WifiOff
} from "lucide-react";
import { getWithCookie } from "../api";
import { normalizeFitnessData } from "../utils/fitnessNormalizer";

import Skeleton from "../components/dashboard/Skeleton";
import HealthScoreRing from "../components/dashboard/HealthScoreRing";
import MetricCard from "../components/dashboard/MetricCard";
import MediumRing from "../components/dashboard/MediumRing";
import TrainingDonut from "../components/dashboard/TrainingDonut";
import HRVSparkline from "../components/dashboard/HRVSparkline";
import DailyCheckInCard from "../components/dashboard/DailyCheckInCard";
import { SectionHeader, FilterButtons } from "../components/dashboard/UIComponents";

// ─── HELPERS ────────────────────────────────────────────────────────────────

function timeAgo(dateStr) {
    if (!dateStr) return null;
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diffMs / 3600000);
    const d = Math.floor(diffMs / 86400000);
    if (h < 1) return "Updated just now";
    if (h < 24) return `Updated ${h}h ago`;
    return `Updated ${d}d ago`;
}

function formatTimestamp(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - d) / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    if (diffDays === 1) return `Yesterday ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
    return `${diffDays} days ago`;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function NewDashboardPage() {
    const [recoveryFilter, setRecoveryFilter] = useState("7d");
    const queryClient = useQueryClient();

    // ── Queries ──
    const { data: fitRes, isLoading: fitLoading } = useQuery({
        queryKey: ['fitData'],
        queryFn: () => getWithCookie("/api/fit/getGoogleFitData").catch(() => null),
    });

    const { data: summary, isLoading: summaryLoading } = useQuery({
        queryKey: ['dashboardSummary'],
        queryFn: () => getWithCookie("/api/dashboard/summary").catch(() => null),
    });

    const { data: diagnostics, isLoading: diagLoading } = useQuery({
        queryKey: ['diagnosticsLatest'],
        queryFn: () => getWithCookie("/api/diagnostics/latest").catch(() => null),
    });

    const { data: intRes, isLoading: intLoading } = useQuery({
        queryKey: ['activeInterventions'],
        queryFn: () => getWithCookie("/api/interventions/active").catch(() => null),
    });

    const { data: insightsRes, isLoading: insightsLoading } = useQuery({
        queryKey: ['dailyInsights'],
        queryFn: () => getWithCookie("/api/insights/daily").catch(() => null),
    });

    const { data: logsRes, isLoading: logsLoading } = useQuery({
        queryKey: ['weeklyLogs'],
        queryFn: () => getWithCookie("/api/daily-logs/weekly").catch(() => null),
    });

    const loading = fitLoading || summaryLoading || diagLoading || intLoading || insightsLoading || logsLoading;

    // ── Derived values ──
    const fitness = fitRes ? normalizeFitnessData(fitRes) : null;
    const fitnessConnected = !!fitRes;

    const diagnosticsMeta = summary?.diagnosticsMeta ?? null;
    const healthScore = summary?.healthScore ?? null;

    const interventions = intRes?.interventions || [];
    const insights = insightsRes?.data || [];

    // Daily Logs check
    const todayStr = new Date().toISOString().split("T")[0];
    const todayLog = (logsRes?.logs || []).find(l => new Date(l.date).toISOString().split("T")[0] === todayStr) || null;

    // Insights structure
    const topInsight = insights?.[0] ?? null;
    const insightBlocks = insights?.slice(1, 3) ?? [];

    const metricCards = [
        {
            label: "HRV",
            value: fitness?.currentHRV ?? null,
            unit: "ms",
            trend: fitness?.hrvTrendPct ? `${fitness.hrvTrendPct > 0 ? "+" : ""}${fitness.hrvTrendPct}%` : null,
            trendPositive: fitness?.hrvTrendPct > 0,
            color: "#CADB00",
            iconBg: "rgba(202,219,0,0.12)",
            icon: <Activity size={18} strokeWidth={1.7} color="#CADB00" />,
        },
        {
            label: "Resting HR",
            value: fitness?.restingHR ?? null,
            unit: "bpm",
            trend: fitness?.restingHRTrend ? `${fitness.restingHRTrend > 0 ? "+" : ""}${fitness.restingHRTrend} bpm` : null,
            trendPositive: fitness?.restingHRTrend < 0,
            color: "#7C6FCD",
            iconBg: "rgba(217,95,120,0.12)",
            icon: <Heart size={18} strokeWidth={1.7} color="#D95F78" />,
        },
        {
            label: "Sleep",
            value: fitness?.sleepHours ? Number(fitness.sleepHours).toFixed(1) : null,
            unit: "hrs",
            trend: fitness?.sleepTrend ? `${fitness.sleepTrend > 0 ? "+" : ""}${fitness.sleepTrend}h` : null,
            trendPositive: fitness?.sleepTrend > 0,
            color: "#6B94E8",
            iconBg: "rgba(124,111,205,0.12)",
            icon: <Moon size={18} strokeWidth={1.7} color="#7C6FCD" />,
        },
        {
            label: "Cardio Load",
            value: fitness?.cardioLoad ?? null,
            unit: "min",
            trend: fitness?.cardioLoadTrend ? `${fitness.cardioLoadTrend > 0 ? "+" : ""}${fitness.cardioLoadTrend} min` : null,
            trendPositive: fitness?.cardioLoadTrend > 0,
            color: "#F59E42",
            iconBg: "rgba(224,122,58,0.12)",
            icon: <Zap size={18} strokeWidth={1.7} color="#E07A3A" />,
        },
    ];

    const activeInterventions = interventions;
    const totalDays = activeInterventions.reduce((sum, i) => sum + Math.max(0, Math.floor((Date.now() - new Date(i.startDate).getTime()) / 86400000)), 0);
    const avgDuration = activeInterventions.length > 0 ? Math.round(totalDays / activeInterventions.length) : null;
    const avgCompliance = activeInterventions.length > 0 ? Math.round(activeInterventions.reduce((sum, i) => {
        if (i.compliancePct !== undefined) return sum + i.compliancePct;
        const daysSince = Math.max(1, Math.floor((Date.now() - new Date(i.startDate)) / 86400000));
        return sum + Math.min(((i.outcomes?.length || 0) / daysSince) * 100, 100);
    }, 0) / activeInterventions.length) : null;

    const tb = summary?.trainingBalance;
    const workoutsThisWeek = summary?.completedWorkoutsThisWeek ?? null;
    const totalWorkoutsThisWeek = summary?.totalWorkoutsThisWeek ?? null;
    const recoveryStatus = summary?.recoveryStatus ?? null;
    const recentActivity = summary?.recentActivity || [];

    const diagScore = diagnosticsMeta?.score ?? null;
    const flaggedCount = diagnosticsMeta?.flaggedCount ?? 0;
    const diagDots = diagnosticsMeta?.dots ?? [];
    const diagUpdated = diagnosticsMeta?.lastUpdated ?? null;
    const nutritionSummary = summary?.nutritionSummary ?? null;

    const glucoseBiomarker = diagnostics?.biomarkers?.glucose_fasting || diagnostics?.biomarkers?.glucose || diagnostics?.biomarkers?.fasting_glucose || null;
    const filteredWeeklyHRV = recoveryFilter === "30d" ? (fitness?.weeklyHRV || []) : fitness?.weeklyHRV;

    const recoveryLabel = () => {
        const r = fitness?.recoveryPct;
        if (r == null) return null;
        if (r >= 80) return "Optimal";
        if (r >= 60) return "Good";
        return "Low";
    };

    return (
        <div className="max-w-[1400px] w-full">
            <style>{`
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>

            {!loading && (
                <DailyCheckInCard
                    todayLog={todayLog}
                    onLogged={() => queryClient.invalidateQueries({ queryKey: ['weeklyLogs'] })}
                />
            )}

            {/* ── Row 1: Health Score + Intelligence Summary ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
                <div className="bg-white/75 backdrop-blur-md border-[1px] border-white/60 shadow-sm rounded-[20px] p-6 flex flex-col items-center justify-center min-h-[280px]">
                    <HealthScoreRing score={healthScore} loading={loading} />
                    <span className="overline-label mt-3.5 mb-2">Health Score</span>
                    {!loading && healthScore !== null ? (
                        <span className="badge-lime">
                            <ArrowUpRight size={12} strokeWidth={2} /> Based on your diagnostics
                        </span>
                    ) : !loading ? (
                        <span className="text-[12px] text-black/40">Upload a report to see your score</span>
                    ) : <Skeleton w={140} h={22} r={9999} />}
                </div>

                <div className="bg-white/75 backdrop-blur-md border-[1px] border-white/60 shadow-sm rounded-2xl p-6 lg:col-span-2">
                    <div className="flex items-center justify-between mb-3.5">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-[#7C6FCD]/10 flex items-center justify-center">
                                <Star size={14} strokeWidth={1.7} color="#7C6FCD" />
                            </div>
                            <h3 className="font-['DM_Sans'] text-[15px] font-semibold text-[#1A1A18] m-0">Intelligence Summary</h3>
                        </div>
                        {topInsight && <span className="text-[11px] text-black/35">{timeAgo(new Date().toISOString())}</span>}
                    </div>

                    {loading ? (
                        <div className="flex flex-col gap-2 mb-4">
                            <Skeleton /><Skeleton w="80%" /><Skeleton w="60%" />
                        </div>
                    ) : topInsight ? (
                        <p className="text-[13px] leading-[1.7] text-black/70 mb-4">
                            {topInsight.description || topInsight.message || topInsight.content}
                        </p>
                    ) : (
                        <p className="text-[13px] text-black/50 mb-4 leading-[1.7]">
                            Your insights are being generated. Check back soon or visit the Insights page.
                        </p>
                    )}

                    {!loading && insightBlocks.length > 0 && (
                        <div className="flex gap-3 mb-4">
                            {insightBlocks.slice(0, 2).map((ins, i) => (
                                <div key={i} className={`flex-1 ${i === 0 ? "insight-block-lime" : "insight-block-purple"}`}>
                                    <div className="text-[13px] font-semibold text-[#1A1A18] mb-0.5">{ins.title}</div>
                                    <div className="text-[12px] text-black/50">
                                        {(ins.description || ins.message || ins.content || "").slice(0, 80)}…
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <Link to="/insights" className="cta-link">View full insights →</Link>
                </div>
            </div>

            {/* ── Row 2: Physiological Signals ── */}
            {!fitnessConnected && (
                <div className="bg-white/75 backdrop-blur-md shadow-sm rounded-2xl p-4 mb-5 flex items-center gap-3">
                    <WifiOff size={18} color="#E07A3A" />
                    <span className="text-[13px] text-black/70">Connect Google Fit to see real physiological signals.</span>
                    <Link to="/fitness" className="ml-auto text-[13px] font-bold text-[#1A1A18] underline">Connect →</Link>
                </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                {metricCards.map(m => <MetricCard key={m.label} {...m} loading={loading} />)}
            </div>

            {/* ── Row 3: Recovery & Sleep | Nutrition ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                <div className="bg-white/75 backdrop-blur-md shadow-sm rounded-[20px] p-6">
                    <SectionHeader title="Recovery & Sleep">
                        <FilterButtons active={recoveryFilter} setActive={setRecoveryFilter} options={["7d", "30d"]} />
                    </SectionHeader>

                    <div className="flex gap-6 mb-5">
                        <MediumRing value={fitness?.recoveryPct ?? null} max={100} label="Recovery %" color="#CADB00" trackColor="rgba(202,219,0,0.12)" />
                        <MediumRing value={fitness?.sleepHours ?? null} max={10} label="Sleep hrs" color="#7C6FCD" trackColor="rgba(124,111,205,0.12)" />

                        <div className="flex-1 flex flex-col justify-center gap-2">
                            <div>
                                <div className="flex justify-between mb-1.5">
                                    <span className="text-[12px] text-black/55">Sleep Quality</span>
                                    <span className="text-[12px] font-semibold text-[#1A1A18]">
                                        {loading ? "—" : (fitness?.sleepQualityPct != null ? `${fitness.sleepQualityPct}%` : "—")}
                                    </span>
                                </div>
                                <div className="progress-track">
                                    <div className="progress-fill-purple" style={{ width: fitness?.sleepQualityPct != null ? `${fitness.sleepQualityPct}%` : "0%", height: "100%", borderRadius: 9999 }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-1.5">
                                    <span className="text-[12px] text-black/55">Deep Sleep</span>
                                    <span className="text-[12px] font-semibold text-[#1A1A18]">
                                        {loading ? "—" : (fitness?.deepSleepPct != null ? `${fitness.deepSleepPct}%` : "—")}
                                    </span>
                                </div>
                                <div className="progress-track">
                                    <div className="progress-fill-lavender" style={{ width: fitness?.deepSleepPct != null ? `${fitness.deepSleepPct}%` : "0%", height: "100%", borderRadius: 9999 }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <HRVSparkline weeklyHRV={filteredWeeklyHRV} />

                    <p className="text-[13px] italic text-black/50 mt-2.5">
                        {fitness?.recoveryPct != null ? `Recovery at ${fitness.recoveryPct}% — ${recoveryLabel() === "Optimal" ? "great shape for today." : recoveryLabel() === "Good" ? "room to improve." : "consider a rest day."}` : "Connect Google Fit to see recovery trends."}
                    </p>
                </div>

                <div className="bg-white/75 backdrop-blur-md shadow-sm rounded-[20px] p-6">
                    <SectionHeader title="Nutrition Intelligence">
                        <span className="badge-neutral">7-day avg</span>
                    </SectionHeader>

                    <div className="flex flex-col gap-3.5 mb-4">
                        <div>
                            <div className="flex justify-between mb-1.5">
                                <span className="text-[13px] text-black/70">Food Tracking</span>
                                <span className="text-[13px] font-semibold text-[#1A1A18]">
                                    {loading ? "—" : nutritionSummary ? `${nutritionSummary.logsThisWeek}/7 days` : "No logs yet"}
                                </span>
                            </div>
                            <div className="progress-track">
                                <div className="progress-fill-lime" style={{ width: loading ? "0%" : `${nutritionSummary?.trackingAdherencePct ?? 0}%`, height: "100%", borderRadius: 9999 }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-[13px] text-black/70">Glucose Stability</span>
                                    {glucoseBiomarker && (
                                        <span className={`badge-${glucoseBiomarker.status === "normal" ? "green" : "amber"} px-2 py-0.5 text-[11px]`}>
                                            {glucoseBiomarker.status === "normal" ? "Stable" : "Monitor"}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[13px] font-semibold text-[#1A1A18]">
                                    {loading ? "—" : glucoseBiomarker ? `${glucoseBiomarker.value} ${glucoseBiomarker.unit}` : "—"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <p className="text-[13px] text-black/55 leading-[1.6] mb-3.5">
                        {insights?.find(i => ["protein", "nutrition", "plateau", "carb", "hydration"].some(k => i.title?.toLowerCase().includes(k)))?.message
                            || "See your full nutrition breakdown and AI-generated meal suggestions."}
                    </p>

                    <div className="flex gap-2 flex-wrap mb-3.5">
                        {nutritionSummary ? (
                            [
                                { label: "Protein", value: `~${nutritionSummary.avgDailyProteinG}g/day` },
                                { label: "Carbs", value: `~${nutritionSummary.avgDailyCarbsG}g/day` },
                                { label: "Fats", value: `~${nutritionSummary.avgDailyFatsG}g/day` },
                                { label: "Calories", value: `~${nutritionSummary.avgDailyCalories} kcal` },
                            ].map(m => (
                                <span key={m.label} className="text-[12px] font-medium px-3 py-1.5 rounded-full bg-black/5 text-black/70">
                                    <span className="text-black/40 mr-1">{m.label}:</span>{m.value}
                                </span>
                            ))
                        ) : (
                            ["Protein", "Carbs", "Fats"].map(m => (
                                <span key={m} className="text-[12px] font-medium px-3 py-1.5 rounded-full bg-black/5 text-black/45">{m}</span>
                            ))
                        )}
                    </div>
                    <Link to="/nutrition" className="cta-link block">View full nutrition →</Link>
                </div>
            </div>

            {/* ── Row 4: Diagnostics ── */}
            <Link to="/diagnostics" className="bg-white/75 backdrop-blur-md shadow-sm rounded-[20px] p-6 flex items-center justify-between cursor-pointer no-underline mb-5 transition-shadow hover:shadow-xl block">
                <div>
                    <span className="overline-label">Diagnostics</span>
                    <div className="flex items-baseline gap-1.5 my-1.5">
                        {loading ? <Skeleton w={60} h={28} r={6} /> : (
                            <>
                                <span className="font-['DM_Serif_Display'] text-[28px] text-[#1A1A18]">{diagScore !== null ? diagScore : "—"}</span>
                                <span className="text-[13px] text-black/45">/ 100</span>
                            </>
                        )}
                    </div>
                    <p className="text-[12px] text-black/45 m-0 mb-3">
                        {diagUpdated ? `Last updated ${timeAgo(diagUpdated)?.replace("Updated ", "")}` : "No report uploaded yet"}
                    </p>
                    <div className="flex gap-1.5">
                        {loading ? [1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} w={10} h={10} r={9999} />) :
                            diagDots.length > 0
                                ? diagDots.map((dot, i) => (
                                    <div key={i} className={`w-2.5 h-2.5 rounded-full ${dot === "normal" ? "bg-[#34C759]" : dot === "flagged" ? "bg-[#F59E42]" : "bg-[#EF4444]"}`} />
                                ))
                                : <span className="text-[12px] text-black/40">Upload a report to see biomarker status</span>
                        }
                    </div>
                </div>

                <div className="flex flex-col items-end gap-2.5">
                    {!loading && flaggedCount > 0 && <span className="badge-amber">⚠ {flaggedCount} Flagged</span>}
                    <span className="cta-link">View Report →</span>
                </div>
            </Link>

            {/* ── Row 5: Training & Interventions ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
                <div className="bg-white/75 backdrop-blur-md shadow-sm rounded-3xl p-6">
                    <SectionHeader title="Active Experiments" />
                    {loading ? (
                        <div className="flex flex-col gap-3">
                            <Skeleton /><Skeleton w="80%" /><Skeleton />
                        </div>
                    ) : activeInterventions.length === 0 ? (
                        <div className="text-center py-8 text-black/40 text-[13px]">
                            No active experiments yet.<br />
                            <Link to="/interventions" className="text-[#1A1A18] font-bold underline">Start one →</Link>
                        </div>
                    ) : (
                        <>
                            <div className="flex mb-5 border border-black/5 rounded-xl overflow-hidden bg-white/50">
                                {[
                                    { label: "Active Protocols", value: String(activeInterventions.length) },
                                    { label: "Compliance", value: avgCompliance !== null ? `${avgCompliance}%` : "—", lime: true },
                                    { label: "Avg Duration", value: avgDuration !== null ? `${avgDuration}d` : "—" },
                                ].map((s, i, arr) => (
                                    <div key={s.label} className={`flex-1 p-3 text-center ${i < arr.length - 1 ? 'border-r border-black/5' : ''}`}>
                                        <div className="text-[12px] text-black/45 mb-1">{s.label}</div>
                                        <div className={`font-['DM_Serif_Display'] text-[22px] ${s.lime ? 'text-[#CADB00]' : 'text-[#1A1A18]'}`}>{s.value}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col gap-3.5">
                                {activeInterventions.slice(0, 3).map((exp, i) => {
                                    const daysSince = Math.max(1, Math.floor((Date.now() - new Date(exp.startDate)) / 86400000));
                                    const compliance = exp.compliancePct ?? Math.min(Math.round(((exp.outcomes?.length || 0) / daysSince) * 100), 100);
                                    const colors = ["bg-[#7C6FCD]", "bg-[#CADB00]", "bg-[#E07A3A]"];
                                    return (
                                        <div key={exp._id}>
                                            <div className="flex justify-between mb-1.5">
                                                <span className="text-[13px] font-medium text-[#1A1A18]">{exp.recommendation?.slice(0, 45) || exp.type}</span>
                                                <span className="text-[12px] text-black/45">{compliance}%</span>
                                            </div>
                                            <div className="progress-track">
                                                <div className={`h-full rounded-full transition-all duration-800 ${colors[i % 3]}`} style={{ width: `${compliance}%` }} />
                                            </div>
                                            <p className="text-[11px] text-black/40 mt-1 mb-0">
                                                {exp.type} · Day {daysSince} / {exp.durationDays}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                    <Link to="/interventions" className="text-[12px] text-black/40 block mt-4 no-underline">Manage Experiments →</Link>
                </div>

                <div className="bg-white/75 backdrop-blur-md shadow-sm rounded-3xl p-6">
                    <SectionHeader title="Training Balance" />
                    <div className="flex items-center gap-5 mb-5">
                        <TrainingDonut aerobic={tb?.aerobic ?? 0} anaerobic={tb?.anaerobic ?? 0} rest={tb?.rest ?? 0} noData={!tb || totalWorkoutsThisWeek === 0} />
                        <div className="flex-1 flex flex-col gap-2.5">
                            {loading ? [1, 2, 3].map(k => <Skeleton key={k} />) : tb && totalWorkoutsThisWeek > 0 ? (
                                [
                                    { color: "bg-[#CADB00]", label: "Aerobic", pct: `${tb.aerobic}%` },
                                    { color: "bg-[#E07A3A]", label: "Anaerobic", pct: `${tb.anaerobic}%` },
                                    { color: "bg-black/10", label: "Rest / Recovery", pct: `${tb.rest}%` },
                                ].map(s => (
                                    <div key={s.label} className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full shrink-0 ${s.color}`} />
                                        <span className="text-[13px] text-black/70 flex-1">{s.label}</span>
                                        <span className="text-[13px] font-semibold text-[#1A1A18]">{s.pct}</span>
                                    </div>
                                ))
                            ) : <span className="text-[13px] text-black/40">Log workouts to see your training distribution.</span>}
                        </div>
                    </div>
                    {!loading && tb && totalWorkoutsThisWeek > 0 && (
                        <span className="badge-lime">{tb.aerobic >= 50 ? "Training load well balanced this week" : "Add more aerobic sessions this week"}</span>
                    )}
                </div>
            </div>

            {/* ── Row 6: Recent Activity & Summary ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white/75 backdrop-blur-md shadow-sm rounded-[20px] p-6">
                    <SectionHeader title="Recent Activity" />
                    {loading ? (
                        <div className="flex flex-col gap-3">
                            {[1, 2, 3].map(k => <Skeleton key={k} h={50} />)}
                        </div>
                    ) : recentActivity.length === 0 ? (
                        <div className="text-center py-8 text-black/40 text-[13px]">No recent activity. Connect Google Fit or generate a workout.</div>
                    ) : (
                        <div className="flex flex-col">
                            {recentActivity.map((act, i) => (
                                <div key={i} className={`flex gap-3 ${i < recentActivity.length - 1 ? 'pb-4' : ''}`}>
                                    <div className="flex flex-col items-center">
                                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: act.color }} />
                                        {i < recentActivity.length - 1 && <div className="w-[1px] flex-1 mt-1 bg-black/10" />}
                                    </div>
                                    <div className="flex-1 pb-1">
                                        <div className="text-[13px] font-semibold text-[#1A1A18]">{act.title}</div>
                                        <div className="text-[13px] text-black/50 mt-0.5">{act.desc}</div>
                                        <div className="text-[11px] text-black/40 mt-0.5">{formatTimestamp(act.timestamp)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white/75 backdrop-blur-md shadow-sm rounded-[20px] p-6">
                    <SectionHeader title="Weekly Summary" />
                    <div className="flex flex-col">
                        {[
                            { label: "Overall Health", value: loading ? <Skeleton w={60} h={18} r={6} /> : healthScore !== null ? <span className="text-[#34C759] font-semibold text-[13px]">↑ Score: {healthScore}/100</span> : <span className="text-[13px] text-black/40">No data</span>, border: true },
                            { label: "Workouts This Week", value: loading ? <Skeleton w={60} h={18} r={6} /> : workoutsThisWeek !== null ? <span className="font-['DM_Serif_Display'] text-[15px] font-bold">{workoutsThisWeek}/{totalWorkoutsThisWeek || 0}</span> : <span className="text-[13px] text-black/40">—</span>, border: true },
                            { label: "Recovery Status", value: loading ? <Skeleton w={70} h={22} r={9999} /> : recoveryStatus ? <span className={`badge-${recoveryStatus === "Optimal" ? "lime" : "neutral"}`}>{recoveryStatus}</span> : <span className="text-[13px] text-black/40">—</span>, border: false },
                        ].map(row => (
                            <div key={row.label} className={`flex items-center justify-between py-4 ${row.border ? 'border-b border-black/5' : ''}`}>
                                <span className="text-[13px] text-black/65">{row.label}</span>
                                {row.value}
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 p-3.5 bg-[#CADB00]/10 rounded-xl">
                        <p className="text-[13px] leading-[1.6] text-black/60 m-0">
                            {insights.length > 0 ? (insights[0]?.description || insights[0]?.message || "").slice(0, 140) : "Complete your first week to see a personalized weekly summary here."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
