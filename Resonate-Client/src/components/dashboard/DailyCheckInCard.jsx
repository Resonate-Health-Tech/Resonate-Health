import React, { useState } from "react";
import { CheckCircle, PenLine } from "lucide-react";
import { postWithCookie } from "../../api";

const SERIF = { fontFamily: "'DM Serif Display', serif", fontWeight: 400 };
const SANS = { fontFamily: "'DM Sans', sans-serif" };

const SLIDER_META = [
    { key: "energyLevel", label: "Energy", low: "Exhausted", high: "Limitless", color: "#CADB00", track: "rgba(202,219,0,0.15)" },
    { key: "sleepQuality", label: "Sleep", low: "Terrible", high: "Amazing", color: "#7C6FCD", track: "rgba(124,111,205,0.15)" },
    { key: "stressLevel", label: "Stress", low: "Zen", high: "Panicked", color: "#E07A3A", track: "rgba(224,122,58,0.15)" },
];

function SliderRow({ meta, value, onChange }) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-baseline">
                <span style={SANS} className="text-[13px] font-semibold text-[#1A1A18]">{meta.label}</span>
                <span className="text-[18px] font-bold" style={{ ...SERIF, color: meta.color }}>{value}</span>
            </div>
            <input type="range" min="1" max="10" value={value}
                onChange={e => onChange(Number(e.target.value))}
                className="w-full h-1 cursor-pointer"
                style={{ accentColor: meta.color }}
            />
            <div className="flex justify-between">
                <span className="text-[11px] text-black/35">{meta.low}</span>
                <span className="text-[11px] text-black/35">{meta.high}</span>
            </div>
        </div>
    );
}

export default function DailyCheckInCard({ todayLog, onLogged }) {
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
            <div className="bg-white/75 backdrop-blur-md border-[1px] border-white/60 shadow-sm rounded-[20px] px-6 py-4 flex items-center justify-between mb-5 gap-4 relative">
                <div className="flex items-center gap-2.5">
                    <CheckCircle size={18} color="#CADB00" strokeWidth={2} />
                    <span style={SANS} className="text-[13px] font-semibold text-[#1A1A18]">Today's check-in logged</span>
                </div>
                <div className="flex gap-4">
                    {SLIDER_META.map(m => (
                        <div key={m.key} className="flex flex-col items-center gap-0.5">
                            <span className="text-[16px] font-bold" style={{ ...SERIF, color: m.color }}>
                                {log?.[m.key] ?? values[m.key]}<span className="text-[10px] text-black/35">/10</span>
                            </span>
                            <span className="text-[11px] text-black/40">{m.label}</span>
                        </div>
                    ))}
                </div>
                <button onClick={() => setExpanded(e => !e)}
                    className="text-[12px] text-black/40 bg-transparent border-none cursor-pointer flex items-center gap-1 hover:text-black/60 transition-colors">
                    <PenLine size={13} />Edit
                </button>
                {expanded && (
                    <form onSubmit={handleSubmit}
                        className="absolute top-[calc(100%+8px)] left-0 right-0 z-20 bg-white/75 backdrop-blur-md border-[1px] border-white/60 shadow-sm rounded-[20px] p-6 flex flex-col gap-4">
                        {SLIDER_META.map(m => (
                            <SliderRow key={m.key} meta={m} value={values[m.key]}
                                onChange={v => setValues(p => ({ ...p, [m.key]: v }))} />
                        ))}
                        <button type="submit" disabled={submitting}
                            className="self-end px-5 py-2 rounded-full text-[13px] font-bold bg-[#1A1A18] text-[#CADB00] border-none hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                            {submitting ? "Saving…" : "Update"}
                        </button>
                    </form>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white/75 backdrop-blur-md border-[1px] border-white/60 shadow-sm rounded-[20px] p-6 mb-5 relative">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[rgba(202,219,0,0.12)] flex items-center justify-center">
                        <PenLine size={13} color="#CADB00" strokeWidth={2} />
                    </div>
                    <div>
                        <h3 style={SANS} className="text-[15px] font-semibold text-[#1A1A18] m-0">Daily Check-in</h3>
                        <p className="text-[12px] text-black/45 m-0">How are you feeling today? This feeds your AI insights.</p>
                    </div>
                </div>
                <span className="badge-neutral">Takes 10 sec</span>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
                <div className="grid grid-cols-3 gap-6">
                    {SLIDER_META.map(m => (
                        <SliderRow key={m.key} meta={m} value={values[m.key]}
                            onChange={v => setValues(p => ({ ...p, [m.key]: v }))} />
                    ))}
                </div>
                <div className="flex gap-3 items-center mt-3">
                    <input
                        placeholder="Any notes? (symptoms, mood, observations…)"
                        value={values.notes}
                        onChange={e => setValues(p => ({ ...p, notes: e.target.value }))}
                        className="flex-1 text-[13px] px-3.5 py-2.5 rounded-[10px] border border-black/10 bg-white/50 outline-none text-[#1A1A18] font-['DM_Sans'] transition-all focus:border-[#CADB00] focus:ring-1 focus:ring-[#CADB00]"
                    />
                    <button type="submit" disabled={submitting}
                        className="px-6 py-2.5 rounded-full text-[13px] font-bold bg-[#1A1A18] text-[#CADB00] border-none cursor-pointer whitespace-nowrap disabled:opacity-60 transition-opacity hover:bg-black/90">
                        {submitting ? "Logging…" : "Log it"}
                    </button>
                </div>
            </form>
        </div>
    );
}
