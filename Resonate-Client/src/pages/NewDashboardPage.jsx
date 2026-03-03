import React, { useContext, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../App";
import {
    Heart, Activity, Moon, Zap, ArrowUpRight, Star,
    Clock, TrendingUp, AlertTriangle, Wifi, WifiOff,
    CheckCircle, PenLine
} from "lucide-react";
import { getWithCookie, postWithCookie } from "../api";
import { normalizeFitnessData } from "../utils/fitnessNormalizer";

// ─── STYLE CONSTANTS ──────────────────────────────────────────────────────────

const GLASS = {
    background: "rgba(255, 255, 255, 0.75)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.60)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.05)",
};

const SERIF = { fontFamily: "'DM Serif Display', serif", fontWeight: 400 };
const SANS = { fontFamily: "'DM Sans', sans-serif" };

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

// ─── SKELETON ────────────────────────────────────────────────────────────────

function Skeleton({ w = "100%", h = 20, r = 8 }) {
    return (
        <div style={{
            width: w, height: h, borderRadius: r,
            background: "linear-gradient(90deg, rgba(26,26,24,0.06) 25%, rgba(26,26,24,0.10) 50%, rgba(26,26,24,0.06) 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.4s ease-in-out infinite",
        }} />
    );
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function HealthScoreRing({ score, loading }) {
    const r = 70;
    const circ = 2 * Math.PI * r;
    const offset = score !== null ? circ * (1 - score / 100) : circ;

    return (
        <div style={{ width: 160, height: 160, position: "relative", flexShrink: 0 }}>
            <svg width="160" height="160"
                style={{ transform: "rotate(-90deg)", filter: "drop-shadow(0 0 8px rgba(202,219,0,0.40))" }}
            >
                <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(26,26,24,0.07)" strokeWidth="12" />
                <circle
                    cx="80" cy="80" r={r} fill="none"
                    stroke={score !== null ? "#CADB00" : "rgba(26,26,24,0.10)"} strokeWidth="12"
                    strokeDasharray={circ} strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
                />
            </svg>
            <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
            }}>
                {loading
                    ? <Skeleton w={60} h={44} r={8} />
                    : score !== null
                        ? <span style={{ ...SERIF, fontSize: 44, color: "#1A1A18", lineHeight: 1 }}>{score}</span>
                        : <span style={{ fontSize: 13, color: "rgba(26,26,24,0.35)", textAlign: "center" }}>No data</span>
                }
            </div>
        </div>
    );
}

function MetricCard({ label, value, unit, trend, trendPositive, color, iconBg, icon, loading }) {
    return (
        <div style={{ ...GLASS, borderRadius: 20, padding: 20, borderTop: `3px solid ${color}`, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="overline-label">{label}</span>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {icon}
                </div>
            </div>
            {loading
                ? <Skeleton w={80} h={32} r={6} />
                : value !== null
                    ? (
                        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                            <span style={{ ...SERIF, fontSize: 28, color: "#1A1A18" }}>{value}</span>
                            <span style={{ fontSize: 12, color: "rgba(26,26,24,0.45)" }}>{unit}</span>
                        </div>
                    )
                    : <span style={{ fontSize: 13, color: "rgba(26,26,24,0.35)" }}>Not connected</span>
            }
            {!loading && trend !== null && (
                <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    padding: "4px 10px", borderRadius: 9999, fontSize: 12, fontWeight: 600,
                    background: trendPositive ? "rgba(202,219,0,0.10)" : "rgba(26,26,24,0.06)",
                    color: trendPositive ? "#3D4000" : "rgba(26,26,24,0.50)",
                    alignSelf: "flex-start",
                }}>
                    {trendPositive ? "↑" : "↓"} {trend}
                </span>
            )}
        </div>
    );
}

function MediumRing({ value, label, max, color, trackColor }) {
    const r = 40;
    const circ = 2 * Math.PI * r;
    const pct = value !== null ? Math.min(value / max, 1) : 0;
    const offset = circ * (1 - pct);
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ width: 96, height: 96, position: "relative" }}>
                <svg width="96" height="96" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="48" cy="48" r={r} fill="none" stroke={trackColor} strokeWidth="8" />
                    <circle cx="48" cy="48" r={r} fill="none"
                        stroke={value !== null ? color : "rgba(26,26,24,0.08)"} strokeWidth="8"
                        strokeDasharray={circ} strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
                    />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ ...SERIF, fontSize: 18, fontWeight: 700, color: "#1A1A18" }}>
                        {value !== null
                            ? (typeof value === "number" && value % 1 !== 0 ? value.toFixed(1) : value)
                            : "—"}
                    </span>
                </div>
            </div>
            <span style={{ fontSize: 12, color: "rgba(26,26,24,0.50)" }}>{label}</span>
        </div>
    );
}

function SectionHeader({ title, children }) {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h3 style={{ ...SANS, fontSize: 15, fontWeight: 600, color: "#1A1A18", margin: 0 }}>{title}</h3>
            {children}
        </div>
    );
}

