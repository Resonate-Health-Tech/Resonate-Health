import React from "react";
import Skeleton from "./Skeleton";

const SERIF = { fontFamily: "'DM Serif Display', serif", fontWeight: 400 };

export default function HealthScoreRing({ score, loading }) {
    const r = 70;
    const circ = 2 * Math.PI * r;
    const offset = score !== null ? circ * (1 - score / 100) : circ;

    return (
        <div className="w-[160px] h-[160px] relative shrink-0">
            <svg width="160" height="160"
                className="-rotate-90 drop-shadow-[0_0_8px_rgba(202,219,0,0.40)]"
            >
                <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(26,26,24,0.07)" strokeWidth="12" />
                <circle
                    cx="80" cy="80" r={r} fill="none"
                    stroke={score !== null ? "#CADB00" : "rgba(26,26,24,0.10)"} strokeWidth="12"
                    strokeDasharray={circ} strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-[stroke-dashoffset] duration-1200 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                {loading
                    ? <Skeleton w={60} h={44} r={8} />
                    : score !== null
                        ? <span style={SERIF} className="text-[44px] text-[#1A1A18] leading-none">{score}</span>
                        : <span className="text-[13px] text-black/35 text-center">No data</span>
                }
            </div>
        </div>
    );
}
