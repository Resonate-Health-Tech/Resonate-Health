import React from "react";

export default function BiomarkerCard({
    name,
    value,
    status,
    unit = "",
    category = "Unknown",
    normalRange = "",
    reason = "",
    isAvailable = true
}) {
    const statusLower = status?.toLowerCase();
    const isUndetermined = value == null || status == null || !isAvailable || statusLower === "unavailable" || statusLower === "unknown";
    const isGood = statusLower === "good" || statusLower === "optimal"; // Optimal
    const isBad = statusLower === "bad" || statusLower === "flagged"; // Flagged
    const isUnavailable = statusLower === "unavailable" || !isAvailable;
    const isUnknown = statusLower === "unknown";

    const getStyles = () => {
        if (isUnavailable || isUnknown || isUndetermined) {
            return {
                cardBg: "bg-[#FFFFFF]",
                cardBorder: "border-[#E5E5E5]",
                badgeBg: "bg-[#F3F4F6]",
                badgeText: "text-[#6B7280]",
                titleColor: "text-[#1A1A18]",
                valueColor: "text-[#1A1A18]",
                barFill: "bg-[#D1D5DB]",
                barThumb: "bg-[#9CA3AF]",
                reasonColor: "text-gray-500",
                label: "Unknown"
            };
        }
        if (isGood) {
            return {
                cardBg: "bg-[#FFFFFF]",
                cardBorder: "border-[#EFEFEA]", // Light beige border
                badgeBg: "bg-[#CADB00]",
                badgeText: "text-[#2D3000]",
                titleColor: "text-[#1A1A18]",
                valueColor: "text-[#1A1A18]",
                barFill: "bg-[#E5E5E5]",
                barThumb: "bg-[#CADB00]",
                reasonColor: "text-gray-500",
                label: "Optimal" // Use Optimal instead of Good
            };
        }
        if (isBad) {
            return {
                cardBg: "bg-[#EFEAE5]", // Slight brownish tint matching screenshot (greyish brown)
                cardBorder: "border-[#8C5D30]", // Brownish border
                badgeBg: "bg-[#8C5D30]",
                badgeText: "text-[#FFFFFF]",
                titleColor: "text-[#1A1A18]",
                valueColor: "text-[#8C5D30]", // Value in brown
                barFill: "bg-[#D9C4B3]",
                barThumb: "bg-[#8C5D30]",
                reasonColor: "text-gray-500",
                label: "Flagged" // Use Flagged instead of Needs Attention
            };
        }
        return {
            cardBg: "bg-[#FFFFFF]",
            cardBorder: "border-[#E5E5E5]",
            badgeBg: "bg-[#F3F4F6]",
            badgeText: "text-[#6B7280]",
            titleColor: "text-[#1A1A18]",
            valueColor: "text-[#1A1A18]",
            barFill: "bg-[#D1D5DB]",
            barThumb: "bg-[#9CA3AF]",
            reasonColor: "text-gray-500",
            label: "Unknown"
        };
    };

    const styles = getStyles();

    // Parse normal range to position thumb
    // E.g., "Hemoglobin: 13.6", range: "12.0 - 15.5" -> ~45%
    let thumbPosition = 50;
    if (!isUndetermined && normalRange && typeof value === 'number') {
        const match = normalRange.match(/([\d.]+)\s*-\s*([\d.]+)/);
        if (match) {
            const lower = parseFloat(match[1]);
            const upper = parseFloat(match[2]);
            const range = upper - lower;
            if (range > 0) {
                // Position percentage
                let pos = ((value - lower) / range) * 100;
                // Bound between 5 and 95 so it doesn't clip
                pos = Math.max(5, Math.min(95, pos));
                thumbPosition = pos;

                // Adjust thumb pos logic based on status
                if (isBad) {
                    // Usually if it's flagged and less than lower, push it to ~2-3%
                    if (value < lower) thumbPosition = 5;
                    if (value > upper) thumbPosition = 95;
                }
            }
        }
    } else if (!isUndetermined && typeof value === 'number') {
        // If no explicit normal range but we know status
        if (isBad) {
            thumbPosition = 10; // Default to low side string if flagged without range
        } else {
            thumbPosition = 50;
        }
    }

    // Fallback reasoning
    const descText = reason || (isGood ? "Within normal range" : isBad ? "Attention recommended" : "Unable to determine status");

    return (
        <div className={`p-5 rounded-[24px] border-2 ${styles.cardBorder} ${styles.cardBg} flex flex-col justify-between shadow-sm transition-transform hover:-translate-y-1`}>
            {/* Top Header */}
            <div className="flex justify-between items-start mb-5">
                <span className="px-3 py-1 bg-[#F5F1EB] text-[#1A1A18] text-xs font-semibold rounded-md">
                    {category || "Unknown"}
                </span>
                <span className={`px-4 py-1.5 ${styles.badgeBg} ${styles.badgeText} text-[11px] font-bold rounded-lg uppercase`}>
                    {styles.label}
                </span>
            </div>

            {/* Body */}
            <div className="flex-1 mb-6">
                <h3 className={`text-base font-bold ${styles.titleColor} mb-1 leading-tight`}>{name}</h3>
                <div className="flex items-baseline gap-1 mt-2">
                    <span className={`text-[22px] font-bold ${styles.valueColor} leading-none`}>
                        {isUndetermined ? "--" : value}
                    </span>
                    {unit && !isUndetermined && <span className="text-[13px] text-[#A1A1AA] font-bold">{unit}</span>}
                </div>
                <p className={`text-[13px] mt-2 ${styles.reasonColor} font-medium`}>{descText}</p>
            </div>

            {/* Footer Slider */}
            <div className="mt-auto">
                <div className="flex justify-between text-[11px] text-[#A1A1AA] font-semibold mb-1.5">
                    <span>Low</span>
                    <span>High</span>
                </div>
                <div className={`h-2.5 w-full ${styles.barFill} rounded-full relative`}>
                    {/* Thumb */}
                    {!isUndetermined && (
                        <div
                            className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full ${styles.barThumb} border-[2.5px] border-white drop-shadow-sm`}
                            style={{ left: `calc(${thumbPosition}% - 7px)` }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
