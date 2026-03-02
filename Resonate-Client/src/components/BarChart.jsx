import React, { useState } from 'react';

export default function BarChart({
  title,
  data = [],
  labels = [],
  unit = "",
  average,
  color = "lime"
}) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // Calculate max value for scaling, ensure it's at least greater than average or 10000
  let maxData = Math.max(...data, 1);
  if (average && average > maxData) maxData = average;

  // Choose a nice upper bound for the Y axis
  const maxAxis = maxData > 10000 ? 12000 : maxData > 5000 ? 10000 : maxData > 1000 ? 2000 : Math.ceil(maxData * 1.2);
  const yTicks = [0, maxAxis * 0.25, maxAxis * 0.5, maxAxis * 0.75, maxAxis];

  const barColor = color === "lime" ? "#CADB00" : color === "purple" ? "#A195F9" : "#CADB00";

  return (
    <div className="relative w-full h-56 mt-4">
      {/* Y Axis & Grid Lines */}
      <div className="absolute inset-0 flex flex-col justify-between pb-8">
        {[...yTicks].reverse().map((tick, i) => (
          <div key={i} className="flex items-center w-full relative">
            <span className="text-[11px] text-[#1A1A18]/60 w-10 text-right pr-2 absolute -mt-2">
              {tick === 0 ? "0" : tick.toLocaleString()}
            </span>
            <div className="border-b border-dashed border-[#1A1A18]/10 w-full ml-10"></div>
          </div>
        ))}
      </div>

      {/* Average Line */}
      {average && (
        <div
          className="absolute w-full ml-10 flex items-center pr-10"
          style={{ bottom: `calc(2rem + ${(average / maxAxis) * 100}% - 2rem * ${(average / maxAxis)})` }}
        >
          <div className="border-b border-dashed border-[#92400E]/50 w-full z-10 relative"></div>
        </div>
      )}

      {/* Bars container */}
      <div className="absolute inset-0 ml-10 flex items-end justify-between pb-8 z-20">
        {data.map((val, i) => {
          const heightPct = (val / maxAxis) * 100;
          return (
            <div
              key={i}
              className="relative flex flex-col items-center flex-1 h-full justify-end cursor-pointer group"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div
                className="w-10 rounded-t-sm transition-all duration-300 relative z-20 hover:brightness-110"
                style={{ height: `${heightPct}%`, backgroundColor: barColor }}
              ></div>

              {/* Target hovering effect background */}
              {hoveredIdx === i && (
                <div className="absolute top-0 bottom-0 w-12 bg-black/5 -z-10 rounded-t-sm"></div>
              )}

              {/* Tooltip */}
              {hoveredIdx === i && (
                <div className="absolute -top-12 z-30 bg-[#1A1A18] text-white p-2 rounded-xl text-[13px] shadow-lg whitespace-nowrap">
                  <span className="font-semibold">{labels[i]}</span><br />
                  <span className="text-[#CADB00]">steps : {val.toLocaleString()}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* X Axis Labels */}
      <div className="absolute bottom-0 left-10 right-0 flex items-end justify-between border-t border-[#1A1A18]/20 pt-2">
        {labels.map((label, i) => (
          <div key={i} className="flex-1 text-center text-[12px] text-[#1A1A18]/70 font-medium">
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
