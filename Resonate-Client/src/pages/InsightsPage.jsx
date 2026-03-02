import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { suggestInterventions } from "../api";

export default function InsightsPage() {
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const data = await suggestInterventions();
                setInsights(data.suggestions || []);
            } catch (err) {
                console.error("Failed to fetch insights:", err);
                setError("Failed to load insights. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchInsights();
    }, []);

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h1 style={{ fontSize: 30, fontWeight: 700, color: "#1A1A18", fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>
                    Insights
                </h1>
                <p style={{ fontSize: 14, color: "rgba(26,26,24,0.55)" }}>
                    Data-driven health recommendations, powered by your data.
                </p>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center items-center p-10">
                    <p style={{ color: "rgba(26,26,24,0.55)", fontSize: 14 }}>Loading insights...</p>
                </div>
            ) : error ? (
                <div className="flex justify-center flex-col items-center p-10">
                    <p className="text-red-500 mb-4" style={{ fontSize: 14 }}>{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-[#CADB00] rounded-full text-sm font-semibold hover:bg-[#b5c400] transition-colors"
                        style={{ color: "#1A1A18" }}
                    >
                        Retry
                    </button>
                </div>
            ) : insights.length === 0 ? (
                <div className="glass-card rounded-[20px] p-8 text-center mt-5">
                    <p style={{ color: "rgba(26,26,24,0.55)", fontSize: 15 }}>No new insights available at the moment. Keep logging your data!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {insights.map((ins, i) => (
                        <div
                            key={i}
                            className="glass-card rounded-[20px] p-6 hover:shadow-lg transition-all"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div
                                        style={{
                                            width: 8, height: 8, borderRadius: "50%",
                                            background: "#CADB00", flexShrink: 0
                                        }}
                                    />
                                    <span className="overline-label">Insight</span>
                                </div>
                                {ins.type && (
                                    <span style={{
                                        fontSize: 10,
                                        fontWeight: 600,
                                        textTransform: "uppercase",
                                        background: "rgba(202,219,0,0.15)",
                                        color: "#5A6000",
                                        padding: "4px 8px",
                                        borderRadius: 12
                                    }}>
                                        {ins.type}
                                    </span>
                                )}
                            </div>
                            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1A1A18", marginBottom: 8 }}>
                                {ins.title}
                            </h3>
                            <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(26,26,24,0.60)" }}>
                                {ins.description || ins.text}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Coming soon notice */}
            <div
                className="glass-card rounded-[20px] p-6 mt-5 text-center"
            >
                <div
                    style={{
                        width: 48, height: 48, borderRadius: "50%",
                        background: "rgba(202,219,0,0.12)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 12px",
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CADB00" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1A1A18", marginBottom: 6 }}>
                    More insights coming soon
                </h3>
                <p style={{ fontSize: 13, color: "rgba(26,26,24,0.55)" }}>
                    Personalized AI-driven recommendations will appear here as your data grows.
                </p>
            </div>
        </div>
    );
}
