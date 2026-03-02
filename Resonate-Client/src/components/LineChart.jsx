import React, { useState } from 'react';

export default function LineChart({
    title,
    data = [],
    labels = [],
    unit = "",
    average,
    color = "purple"
}) {
    let maxData = Math.max(...data, 1);
    if (average && average > maxData) maxData = average;
    const [hoveredIdx, setHoveredIdx] = useState(null);

    // Custom y-ticks based on max
    const maxAxis = maxData > 8 ? 10 : maxData > 5 ? 8 : 5;
    const yTicks = [0, maxAxis * 0.25, maxAxis * 0.5, maxAxis * 0.75, maxAxis];

    const lineColor = color === "purple" ? "#7C6FCD" : "#CADB00";
    const fillColor = color === "purple" ? "rgba(124, 111, 205, 0.1)" : "rgba(202, 219, 0, 0.1)";

    // Generate SVG path for a smooth line
    const generateSmoothPath = (points) => {
        if (points.length === 0) return "";
        let d = `M ${points[0].x},${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            const cx = (p0.x + p1.x) / 2;
            d += ` C ${cx},${p0.y} ${cx},${p1.y} ${p1.x},${p1.y}`;
        }
        return d;
    };

    // SVG coordinates: 0,0 is top left.
    const chartHeight = 192; // equivalent to h-48 roughly
    const chartWidth = 400; // coordinate space width

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1 || 1)) * chartWidth;
        const y = chartHeight - (val / maxAxis) * chartHeight;
        return { x, y };
    });

    const path = generateSmoothPath(points);
    const fillPath = `${path} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`;

    return (
        <div className="relative w-full h-56 mt-4 flex flex-col justify-end">
            {/* Y Axis & Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pb-8">
                {[...yTicks].reverse().map((tick, i) => (
                    <div key={i} className="flex items-center w-full relative">
                        <span className="text-[11px] text-[#1A1A18]/60 w-6 text-right pr-2 absolute -mt-2">
                            {tick}
                        </span>
                        <div className="border-b border-dashed border-[#1A1A18]/10 w-full ml-6"></div>
                    </div>
                ))}
            </div>

            {/* Average Line */}
            {average && (
                <div
                    className="absolute w-full ml-6 flex items-center pr-6"
                    style={{ bottom: `calc(2rem + ${(average / maxAxis) * 100}% - 2rem * ${(average / maxAxis)})` }}
                >
                    <div className="border-b border-dashed border-[#7C6FCD]/40 w-full z-10 relative"></div>
                </div>
            )}

            {/* SVG Chart */}
            <div className="absolute inset-0 ml-6 pb-8 z-20">
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    <path d={fillPath} fill={fillColor} />
                    <path d={path} fill="none" stroke={lineColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>

            {/* Hover Interaction Columns */}
            <div className="absolute inset-0 ml-6 pb-8 z-30 flex items-stretch justify-between">
                {data.map((val, i) => (
                    <div
                        key={i}
                        className="relative flex-1 h-full cursor-pointer"
                        onMouseEnter={() => setHoveredIdx(i)}
                        onMouseLeave={() => setHoveredIdx(null)}
                    >
                        {/* Column background wash */}
                        {hoveredIdx === i && (
                            <div className="absolute inset-0 bg-black/5 rounded-sm" />
                        )}
                        {/* Tooltip */}
                        {hoveredIdx === i && (
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-40 bg-[#1A1A18] text-white p-2 rounded-xl text-[13px] shadow-lg whitespace-nowrap">
                                <span className="font-semibold">{labels[i]}</span><br />
                                <span style={{ color: "#A195F9" }}>{val}{unit}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* X Axis Labels */}
            <div className="absolute bottom-0 left-6 right-0 flex items-end justify-between border-t border-[#1A1A18]/20 pt-2 z-30">
                {labels.map((label, i) => (
                    <div key={i} className="flex-1 text-center text-[12px] text-[#1A1A18]/70 font-medium">
                        {label}
                    </div>
                ))}
            </div>
        </div>
    );
}
