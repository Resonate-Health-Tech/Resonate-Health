import React from "react";

export default function HRVSparkline({ weeklyHRV }) {
    const values = (weeklyHRV || []).filter(v => v !== null && v !== undefined);
    if (values.length < 2) {
        return (
            <div className="h-16 flex items-center justify-center">
                <span className="text-[12px] text-black/35">Not enough HRV data yet</span>
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
        <svg viewBox={`0 0 ${W} ${H + 10}`} className="w-full h-16 overflow-visible">
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
