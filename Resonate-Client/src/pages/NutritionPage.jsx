import React, { useEffect, useState } from "react";
import { getWithCookie, postWithCookie } from "../api";
import { useNavigate } from "react-router-dom";
import FoodAnalyzer from "../components/FoodAnalyzer";

const MEAL_COLORS = {
    breakfast: { border: "#CADB00", accent: "#3D4000", bg: "rgba(202,219,0,0.07)" },
    lunch: { border: "#34C759", accent: "#14532D", bg: "rgba(52,199,89,0.07)" },
    dinner: { border: "#7C6FCD", accent: "#4A3D6B", bg: "rgba(124,111,205,0.07)" },
    snack: { border: "#E07A3A", accent: "#92400E", bg: "rgba(224,122,58,0.07)" },
};

const MEAL_ICONS = {
    breakfast: "🍳",
    lunch: "🍛",
    dinner: "🥘",
    snack: "🥨",
};

const TABS = [
    { key: "plan", label: "Daily Plan", emoji: "🥗" },
    { key: "log", label: "Log Food", emoji: "📸" },
];

export default function NutritionPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("plan");
    const [loading, setLoading] = useState(true);
    const [regenerating, setRegenerating] = useState(false);
    const [error, setError] = useState("");
    const [suggestions, setSuggestions] = useState(null);
    const [logCount, setLogCount] = useState(0); // used to show badge after logging

    useEffect(() => { fetchSuggestions(); }, []);

    const fetchSuggestions = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await getWithCookie("/api/nutrition/daily-suggestions");
            if (data.status === "success" && data.plan) {
                const norm = {};
                Object.keys(data.plan).forEach(k => { norm[k.toLowerCase()] = data.plan[k]; });
                setSuggestions(norm);
            } else if (data.status === "no_plan") {
                setSuggestions(null);
            } else if (data.breakfast || data.Breakfast) {
                const norm = {};
                Object.keys(data).forEach(k => { norm[k.toLowerCase()] = data[k]; });
                setSuggestions(norm);
            }
        } catch (err) {
            console.error(err);
            setError("Failed to fetch suggestions.");
        } finally {
            setLoading(false);
        }
    };

    const generateSuggestions = async () => {
        try {
            setRegenerating(true);
            setError("");
            if (!suggestions) setLoading(true);
            const data = await postWithCookie("/api/nutrition/daily-suggestions", {});
            if (data.status === "success" && data.plan) {
                const norm = {};
                Object.keys(data.plan).forEach(k => { norm[k.toLowerCase()] = data.plan[k]; });
                setSuggestions(norm);
            } else {
                setError("Failed to generate new plan.");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to generate suggestions. Please try again later.");
        } finally {
            setRegenerating(false);
            setLoading(false);
        }
    };

    if (loading && !suggestions && activeTab === "plan") {
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(202,219,0,0.20)", borderTopColor: "#CADB00", animation: "spin 0.8s linear infinite" }} />
                <p style={{ fontSize: 13, color: "rgba(26,26,24,0.45)", marginTop: 12, fontFamily: "'DM Sans',sans-serif" }}>Chef AI is preparing your menu…</p>
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        );
    }

    return (
        <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1A1A18", margin: "0 0 4px" }}>Nutrition</h1>
                    <p style={{ fontSize: 13, color: "rgba(26,26,24,0.55)", margin: 0 }}>Fuel your body with AI-curated meals and food tracking.</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                    <button
                        onClick={() => navigate('/meal-history')}
                        style={{ padding: "10px 18px", borderRadius: 12, border: "1.5px solid rgba(26,26,24,0.15)", background: "rgba(255,255,255,0.70)", fontSize: 13, fontWeight: 600, color: "rgba(26,26,24,0.70)", cursor: "pointer", transition: "all 0.15s" }}
                    >
                        Plan History
                    </button>
                    {activeTab === "plan" && suggestions && (
                        <button
                            onClick={generateSuggestions}
                            disabled={regenerating}
                            style={{ padding: "10px 18px", borderRadius: 12, border: "none", background: regenerating ? "rgba(26,26,24,0.08)" : "#1A1A18", fontSize: 13, fontWeight: 700, color: regenerating ? "rgba(26,26,24,0.40)" : "#FFF", cursor: regenerating ? "not-allowed" : "pointer", transition: "all 0.15s" }}
                        >
                            {regenerating ? "Regenerating…" : "Regenerate"}
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 24, padding: "4px", background: "rgba(26,26,24,0.06)", borderRadius: 14, width: "fit-content" }}>
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            padding: "8px 18px", borderRadius: 11, border: "none", fontSize: 13, fontWeight: 600,
                            background: activeTab === tab.key ? "#FFF" : "transparent",
                            color: activeTab === tab.key ? "#1A1A18" : "rgba(26,26,24,0.50)",
                            cursor: "pointer", transition: "all 0.18s",
                            boxShadow: activeTab === tab.key ? "0 1px 6px rgba(26,26,24,0.10)" : "none",
                            display: "flex", alignItems: "center", gap: 6
                        }}
                    >
                        <span>{tab.emoji}</span>
                        {tab.label}
                        {tab.key === "log" && logCount > 0 && (
                            <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#CADB00", color: "#1A1A18", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {logCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Error */}
            {error && (
                <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.20)", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#EF4444", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span>{error}</span>
                    <button onClick={fetchSuggestions} style={{ fontSize: 12, fontWeight: 700, color: "#EF4444", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Retry</button>
                </div>
            )}

            {/* ── TAB: Daily Plan ── */}
            {activeTab === "plan" && (
                <>
                    {/* Empty state */}
                    {!suggestions && !loading && (
                        <div style={{ textAlign: "center", padding: "64px 20px", background: "rgba(255,255,255,0.65)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.70)", borderRadius: 24, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
                            <div style={{ fontSize: 52, marginBottom: 16 }}>🥗</div>
                            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1A1A18", marginBottom: 8 }}>No Meal Plan for Today</h2>
                            <p style={{ fontSize: 13, color: "rgba(26,26,24,0.55)", maxWidth: 400, margin: "0 auto 24px" }}>
                                Ready to eat right? Generate your personalized meal plan for the day based on your goals.
                            </p>
                            <button
                                onClick={generateSuggestions}
                                disabled={regenerating}
                                style={{ padding: "14px 32px", borderRadius: 14, border: "none", background: "#1A1A18", color: "#FFF", fontSize: 15, fontWeight: 700, cursor: regenerating ? "not-allowed" : "pointer", opacity: regenerating ? 0.6 : 1, transition: "all 0.15s" }}
                            >
                                {regenerating ? "Generating…" : "Generate Daily Plan"}
                            </button>
                        </div>
                    )}

                    {/* Meal plan */}
                    {suggestions && (
                        <div style={{ opacity: regenerating ? 0.5 : 1, transition: "opacity 0.3s", display: "flex", flexDirection: "column", gap: 20 }}>
                            {/* Macro summary */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12 }}>
                                <MacroCard title="Calories" value={suggestions.total_calories} unit="kcal" accent="#1A1A18" />
                                <MacroCard title="Protein" value={suggestions.total_protein} unit="g" accent="#34C759" />
                                <MacroCard title="Carbs" value={suggestions.total_carbs || "--"} unit="g" accent="#7C6FCD" />
                                <MacroCard title="Fats" value={suggestions.total_fats || "--"} unit="g" accent="#CADB00" />
                            </div>

                            {/* Meal cards */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                                <MealCard title="Breakfast" data={suggestions.breakfast} colorKey="breakfast" />
                                <MealCard title="Lunch" data={suggestions.lunch} colorKey="lunch" />
                                <MealCard title="Dinner" data={suggestions.dinner} colorKey="dinner" />
                                {suggestions.snacks && suggestions.snacks.length > 0 && (
                                    <div>
                                        <h3 style={{ fontSize: 14, fontWeight: 600, color: "rgba(26,26,24,0.55)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>Snacks</h3>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                            {suggestions.snacks.map((snack, idx) => (
                                                <MealCard key={idx} title={`Snack ${idx + 1}`} data={snack} colorKey="snack" />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* CTA to log food */}
                            <div style={{ padding: "16px 20px", borderRadius: 16, background: "rgba(202,219,0,0.08)", border: "1px dashed rgba(202,219,0,0.35)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                                <div>
                                    <p style={{ fontSize: 14, fontWeight: 600, color: "#1A1A18", margin: "0 0 2px" }}>📸 Did you eat something?</p>
                                    <p style={{ fontSize: 12, color: "rgba(26,26,24,0.50)", margin: 0 }}>Upload a photo to log your meal and track your actual intake.</p>
                                </div>
                                <button
                                    onClick={() => setActiveTab("log")}
                                    style={{ padding: "10px 20px", borderRadius: 12, border: "none", background: "#1A1A18", color: "#FFF", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
                                >
                                    Log a Meal →
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ── TAB: Log Food ── */}
            {activeTab === "log" && (
                <div>
                    {/* Section header */}
                    <div style={{ marginBottom: 20 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1A1A18", margin: "0 0 4px" }}>AI Food Analyzer</h2>
                        <p style={{ fontSize: 13, color: "rgba(26,26,24,0.55)", margin: 0 }}>
                            Snap a photo of your meal — our AI will identify it, estimate macros, and save it to your food log and memory automatically.
                        </p>
                    </div>
                    <div className="glass-card" style={{ borderRadius: 24, padding: 24 }}>
                        <FoodAnalyzer onLogSaved={() => setLogCount(c => c + 1)} />
                    </div>
                </div>
            )}
        </div>
    );
}

function MacroCard({ title, value, unit, accent }) {
    return (
        <div className="glass-card" style={{ borderRadius: 18, padding: 16, textAlign: "center", borderTop: `3px solid ${accent}` }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(26,26,24,0.45)", textTransform: "uppercase", letterSpacing: "0.10em" }}>{title}</span>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: "#1A1A18", margin: "4px 0 2px" }}>
                {value}
            </div>
            <span style={{ fontSize: 11, color: "rgba(26,26,24,0.40)" }}>{unit}</span>
        </div>
    );
}

function MealCard({ title, data, colorKey }) {
    if (!data) return null;
    const { border, accent, bg } = MEAL_COLORS[colorKey] || MEAL_COLORS.snack;
    const icon = MEAL_ICONS[colorKey] || "🍽";
    return (
        <div className="glass-card" style={{ borderRadius: 20, borderLeft: `4px solid ${border}`, padding: "18px 20px", background: bg }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <span style={{ fontSize: 22 }}>{icon}</span>
                        <div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.08em" }}>{title}</div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: "#1A1A18" }}>{data.name}</div>
                        </div>
                    </div>
                    {data.description && (
                        <p style={{ fontSize: 13, color: "rgba(26,26,24,0.55)", lineHeight: 1.6, margin: "0 0 10px" }}>{data.description}</p>
                    )}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {data.protein && <NutrientBadge label="Protein" value={data.protein} />}
                        {data.carbs && <NutrientBadge label="Carbs" value={data.carbs} />}
                        {data.fats && <NutrientBadge label="Fats" value={data.fats} />}
                    </div>
                </div>
                <div style={{ textAlign: "right", minWidth: 64 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(26,26,24,0.40)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Energy</div>
                    <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: "#1A1A18", lineHeight: 1 }}>{data.calories}</div>
                    <div style={{ fontSize: 11, color: "rgba(26,26,24,0.40)" }}>kcal</div>
                </div>
            </div>
        </div>
    );
}

function NutrientBadge({ label, value }) {
    if (!value) return null;
    return (
        <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 9999, background: "rgba(26,26,24,0.06)", border: "1px solid rgba(26,26,24,0.08)", color: "rgba(26,26,24,0.60)" }}>
            <span style={{ color: "rgba(26,26,24,0.40)", marginRight: 4 }}>{label}:</span>{value}
        </span>
    );
}
