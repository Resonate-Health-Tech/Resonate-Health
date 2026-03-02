import React, { useEffect, useState } from "react";
import { getUserMemories } from "../api";

const S = {
    page: {
        fontFamily: "'DM Sans', sans-serif",
    },
    header: {
        marginBottom: 28,
    },
    h1: {
        fontSize: 28, fontWeight: 700, color: "#1A1A18", margin: "0 0 4px",
    },
    sub: {
        fontSize: 13, color: "rgba(26,26,24,0.55)", margin: 0, maxWidth: 480,
    },
    filterBar: {
        display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16,
    },
    grid: {
        display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16,
    },
};

const categoryColors = {
    fitness: { bg: "rgba(224,122,58,0.10)", border: "rgba(224,122,58,0.25)", text: "#92400E" },
    nutrition: { bg: "rgba(52,199,89,0.10)", border: "rgba(52,199,89,0.25)", text: "#14532D" },
    diagnostics: { bg: "rgba(124,111,205,0.10)", border: "rgba(124,111,205,0.25)", text: "#4A3D6B" },
    recovery: { bg: "rgba(56,189,248,0.10)", border: "rgba(56,189,248,0.25)", text: "#075985" },
    intervention: { bg: "rgba(239,68,68,0.10)", border: "rgba(239,68,68,0.25)", text: "#991B1B" },
    default: { bg: "rgba(26,26,24,0.05)", border: "rgba(26,26,24,0.10)", text: "rgba(26,26,24,0.55)" },
};

function getCategoryStyle(cat = "") {
    for (const key of Object.keys(categoryColors)) {
        if (cat.toLowerCase().startsWith(key)) return categoryColors[key];
    }
    return categoryColors.default;
}

export default function MemoriesPage() {
    const [memories, setMemories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState("");

    const categories = ["All", "diet", "workout", "health", "preference", "general"];

    useEffect(() => { fetchMemories(); }, [categoryFilter]);

    const fetchMemories = async () => {
        try {
            setLoading(true);
            const data = await getUserMemories(categoryFilter === "All" ? "" : categoryFilter);
            if (data.results) setMemories(data.results);
            else if (Array.isArray(data)) setMemories(data);
            else setMemories([]);
        } catch (err) {
            console.error("Failed to fetch memories:", err);
            setError("Failed to load your memories. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (isoString) => {
        if (!isoString) return "";
        return new Date(isoString).toLocaleDateString("en-US", {
            year: "numeric", month: "short", day: "numeric",
        });
    };

    return (
        <div style={S.page}>
            {/* Header */}
            <div style={S.header}>
                <h1 style={S.h1}>My Memories</h1>
                <p style={S.sub}>
                    This is what your AI coach knows about you. These memories refine your
                    workout and diet plans to match your evolving needs.
                </p>

                {/* Filter bar */}
                <div style={S.filterBar}>
                    {categories.map((cat) => {
                        const isActive = categoryFilter === cat || (categoryFilter === "" && cat === "All");
                        return (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                style={{
                                    padding: "6px 14px", borderRadius: 9999, fontSize: 13, fontWeight: 600,
                                    border: isActive ? "none" : "1px solid rgba(26,26,24,0.12)",
                                    background: isActive ? "#1A1A18" : "rgba(255,255,255,0.70)",
                                    color: isActive ? "#FFF" : "rgba(26,26,24,0.60)",
                                    cursor: "pointer", backdropFilter: "blur(8px)",
                                    transition: "all 0.15s",
                                }}
                            >
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div style={S.grid}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} style={{
                            height: 140, borderRadius: 20,
                            background: "rgba(255,255,255,0.50)", border: "1px solid rgba(255,255,255,0.60)",
                            animation: "pulse 1.5s ease-in-out infinite",
                        }} />
                    ))}
                </div>
            ) : error ? (
                <div style={{
                    padding: "16px 20px", borderRadius: 12,
                    background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.20)",
                    fontSize: 13, color: "#EF4444", textAlign: "center",
                }}>
                    {error}
                </div>
            ) : memories.length === 0 ? (
                <div style={{
                    textAlign: "center", padding: "64px 20px",
                    background: "rgba(255,255,255,0.60)", backdropFilter: "blur(12px)",
                    border: "1.5px dashed rgba(26,26,24,0.15)", borderRadius: 24,
                }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🧠</div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1A1A18", marginBottom: 8 }}>No memories yet</h3>
                    <p style={{ fontSize: 13, color: "rgba(26,26,24,0.55)", maxWidth: 360, margin: "0 auto" }}>
                        Start interacting with your AI coach, log meals, or complete workouts to build your profile.
                    </p>
                </div>
            ) : (
                <div style={S.grid}>
                    {memories.map((memory) => {
                        const cat = memory.metadata?.category || "";
                        const cs = getCategoryStyle(cat);
                        return (
                            <div
                                key={memory.id}
                                className="glass-card"
                                style={{
                                    borderRadius: 20, padding: 20,
                                    transition: "box-shadow 0.2s, transform 0.2s",
                                    cursor: "default",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                                    <span style={{
                                        fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 9999,
                                        background: cs.bg, border: `1px solid ${cs.border}`, color: cs.text,
                                        textTransform: "uppercase", letterSpacing: "0.06em",
                                    }}>
                                        {cat || "General"}
                                    </span>
                                    <span style={{ fontSize: 11, color: "rgba(26,26,24,0.35)", fontVariantNumeric: "tabular-nums" }}>
                                        {formatDate(memory.created_at)}
                                    </span>
                                </div>
                                <p style={{ fontSize: 13, color: "#1A1A18", lineHeight: 1.65, margin: 0 }}>
                                    {memory.memory}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}

            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
        </div>
    );
}
