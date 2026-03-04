import React from "react";

const SERIF = { fontFamily: "'DM Serif Display', serif", fontWeight: 400 };

export default function MediumRing({ value, label, max, color, trackColor }) {
    const r = 40;
    const circ = 2 * Math.PI * r;
    const pct = value !== null ? Math.min(value / max, 1) : 0;
    const offset = circ * (1 - pct);
    return (
        <div className="flex flex-col items-center gap-1.5">
            <div className="w-24 h-24 relative">
                <svg width="96" height="96" className="-rotate-90">
                    <circle cx="48" cy="48" r={r} fill="none" stroke={trackColor} strokeWidth="8" />
                    <circle cx="48" cy="48" r={r} fill="none"
                        stroke={value !== null ? color : "rgba(26,26,24,0.08)"} strokeWidth="8"
                        strokeDasharray={circ} strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-[stroke-dashoffset] duration-800 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span style={SERIF} className="text-[18px] font-bold text-[#1A1A18]">
                        {value !== null
                            ? (typeof value === "number" && value % 1 !== 0 ? value.toFixed(1) : value)
                            : "—"}
                    </span>
                </div>
            </div>
            <span className="text-[12px] text-black/50">{label}</span>
        </div>
    );
}