function FilterButtons({ active, setActive, options }) {
    return (
        <div style={{ display: "flex", gap: 4 }}>
            {options.map(opt => (
                <button key={opt} onClick={() => setActive(opt)}
                    className={active === opt ? "filter-btn-active" : "filter-btn-inactive"}>
                    {opt}
                </button>
            ))}
        </div>
    );
}

// HRV sparkline from real weeklyHRV array
function HRVSparkline({ weeklyHRV }) {
    const values = (weeklyHRV || []).filter(v => v !== null && v !== undefined);
    if (values.length < 2) {
        return (
            <div style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 12, color: "rgba(26,26,24,0.35)" }}>Not enough HRV data yet</span>
            </div>
        );
    }
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const W = 280, H = 58, pad = 10;
    const points = values.map((v, i) => {
        const x = pad + (i / (values.length - 1)) * (W - 2 * pad);
        const y = H - pad - ((v - min) / range) * (H - 2 * pad);
        return `${x},${y}`;
    }).join(" ");
    const polyPoints = `${points} ${W - pad},${H} ${pad},${H}`;

    return (
        <svg viewBox={`0 0 ${W} ${H + 10}`} className="w-full" style={{ height: 64, overflow: "visible" }}>
            <defs>
                <linearGradient id="hrv-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(202,219,0,0.18)" />
                    <stop offset="100%" stopColor="rgba(202,219,0,0)" />
                </linearGradient>
            </defs>
            <polyline points={points} fill="none" stroke="#CADB00" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
            <polygon points={polyPoints} fill="url(#hrv-grad)" />
        </svg>
    );
}

// Training balance donut from real percentages
function TrainingDonut({ aerobic = 0, anaerobic = 0, rest = 0, noData = false }) {
    const r = 60, cx = 65, cy = 65, circ = 2 * Math.PI * r;
    const aePct = aerobic / 100, anPct = anaerobic / 100;
    return (
        <div style={{ width: 130, height: 130, position: "relative", flexShrink: 0 }}>
            <svg viewBox="0 0 130 130" width="130" height="130" style={{ transform: "rotate(-90deg)" }}>
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(26,26,24,0.08)" strokeWidth="16" />
                {!noData && (
                    <>
                        <circle cx={cx} cy={cy} r={r} fill="none"
                            stroke="#CADB00" strokeWidth="16"
                            strokeDasharray={`${circ * aePct} ${circ * (1 - aePct)}`}
                            strokeLinecap="round" />
                        <circle cx={cx} cy={cy} r={r} fill="none"
                            stroke="#E07A3A" strokeWidth="16"
                            strokeDasharray={`${circ * anPct} ${circ * (1 - anPct)}`}
                            strokeDashoffset={`-${circ * (aePct + 0.02)}`}
                            strokeLinecap="round" />
                    </>
                )}
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#1A1A18", textAlign: "center" }}>
                    {noData ? "No data" : (aerobic > 0 ? "Balanced" : "—")}
                </span>
            </div>
        </div>
    );
}

// ─── DAILY CHECK-IN CARD ─────────────────────────────────────────────────────

const SLIDER_META = [
    { key: "energyLevel", label: "Energy", low: "Exhausted", high: "Limitless", color: "#CADB00", track: "rgba(202,219,0,0.15)" },
    { key: "sleepQuality", label: "Sleep", low: "Terrible", high: "Amazing", color: "#7C6FCD", track: "rgba(124,111,205,0.15)" },
    { key: "stressLevel", label: "Stress", low: "Zen", high: "Panicked", color: "#E07A3A", track: "rgba(224,122,58,0.15)" },
];

