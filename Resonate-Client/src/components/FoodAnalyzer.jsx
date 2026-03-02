import React, { useState } from "react";
import { analyzeFoodImage } from "../api";
import { Upload, Loader2, AlertCircle, Camera, CheckCircle2 } from "lucide-react";

const CUISINES = ["General", "Indian", "Italian", "Chinese", "Mexican", "Japanese", "Mediterranean", "American", "Thai", "Homemade"];

const MacroChip = ({ label, value, color }) => (
    <div style={{
        flex: 1, minWidth: 60, textAlign: "center", padding: "8px 6px",
        borderRadius: 12, background: `${color}10`, border: `1px solid ${color}25`
    }}>
        <div style={{ fontSize: 14, fontWeight: 700, color }}>{value}</div>
        <div style={{ fontSize: 10, color: "rgba(26,26,24,0.45)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>{label}</div>
    </div>
);

const HealthRatingBar = ({ rating }) => {
    const color = rating >= 7 ? "#34C759" : rating >= 4 ? "#E07A3A" : "#EF4444";
    const label = rating >= 7 ? "Great choice!" : rating >= 4 ? "Moderate" : "Indulge wisely";
    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(26,26,24,0.45)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Health Score</span>
                <span style={{ fontSize: 11, fontWeight: 700, color }}>{label}</span>
            </div>
            <div style={{ height: 6, borderRadius: 9999, background: "rgba(26,26,24,0.08)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${rating * 10}%`, background: color, borderRadius: 9999, transition: "width 0.8s ease" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontSize: 10, color: "rgba(26,26,24,0.35)" }}>0</span>
                <span style={{ fontSize: 13, fontWeight: 800, color }}>{rating}<span style={{ fontSize: 11, fontWeight: 500, color: "rgba(26,26,24,0.35)" }}>/10</span></span>
                <span style={{ fontSize: 10, color: "rgba(26,26,24,0.35)" }}>10</span>
            </div>
        </div>
    );
};

const FoodAnalyzer = ({ onLogSaved }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [cuisine, setCuisine] = useState("General");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");
    const [saved, setSaved] = useState(false);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
            setError("");
            setResult(null);
            setSaved(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const dropped = e.dataTransfer.files[0];
        if (dropped && dropped.type.startsWith("image/")) {
            setFile(dropped);
            setPreview(URL.createObjectURL(dropped));
            setError("");
            setResult(null);
            setSaved(false);
        }
    };

    const handleAnalyze = async () => {
        if (!file) { setError("Please upload a food image first."); return; }
        setLoading(true);
        setError("");
        setResult(null);
        try {
            const response = await analyzeFoodImage(file, cuisine);
            setResult(response.data);
            setSaved(true); // Server auto-saves on analyze
            if (onLogSaved) onLogSaved();
        } catch (err) {
            setError(err.message || "Failed to analyze food. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setPreview(null);
        setResult(null);
        setError("");
        setSaved(false);
    };

    return (
        <div style={{ fontFamily: "'DM Sans', sans-serif", display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Upload + Cuisine Row */}
            {!result && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

                    {/* Drag & Drop Zone */}
                    <div
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        style={{
                            position: "relative", borderRadius: 20,
                            border: "2px dashed rgba(202,219,0,0.40)",
                            background: preview ? "transparent" : "rgba(202,219,0,0.04)",
                            minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center",
                            overflow: "hidden", cursor: "pointer", transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => { if (!preview) e.currentTarget.style.borderColor = "rgba(202,219,0,0.70)"; }}
                        onMouseLeave={(e) => { if (!preview) e.currentTarget.style.borderColor = "rgba(202,219,0,0.40)"; }}
                    >
                        <input
                            type="file" accept="image/*" onChange={handleFileChange}
                            style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", zIndex: 10 }}
                        />
                        {preview ? (
                            <img src={preview} alt="Food preview" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 18 }} />
                        ) : (
                            <div style={{ textAlign: "center", padding: 24 }}>
                                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(202,219,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                                    <Camera size={24} style={{ color: "#7A8500" }} />
                                </div>
                                <p style={{ fontSize: 14, fontWeight: 600, color: "#1A1A18", marginBottom: 4 }}>Drop your meal photo</p>
                                <p style={{ fontSize: 12, color: "rgba(26,26,24,0.45)" }}>or click to browse — JPG, PNG, WEBP</p>
                            </div>
                        )}
                    </div>

                    {/* Settings panel */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <div>
                            <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(26,26,24,0.45)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 8 }}>
                                Cuisine Type
                            </label>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {CUISINES.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setCuisine(c)}
                                        style={{
                                            padding: "5px 12px", borderRadius: 9999, fontSize: 12, fontWeight: 600,
                                            border: cuisine === c ? "1.5px solid #CADB00" : "1.5px solid rgba(26,26,24,0.12)",
                                            background: cuisine === c ? "rgba(202,219,0,0.15)" : "transparent",
                                            color: cuisine === c ? "#5A6000" : "rgba(26,26,24,0.55)",
                                            cursor: "pointer", transition: "all 0.15s"
                                        }}
                                    >{c}</button>
                                ))}
                            </div>
                        </div>

                        {/* Info note */}
                        <div style={{ padding: "10px 14px", borderRadius: 12, background: "rgba(52,199,89,0.07)", border: "1px solid rgba(52,199,89,0.15)", fontSize: 12, color: "rgba(26,26,24,0.55)", lineHeight: 1.6 }}>
                            📸 Upload a clear photo of your food for best accuracy. Your meal will be automatically saved to your food log and memory.
                        </div>

                        {/* Analyze button */}
                        <button
                            onClick={handleAnalyze}
                            disabled={loading || !file}
                            style={{
                                width: "100%", padding: "14px", borderRadius: 14, border: "none",
                                background: loading || !file ? "rgba(26,26,24,0.07)" : "linear-gradient(135deg, #CADB00 0%, #B8C900 100%)",
                                color: loading || !file ? "rgba(26,26,24,0.35)" : "#1A1A18",
                                fontSize: 14, fontWeight: 700, cursor: loading || !file ? "not-allowed" : "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                transition: "all 0.15s", boxShadow: loading || !file ? "none" : "0 4px 16px rgba(202,219,0,0.30)"
                            }}
                        >
                            {loading ? (
                                <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Analyzing your meal…</>
                            ) : (
                                <><Upload size={16} /> Analyze & Log Food</>
                            )}
                        </button>

                        {error && (
                            <div style={{ display: "flex", gap: 8, padding: "10px 14px", borderRadius: 12, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.15)", fontSize: 13, color: "#EF4444" }}>
                                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Loading shimmer */}
            {loading && (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", border: "3px solid rgba(202,219,0,0.20)", borderTopColor: "#CADB00", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
                    <p style={{ fontSize: 13, color: "rgba(26,26,24,0.55)", fontStyle: "italic" }}>Identifying ingredients and calculating macros…</p>
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </div>
            )}

            {/* Result Card */}
            {result && !loading && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                    {/* Saved banner */}
                    {saved && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 12, background: "rgba(52,199,89,0.10)", border: "1px solid rgba(52,199,89,0.20)", fontSize: 13, color: "#15803d" }}>
                            <CheckCircle2 size={16} />
                            <span className="font-semibold">Logged successfully!</span>
                            <span style={{ color: "rgba(26,26,24,0.50)" }}>— saved to your food log & AI memory.</span>
                        </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

                        {/* Left: Image + food name */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {preview && (
                                <img src={preview} alt={result.food_name} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", borderRadius: 16 }} />
                            )}
                            <div style={{ padding: "14px 16px", borderRadius: 16, background: "rgba(255,255,255,0.65)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.70)" }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(26,26,24,0.40)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Identified Dish</div>
                                <div style={{ fontSize: 20, fontWeight: 800, color: "#1A1A18", marginBottom: 4 }}>{result.food_name}</div>
                                <div style={{ fontSize: 13, color: "rgba(26,26,24,0.55)", lineHeight: 1.6 }}>{result.description}</div>
                            </div>
                        </div>

                        {/* Right: Nutrition */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                            {/* Calories hero */}
                            <div style={{ textAlign: "center", padding: "16px", borderRadius: 16, background: "rgba(26,26,24,0.04)", border: "1px solid rgba(26,26,24,0.08)" }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(26,26,24,0.40)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Total Calories</div>
                                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 40, color: "#1A1A18", lineHeight: 1 }}>{result.nutritional_info?.calories}</div>
                                <div style={{ fontSize: 12, color: "rgba(26,26,24,0.40)", marginTop: 4 }}>kcal</div>
                            </div>

                            {/* Macros row */}
                            <div style={{ display: "flex", gap: 8 }}>
                                <MacroChip label="Protein" value={result.nutritional_info?.protein} color="#34C759" />
                                <MacroChip label="Carbs" value={result.nutritional_info?.carbohydrates} color="#7C6FCD" />
                                <MacroChip label="Fats" value={result.nutritional_info?.fats} color="#E07A3A" />
                                <MacroChip label="Fiber" value={result.nutritional_info?.fiber} color="#CADB00" />
                            </div>

                            {/* Health score */}
                            <div style={{ padding: "14px 16px", borderRadius: 16, background: "rgba(255,255,255,0.65)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.70)" }}>
                                <HealthRatingBar rating={result.health_rating || 5} />
                            </div>

                            {/* Ingredients */}
                            {result.ingredients?.length > 0 && (
                                <div style={{ padding: "12px 14px", borderRadius: 14, background: "rgba(26,26,24,0.03)", border: "1px solid rgba(26,26,24,0.07)" }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(26,26,24,0.40)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Ingredients</div>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                                        {result.ingredients.map((ing, i) => (
                                            <span key={i} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 9999, background: "rgba(202,219,0,0.10)", border: "1px solid rgba(202,219,0,0.20)", color: "#5A6000", fontWeight: 500 }}>
                                                {ing}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Coach tip */}
                    {result.suggestions && (
                        <div style={{ padding: "14px 18px", borderRadius: 16, background: "rgba(124,111,205,0.06)", border: "1px solid rgba(124,111,205,0.15)" }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "#7C6FCD", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                                🧠 AI Coach's Tip
                            </div>
                            <p style={{ fontSize: 13, color: "rgba(26,26,24,0.65)", lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>"{result.suggestions}"</p>
                        </div>
                    )}

                    {/* Log another */}
                    <button
                        onClick={handleReset}
                        style={{ alignSelf: "flex-start", padding: "10px 20px", borderRadius: 12, border: "1.5px solid rgba(26,26,24,0.15)", background: "transparent", fontSize: 13, fontWeight: 600, color: "rgba(26,26,24,0.65)", cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 6 }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(26,26,24,0.05)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                        <Camera size={14} /> Log Another Meal
                    </button>
                </div>
            )}

            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
};

export default FoodAnalyzer;
