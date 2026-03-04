import React from "react";

export default function Skeleton({ w = "100%", h = 20, r = 8 }) {
    return (
        <div style={{
            width: w, height: h, borderRadius: r,
            background: "linear-gradient(90deg, rgba(26,26,24,0.06) 25%, rgba(26,26,24,0.10) 50%, rgba(26,26,24,0.06) 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.4s ease-in-out infinite",
        }} />
    );
}