function DailyCheckInCard({ todayLog, onLogged }) {
    const [values, setValues] = useState({ energyLevel: 5, sleepQuality: 5, stressLevel: 5, notes: "" });
    const [submitting, setSubmitting] = useState(false);
    const [expanded, setExpanded] = useState(!todayLog);
    const [submitted, setSubmitted] = useState(!!todayLog);

    const currentLog = todayLog || (submitted ? values : null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await postWithCookie("/api/daily-logs", {
                energyLevel: Number(values.energyLevel),
                sleepQuality: Number(values.sleepQuality),
                stressLevel: Number(values.stressLevel),
                notes: values.notes || undefined,
            });
            setSubmitted(true);
            setExpanded(false);
            if (onLogged) onLogged();
        } catch (err) {
            console.error("Check-in failed:", err);
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted || todayLog) {
        const log = currentLog;
        return (
            <div style={{
                ...GLASS, borderRadius: 20, padding: "16px 24px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 20, gap: 16,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <CheckCircle size={18} color="#CADB00" strokeWidth={2} />
                    <span style={{ ...SANS, fontSize: 13, fontWeight: 600, color: "#1A1A18" }}>Today's check-in logged</span>
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                    {SLIDER_META.map(m => (
                        <div key={m.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                            <span style={{ fontSize: 16, fontWeight: 700, color: m.color, ...SERIF }}>
                                {log?.[m.key] ?? values[m.key]}<span style={{ fontSize: 10, color: "rgba(26,26,24,0.35)" }}>/10</span>
                            </span>
                            <span style={{ fontSize: 11, color: "rgba(26,26,24,0.40)" }}>{m.label}</span>
                        </div>
                    ))}
                </div>
                <button onClick={() => setExpanded(e => !e)}
                    style={{ fontSize: 12, color: "rgba(26,26,24,0.40)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                    <PenLine size={13} />Edit
                </button>
                {expanded && (
                    <form onSubmit={handleSubmit}
                        style={{
                            position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, zIndex: 20,
                            ...GLASS, borderRadius: 20, padding: 24, display: "flex", flexDirection: "column", gap: 16
                        }}>
                        {SLIDER_META.map(m => (
                            <SliderRow key={m.key} meta={m} value={values[m.key]}
                                onChange={v => setValues(p => ({ ...p, [m.key]: v }))} />
                        ))}
                        <button type="submit" disabled={submitting}
                            style={{
                                alignSelf: "flex-end", padding: "8px 20px", borderRadius: 9999, fontSize: 13, fontWeight: 700,
                                background: "#1A1A18", color: "#CADB00", border: "none", cursor: submitting ? "not-allowed" : "pointer"
                            }}>
                            {submitting ? "Saving…" : "Update"}
                        </button>
                    </form>
                )}
            </div>
        );
    }

    return (
        <div style={{ ...GLASS, borderRadius: 20, padding: 24, marginBottom: 20, position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                        width: 28, height: 28, borderRadius: 8, background: "rgba(202,219,0,0.12)",
                        display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                        <PenLine size={13} color="#CADB00" strokeWidth={2} />
                    </div>
                    <div>
                        <h3 style={{ ...SANS, fontSize: 15, fontWeight: 600, color: "#1A1A18", margin: 0 }}>Daily Check-in</h3>
                        <p style={{ fontSize: 12, color: "rgba(26,26,24,0.45)", margin: 0 }}>How are you feeling today? This feeds your AI insights.</p>
                    </div>
                </div>
                <span className="badge-neutral">Takes 10 sec</span>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
                    {SLIDER_META.map(m => (
                        <SliderRow key={m.key} meta={m} value={values[m.key]}
                            onChange={v => setValues(p => ({ ...p, [m.key]: v }))} />
                    ))}
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <input
                        placeholder="Any notes? (symptoms, mood, observations…)"
                        value={values.notes}
                        onChange={e => setValues(p => ({ ...p, notes: e.target.value }))}
                        style={{
                            flex: 1, fontSize: 13, padding: "10px 14px", borderRadius: 10,
                            border: "1px solid rgba(26,26,24,0.10)", background: "rgba(255,255,255,0.50)",
                            outline: "none", color: "#1A1A18", fontFamily: "'DM Sans', sans-serif"
                        }}
                    />
                    <button type="submit" disabled={submitting}
                        style={{
                            padding: "10px 24px", borderRadius: 9999, fontSize: 13, fontWeight: 700,
                            background: "#1A1A18", color: "#CADB00", border: "none",
                            cursor: submitting ? "not-allowed" : "pointer", whiteSpace: "nowrap",
                            opacity: submitting ? 0.6 : 1, transition: "opacity 0.2s"
                        }}>
                        {submitting ? "Logging…" : "Log it"}
                    </button>
                </div>
            </form>
        </div>
    );
}

function SliderRow({ meta, value, onChange }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1A18", ...SANS }}>{meta.label}</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: meta.color, ...SERIF }}>{value}</span>
            </div>
            <input type="range" min="1" max="10" value={value}
                onChange={e => onChange(Number(e.target.value))}
                style={{ width: "100%", accentColor: meta.color, height: 4, cursor: "pointer" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: "rgba(26,26,24,0.35)" }}>{meta.low}</span>
                <span style={{ fontSize: 11, color: "rgba(26,26,24,0.35)" }}>{meta.high}</span>
            </div>
        </div>
    );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function NewDashboardPage() {
    const [recoveryFilter, setRecoveryFilter] = useState("7d");

    // Data state
    const [fitness, setFitness] = useState(null);
    const [summary, setSummary] = useState(null);
    const [diagnostics, setDiagnostics] = useState(null);
    const [interventions, setInterventions] = useState(null);
    const [insights, setInsights] = useState(null);
    const [todayLog, setTodayLog] = useState(null);

    // Loading state per section
    const [loading, setLoading] = useState(true);
    const [fitnessConnected, setFitnessConnected] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [fitRes, summaryRes, diagRes, intRes, insRes, logsRes] = await Promise.allSettled([
                    getWithCookie("/api/fit/getGoogleFitData"),
                    getWithCookie("/api/dashboard/summary"),
                    getWithCookie("/api/diagnostics/latest"),
                    getWithCookie("/api/interventions/active"),
                    getWithCookie("/api/insights/daily"),
                    getWithCookie("/api/daily-logs/weekly"),
                ]);

                if (fitRes.status === "fulfilled" && fitRes.value) {
                    setFitness(normalizeFitnessData(fitRes.value));
                } else {
                    setFitnessConnected(false);
                }
                if (summaryRes.status === "fulfilled") setSummary(summaryRes.value);
                if (diagRes.status === "fulfilled") setDiagnostics(diagRes.value);
                if (intRes.status === "fulfilled") setInterventions(intRes.value?.interventions || []);
                if (insRes.status === "fulfilled") setInsights(insRes.value?.data || []);

                // Detect if user already logged today
                if (logsRes.status === "fulfilled") {
                    const todayStr = new Date().toISOString().split("T")[0];
                    const todayEntry = (logsRes.value?.logs || []).find(l =>
                        new Date(l.date).toISOString().split("T")[0] === todayStr
                    );
                    if (todayEntry) setTodayLog(todayEntry);
                }
            } catch (e) {
                console.error("Dashboard fetch error:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    // ── Derived values ────────────────────────────────────────────────────────

    const healthScore = summary?.healthScore ?? null;
    const diagMeta = summary?.diagnosticsMeta ?? null;

    // Insights: top insight for summary paragraph, rest for highlight blocks
    const topInsight = insights?.[0] ?? null;
    const insightBlocks = insights?.slice(1, 3) ?? [];

    // Metric cards
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
            trendPositive: fitness?.restingHRTrend < 0, // lower HR trend is positive
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

    // Experiment stats
    const activeInterventions = interventions || [];
    const totalDays = activeInterventions.reduce((sum, i) => {
        const start = new Date(i.startDate);
        return sum + Math.max(0, Math.floor((Date.now() - start.getTime()) / 86400000));
    }, 0);
    const avgDuration = activeInterventions.length > 0
        ? Math.round(totalDays / activeInterventions.length)
        : null;
    // Fix 3: use server-computed compliancePct; fall back to frontend calc if missing
    const avgCompliance = activeInterventions.length > 0
        ? Math.round(activeInterventions.reduce((sum, i) => {
            if (i.compliancePct !== undefined) return sum + i.compliancePct;
            const outcomes = i.outcomes?.length || 0;
            const daysSince = Math.max(1, Math.floor((Date.now() - new Date(i.startDate)) / 86400000));
            return sum + Math.min((outcomes / daysSince) * 100, 100);
        }, 0) / activeInterventions.length)
        : null;

    // Training balance
    const tb = summary?.trainingBalance;
    const workoutsThisWeek = summary?.completedWorkoutsThisWeek ?? null;
    const totalWorkoutsThisWeek = summary?.totalWorkoutsThisWeek ?? null;
    const recoveryStatus = summary?.recoveryStatus ?? null;

    // Recent activity
    const recentActivity = summary?.recentActivity || [];

    // Diagnostics
    const diagScore = diagMeta?.score ?? null;
    const flaggedCount = diagMeta?.flaggedCount ?? 0;
    const diagDots = diagMeta?.dots ?? [];
    const diagUpdated = diagMeta?.lastUpdated ?? null;

    // Nutrition summary (from food logs)
    const nutritionSummary = summary?.nutritionSummary ?? null;

    // Fix 5: glucose fallback chain — normalise different key names from PDF parser
    const glucoseBiomarker = diagnostics?.biomarkers?.glucose_fasting
        || diagnostics?.biomarkers?.glucose
        || diagnostics?.biomarkers?.fasting_glucose
        || null;

    // Fix 4: 7d/30d filter drives the HRV sparkline window
    const filteredWeeklyHRV = recoveryFilter === "30d"
        ? (fitness?.weeklyHRV || [])  // extend when 30d sync is available
        : fitness?.weeklyHRV;

    const recoveryLabel = () => {
        const r = fitness?.recoveryPct;
        if (r === null || r === undefined) return null;
        if (r >= 80) return "Optimal";
        if (r >= 60) return "Good";
        return "Low";
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div style={{ maxWidth: 1400 }}>
            <style>{`
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>

            {/* ── Daily Check-in (always first) ── */}
            {!loading && (
                <DailyCheckInCard
                    todayLog={todayLog}
                    onLogged={() => setTodayLog({ energyLevel: null, sleepQuality: null, stressLevel: null })}
                />
            )}

            {/* ── Row 1: Health Score + Intelligence Summary ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

                {/* Health Score */}
                <div style={{ ...GLASS, borderRadius: 20, padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 280 }}>
                    <HealthScoreRing score={healthScore} loading={loading} />
                    <span className="overline-label" style={{ marginTop: 14, marginBottom: 8 }}>Health Score</span>
                    {!loading && healthScore !== null ? (
                        <span className="badge-lime">
                            <ArrowUpRight size={12} strokeWidth={2} /> Based on your diagnostics
                        </span>
                    ) : !loading ? (
                        <span style={{ fontSize: 12, color: "rgba(26,26,24,0.40)" }}>Upload a report to see your score</span>
                    ) : <Skeleton w={140} h={22} r={9999} />}
                </div>

                {/* Intelligence Summary */}
                <div style={{ ...GLASS, borderRadius: 16, padding: 24 }} className="lg:col-span-2">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(124,111,205,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Star size={14} strokeWidth={1.7} color="#7C6FCD" />
                            </div>
                            <h3 style={{ ...SANS, fontSize: 15, fontWeight: 600, color: "#1A1A18", margin: 0 }}>Intelligence Summary</h3>
                        </div>
                        {topInsight && <span style={{ fontSize: 11, color: "rgba(26,26,24,0.35)" }}>{timeAgo(new Date().toISOString())}</span>}
                    </div>

                    {loading ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                            <Skeleton /><Skeleton w="80%" /><Skeleton w="60%" />
                        </div>
                    ) : topInsight ? (
                        <p style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(26,26,24,0.70)", marginBottom: 16 }}>
                            {/* Fix 2: insight rules use `message`, older entries may use `description` or `content` */}
                            {topInsight.description || topInsight.message || topInsight.content}
                        </p>
                    ) : (
                        <p style={{ fontSize: 13, color: "rgba(26,26,24,0.50)", marginBottom: 16, lineHeight: 1.7 }}>
                            Your insights are being generated. Check back soon or visit the Insights page.
                        </p>
                    )}

                    {!loading && insightBlocks.length > 0 && (
                        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                            {insightBlocks.slice(0, 2).map((ins, i) => (
                                <div key={i} className={i === 0 ? "insight-block-lime" : "insight-block-purple"} style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1A1A18", marginBottom: 2 }}>
                                        {ins.title}
                                    </div>
                                    <div style={{ fontSize: 12, color: "rgba(26,26,24,0.50)" }}>
                                        {/* Fix 2: normalise message/description/content across all insight rules */}
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
                <div style={{ ...GLASS, borderRadius: 16, padding: 16, marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
                    <WifiOff size={18} color="#E07A3A" />
                    <span style={{ fontSize: 13, color: "rgba(26,26,24,0.70)" }}>
                        Connect Google Fit to see real physiological signals.
                    </span>
                    <Link to="/fitness" style={{ marginLeft: "auto", fontSize: 13, fontWeight: 700, color: "#1A1A18", textDecoration: "underline" }}>
                        Connect →
                    </Link>
                </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                {metricCards.map(m => (
                    <MetricCard key={m.label} {...m} loading={loading} />
                ))}
            </div>

            {/* ── Row 3: Recovery & Sleep | Nutrition ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

                {/* Recovery & Sleep */}
                <div style={{ ...GLASS, borderRadius: 20, padding: 24 }}>
                    <SectionHeader title="Recovery & Sleep">
                        <FilterButtons active={recoveryFilter} setActive={setRecoveryFilter} options={["7d", "30d"]} />
                    </SectionHeader>

                    <div style={{ display: "flex", gap: 24, marginBottom: 20 }}>
                        <MediumRing
                            value={fitness?.recoveryPct ?? null}
                            max={100} label="Recovery %"
                            color="#CADB00" trackColor="rgba(202,219,0,0.12)"
                        />
                        <MediumRing
                            value={fitness?.sleepHours ?? null}
                            max={10} label="Sleep hrs"
                            color="#7C6FCD" trackColor="rgba(124,111,205,0.12)"
                        />

                        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 8 }}>
                            {/* Sleep Quality */}
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                    <span style={{ fontSize: 12, color: "rgba(26,26,24,0.55)" }}>Sleep Quality</span>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: "#1A1A18" }}>
                                        {loading ? "—" : (fitness?.sleepQualityPct != null ? `${fitness.sleepQualityPct}%` : "—")}
                                    </span>
                                </div>
                                <div className="progress-track">
                                    <div className="progress-fill-purple" style={{
                                        width: fitness?.sleepQualityPct != null ? `${fitness.sleepQualityPct}%` : "0%",
                                        height: "100%", borderRadius: 9999, transition: "width 0.8s ease-out"
                                    }} />
                                </div>
                            </div>
                            {/* Deep Sleep */}
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                    <span style={{ fontSize: 12, color: "rgba(26,26,24,0.55)" }}>Deep Sleep</span>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: "#1A1A18" }}>
                                        {loading ? "—" : (fitness?.deepSleepPct != null ? `${fitness.deepSleepPct}%` : "—")}
                                    </span>
                                </div>
                                <div className="progress-track">
                                    <div className="progress-fill-lavender" style={{
                                        width: fitness?.deepSleepPct != null ? `${fitness.deepSleepPct}%` : "0%",
                                        height: "100%", borderRadius: 9999
                                    }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fix 4: pass filter-aware HRV array */}
                    <HRVSparkline weeklyHRV={filteredWeeklyHRV} />

                    <p style={{ fontSize: 13, fontStyle: "italic", color: "rgba(26,26,24,0.50)", marginTop: 10 }}>
                        {fitness?.recoveryPct !== null && fitness?.recoveryPct !== undefined
                            ? `Recovery at ${fitness.recoveryPct}% — ${recoveryLabel() === "Optimal" ? "great shape for today." : recoveryLabel() === "Good" ? "room to improve." : "consider a rest day."}`
                            : "Connect Google Fit to see recovery trends."}
                    </p>
                </div>

                {/* Nutrition Intelligence — real data from food logs */}
                <div style={{ ...GLASS, borderRadius: 20, padding: 24 }}>
                    <SectionHeader title="Nutrition Intelligence">
                        <span className="badge-neutral">7-day avg</span>
                    </SectionHeader>

                    <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 16 }}>
                        {/* Food Tracking Adherence */}
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                <span style={{ fontSize: 13, color: "rgba(26,26,24,0.70)" }}>Food Tracking</span>
                                <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1A18" }}>
                                    {loading ? "—" : nutritionSummary
                                        ? `${nutritionSummary.logsThisWeek}/7 days`
                                        : "No logs yet"}
                                </span>
                            </div>
                            <div className="progress-track">
                                <div className="progress-fill-lime" style={{
                                    width: loading ? "0%" : `${nutritionSummary?.trackingAdherencePct ?? 0}%`,
                                    height: "100%", borderRadius: 9999, transition: "width 0.8s ease-out"
                                }} />
                            </div>
                        </div>
                        {/* Glucose — Fix 5: normalise key name across different PDF parser outputs */}
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ fontSize: 13, color: "rgba(26,26,24,0.70)" }}>Glucose Stability</span>
                                    {glucoseBiomarker && (
                                        <span className={`badge-${glucoseBiomarker.status === "normal" ? "green" : "amber"}`}
                                            style={{ padding: "2px 8px", fontSize: 11 }}>
                                            {glucoseBiomarker.status === "normal" ? "Stable" : "Monitor"}
                                        </span>
                                    )}
                                </div>
                                <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1A18" }}>
                                    {loading ? "—" : glucoseBiomarker
                                        ? `${glucoseBiomarker.value} ${glucoseBiomarker.unit}`
                                        : "—"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <p style={{ fontSize: 13, color: "rgba(26,26,24,0.55)", lineHeight: 1.6, marginBottom: 14 }}>
                        {/* Fix 2: match nutrition insights by title keywords since engine uses `type`, not `category` */}
                        {insights?.find(i =>
                            i.title?.toLowerCase().includes("protein") ||
                            i.title?.toLowerCase().includes("nutrition") ||
                            i.title?.toLowerCase().includes("plateau") ||
                            i.title?.toLowerCase().includes("carb") ||
                            i.title?.toLowerCase().includes("hydration")
                        )?.message
                            || insights?.find(i =>
                                i.title?.toLowerCase().includes("protein") ||
                                i.title?.toLowerCase().includes("nutrition") ||
                                i.title?.toLowerCase().includes("plateau") ||
                                i.title?.toLowerCase().includes("carb") ||
                                i.title?.toLowerCase().includes("hydration")
                            )?.description
                            || "See your full nutrition breakdown and AI-generated meal suggestions."}
                    </p>

                    {/* Macro tags — real data when available, fallback to labels */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {nutritionSummary ? (
                            [
                                { label: "Protein", value: `~${nutritionSummary.avgDailyProteinG}g/day` },
                                { label: "Carbs", value: `~${nutritionSummary.avgDailyCarbsG}g/day` },
                                { label: "Fats", value: `~${nutritionSummary.avgDailyFatsG}g/day` },
                                { label: "Calories", value: `~${nutritionSummary.avgDailyCalories} kcal` },
                            ].map(m => (
                                <span key={m.label} style={{ fontSize: 12, fontWeight: 500, padding: "6px 12px", borderRadius: 9999, background: "rgba(26,26,24,0.05)", color: "rgba(26,26,24,0.70)" }}>
                                    <span style={{ color: "rgba(26,26,24,0.40)", marginRight: 4 }}>{m.label}:</span>{m.value}
                                </span>
                            ))
                        ) : (
                            ["Protein", "Carbs", "Fats"].map(m => (
                                <span key={m} style={{ fontSize: 12, fontWeight: 500, padding: "6px 12px", borderRadius: 9999, background: "rgba(26,26,24,0.05)", color: "rgba(26,26,24,0.45)" }}>{m}</span>
                            ))
                        )}
                    </div>

                    <Link to="/nutrition" className="cta-link" style={{ display: "block", marginTop: 14 }}>
                        View full nutrition →
                    </Link>
                </div>
            </div>

            {/* ── Row 4: Diagnostics (full width) ── */}
            <Link to="/diagnostics" style={{
                ...GLASS, borderRadius: 20, padding: 24, display: "flex", alignItems: "center",
                justifyContent: "space-between", cursor: "pointer", textDecoration: "none", marginBottom: 20,
                transition: "box-shadow 0.2s",
            }} className="hover:shadow-xl block mb-5">
                <div>
                    <span className="overline-label">Diagnostics</span>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, margin: "6px 0" }}>
                        {loading ? <Skeleton w={60} h={28} r={6} /> : (
                            <>
                                <span style={{ ...SERIF, fontSize: 28, color: "#1A1A18" }}>
                                    {diagScore !== null ? diagScore : "—"}
                                </span>
                                <span style={{ fontSize: 13, color: "rgba(26,26,24,0.45)" }}>/ 100</span>
                            </>
                        )}
                    </div>
                    <p style={{ fontSize: 12, color: "rgba(26,26,24,0.45)" }}>
                        {diagUpdated ? `Last updated ${timeAgo(diagUpdated)?.replace("Updated ", "")}` : "No report uploaded yet"}
                    </p>
                    <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                        {loading ? [1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} w={10} h={10} r={9999} />) :
                            diagDots.length > 0
                                ? diagDots.map((dot, i) => (
                                    <div key={i} style={{
                                        width: 10, height: 10, borderRadius: "50%",
                                        background: dot === "normal" ? "#34C759" : dot === "flagged" ? "#F59E42" : "#EF4444"
                                    }} />
                                ))
                                : <span style={{ fontSize: 12, color: "rgba(26,26,24,0.40)" }}>Upload a report to see biomarker status</span>
                        }
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                    {!loading && flaggedCount > 0 && (
                        <span className="badge-amber">⚠ {flaggedCount} Flagged</span>
                    )}
                    <span className="cta-link">View Report →</span>
                </div>
            </Link>

            {/* ── Row 5: Active Experiments | Training Balance ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

                {/* Active Experiments */}
                <div style={{ ...GLASS, borderRadius: 24, padding: 24 }}>
                    <SectionHeader title="Active Experiments" />

                    {loading ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <Skeleton /><Skeleton w="80%" /><Skeleton />
                        </div>
                    ) : activeInterventions.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "32px 0", color: "rgba(26,26,24,0.40)", fontSize: 13 }}>
                            No active experiments yet.<br />
                            <Link to="/interventions" style={{ color: "#1A1A18", fontWeight: 700, textDecoration: "underline" }}>Start one →</Link>
                        </div>
                    ) : (
                        <>
                            {/* Stats row */}
                            <div style={{ display: "flex", gap: 0, marginBottom: 20, border: "1px solid rgba(26,26,24,0.06)", borderRadius: 12, overflow: "hidden" }}>
                                {[
                                    { label: "Active Protocols", value: String(activeInterventions.length) },
                                    { label: "Compliance", value: avgCompliance !== null ? `${avgCompliance}%` : "—", lime: true },
                                    { label: "Avg Duration", value: avgDuration !== null ? `${avgDuration}d` : "—" },
                                ].map((s, i, arr) => (
                                    <div key={s.label} style={{ flex: 1, padding: "12px 16px", textAlign: "center", borderRight: i < arr.length - 1 ? "1px solid rgba(26,26,24,0.06)" : "none", background: "rgba(255,255,255,0.50)" }}>
                                        <div style={{ fontSize: 12, color: "rgba(26,26,24,0.45)", marginBottom: 4 }}>{s.label}</div>
                                        <div style={{ ...SERIF, fontSize: 22, color: s.lime ? "#CADB00" : "#1A1A18" }}>{s.value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Experiment bars */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                {activeInterventions.slice(0, 3).map((exp, i) => {
                                    const daysSince = Math.max(1, Math.floor((Date.now() - new Date(exp.startDate)) / 86400000));
                                    // Fix 3: prefer server-computed compliancePct, fall back to frontend calc
                                    const compliance = exp.compliancePct !== undefined
                                        ? exp.compliancePct
                                        : Math.min(Math.round((exp.outcomes?.length || 0) / daysSince * 100), 100);
                                    const colors = ["#7C6FCD", "#CADB00", "#E07A3A"];
                                    return (
                                        <div key={exp._id}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                                <span style={{ fontSize: 13, fontWeight: 500, color: "#1A1A18" }}>{exp.recommendation?.slice(0, 45) || exp.type}</span>
                                                <span style={{ fontSize: 12, color: "rgba(26,26,24,0.45)" }}>{compliance}%</span>
                                            </div>
                                            <div className="progress-track">
                                                <div style={{ width: `${compliance}%`, height: "100%", background: colors[i % 3], borderRadius: 9999, transition: "width 0.8s ease-out" }} />
                                            </div>
                                            <p style={{ fontSize: 11, color: "rgba(26,26,24,0.40)", marginTop: 4 }}>
                                                {exp.type} · Day {daysSince} / {exp.durationDays}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    <Link to="/interventions" style={{ fontSize: 12, color: "rgba(26,26,24,0.40)", display: "block", marginTop: 16, textDecoration: "none" }}>
                        Manage Experiments →
                    </Link>
                </div>

                {/* Training Balance */}
                <div style={{ ...GLASS, borderRadius: 24, padding: 24 }}>
                    <SectionHeader title="Training Balance" />

                    <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
                        <TrainingDonut
                            aerobic={tb?.aerobic ?? 0}
                            anaerobic={tb?.anaerobic ?? 0}
                            rest={tb?.rest ?? 0}
                            noData={!tb || totalWorkoutsThisWeek === 0}
                        />

                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                            {loading
                                ? [1, 2, 3].map(k => <Skeleton key={k} />)
                                : tb && totalWorkoutsThisWeek > 0
                                    ? [
                                        { color: "#CADB00", label: "Aerobic", pct: `${tb.aerobic}%` },
                                        { color: "#E07A3A", label: "Anaerobic", pct: `${tb.anaerobic}%` },
                                        { color: "rgba(26,26,24,0.12)", label: "Rest / Recovery", pct: `${tb.rest}%` },
                                    ].map(s => (
                                        <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                                            <span style={{ fontSize: 13, color: "rgba(26,26,24,0.70)", flex: 1 }}>{s.label}</span>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1A18" }}>{s.pct}</span>
                                        </div>
                                    ))
                                    : <span style={{ fontSize: 13, color: "rgba(26,26,24,0.40)" }}>Log workouts to see your training distribution.</span>
                            }
                        </div>
                    </div>

                    {!loading && tb && totalWorkoutsThisWeek > 0 && (
                        <span className="badge-lime">
                            {tb.aerobic >= 50 ? "Training load well balanced this week" : "Add more aerobic sessions this week"}
                        </span>
                    )}
                </div>
            </div>

            {/* ── Row 6: Recent Activity | Weekly Summary ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Recent Activity */}
                <div style={{ ...GLASS, borderRadius: 20, padding: 24 }}>
                    <SectionHeader title="Recent Activity" />

                    {loading ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {[1, 2, 3].map(k => <Skeleton key={k} h={50} />)}
                        </div>
                    ) : recentActivity.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "32px 0", color: "rgba(26,26,24,0.40)", fontSize: 13 }}>
                            No recent activity. Connect Google Fit or generate a workout.
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                            {recentActivity.map((act, i) => (
                                <div key={i} style={{ display: "flex", gap: 12, paddingBottom: i < recentActivity.length - 1 ? 16 : 0 }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: act.color, flexShrink: 0 }} />
                                        {i < recentActivity.length - 1 && (
                                            <div style={{ width: 1, flex: 1, marginTop: 4, background: "rgba(26,26,24,0.08)" }} />
                                        )}
                                    </div>
                                    <div style={{ flex: 1, paddingBottom: 4 }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: "#1A1A18" }}>{act.title}</div>
                                        <div style={{ fontSize: 13, color: "rgba(26,26,24,0.50)", marginTop: 1 }}>{act.desc}</div>
                                        <div style={{ fontSize: 11, color: "rgba(26,26,24,0.40)", marginTop: 2 }}>
                                            {formatTimestamp(act.timestamp)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Weekly Summary */}
                <div style={{ ...GLASS, borderRadius: 20, padding: 24 }}>
                    <SectionHeader title="Weekly Summary" />

                    <div style={{ display: "flex", flexDirection: "column" }}>
                        {[
                            {
                                label: "Overall Health",
                                value: loading
                                    ? <Skeleton w={60} h={18} r={6} />
                                    : healthScore !== null
                                        ? <span style={{ color: "#34C759", fontWeight: 600, fontSize: 13 }}>↑ Score: {healthScore}/100</span>
                                        : <span style={{ fontSize: 13, color: "rgba(26,26,24,0.40)" }}>No data</span>,
                                border: true
                            },
                            {
                                label: "Workouts This Week",
                                value: loading
                                    ? <Skeleton w={60} h={18} r={6} />
                                    : workoutsThisWeek !== null
                                        ? <span style={{ fontSize: 15, fontWeight: 700, ...SERIF }}>{workoutsThisWeek}/{totalWorkoutsThisWeek || 0}</span>
                                        : <span style={{ fontSize: 13, color: "rgba(26,26,24,0.40)" }}>—</span>,
                                border: true
                            },
                            {
                                label: "Recovery Status",
                                value: loading
                                    ? <Skeleton w={70} h={22} r={9999} />
                                    : recoveryStatus
                                        ? <span className={`badge-${recoveryStatus === "Optimal" ? "lime" : "neutral"}`}>{recoveryStatus}</span>
                                        : <span style={{ fontSize: 13, color: "rgba(26,26,24,0.40)" }}>—</span>,
                                border: false
                            },
                        ].map(row => (
                            <div key={row.label} style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "16px 0",
                                borderBottom: row.border ? "1px solid rgba(26,26,24,0.07)" : "none",
                            }}>
                                <span style={{ fontSize: 13, color: "rgba(26,26,24,0.65)" }}>{row.label}</span>
                                {row.value}
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: 16, padding: "14px", background: "rgba(202,219,0,0.06)", borderRadius: 12 }}>
                        <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(26,26,24,0.60)", margin: 0 }}>
                            {insights && insights.length > 0
                                ? (insights[insights.length - 1]?.description || "").slice(0, 140)
                                : "Complete your first week to see a personalized weekly summary here."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
