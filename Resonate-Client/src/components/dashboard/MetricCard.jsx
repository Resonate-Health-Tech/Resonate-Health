import React from "react";
import Skeleton from "./Skeleton";

const SERIF = { fontFamily: "'DM Serif Display', serif", fontWeight: 400 };

export default function MetricCard({ label, value, unit, trend, trendPositive, color, iconBg, icon, loading }) {
    return (
        <div
            className="flex flex-col gap-2 rounded-[20px] p-5 border-t-[3px] bg-white/75 backdrop-blur-md border-[1px] border-white/60 shadow-[0_2px_8px_rgba(0,0,0,0.05),0_8px_24px_rgba(0,0,0,0.05)]"
            style={{ borderTopColor: color }}
        >
            <div className="flex items-center justify-between">
                <span className="overline-label">{label}</span>
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: iconBg }}>
                    {icon}
                </div>
            </div>
            {loading
                ? <Skeleton w={80} h={32} r={6} />
                : value !== null
                    ? (
                        <div className="flex items-baseline gap-1">
                            <span style={SERIF} className="text-[28px] text-[#1A1A18]">{value}</span>
                            <span className="text-[12px] text-black/45">{unit}</span>
                        </div>
                    )
                    : <span className="text-[13px] text-black/35">Not connected</span>
            }
            {!loading && trend !== null && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-semibold self-start"
                    style={{
                        background: trendPositive ? "rgba(202,219,0,0.10)" : "rgba(26,26,24,0.06)",
                        color: trendPositive ? "#3D4000" : "rgba(26,26,24,0.50)"
                    }}>
                    {trendPositive ? "↑" : "↓"} {trend}
                </span>
            )}
        </div>
    );
}
