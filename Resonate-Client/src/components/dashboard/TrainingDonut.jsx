import React from "react";

export default function TrainingDonut({ aerobic = 0, anaerobic = 0, rest = 0, noData = false }) {
    const r = 60, cx = 65, cy = 65, circ = 2 * Math.PI * r;
    const aePct = aerobic / 100, anPct = anaerobic / 100;
    return (
        <div className="w-[130px] h-[130px] relative shrink-0">
            <svg viewBox="0 0 130 130" width="130" height="130" className="-rotate-90">
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
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[12px] font-semibold text-[#1A1A18] text-center">
                    {noData ? "No data" : (aerobic > 0 ? "Balanced" : "—")}
                </span>
            </div>
        </div>
    );
}
