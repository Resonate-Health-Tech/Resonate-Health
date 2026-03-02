import { useState } from 'react';
import { postWithCookie } from '../api';
import { useNavigate } from 'react-router-dom';

const InterventionSuggestions = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [error, setError] = useState(null);
    const [contextUsed, setContextUsed] = useState(null);

    const generateSuggestions = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await postWithCookie('/api/interventions/suggest', {});
            setSuggestions(res.suggestions || []);
            setContextUsed(res.contextUsed);
        } catch (err) {
            setError(err.message || "Failed to generate suggestions");
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (suggestion) => {
        try {
            // Map AI suggestion fields to Intervention model fields:
            // AI returns:  description → model needs: recommendation
            // AI returns:  rationale   → model needs: rationale (direct)
            // AI returns:  duration (string e.g. "14") → model needs: durationDays (number)
            const durationDays = parseInt(suggestion.duration, 10) || 14;
            const startDate = new Date();
            const endDate = new Date(startDate.getTime() + durationDays * 86400000);

            await postWithCookie('/api/interventions', {
                type: suggestion.type,
                recommendation: suggestion.description,   // model field is 'recommendation'
                rationale: suggestion.rationale || suggestion.description,
                status: 'active',
                startDate,
                endDate,
                durationDays,
            });
            alert("Intervention added to your active plans!");
            setSuggestions(prev => prev.filter(s => s !== suggestion));
        } catch (err) {
            alert("Failed to add intervention: " + err.message);
        }
    };

    return (
        <div className="min-h-screen p-6 pb-24" style={{ background: "linear-gradient(135deg, #EEF5E0 0%, #EAF0F8 45%, #F3EEF5 100%)" }}>
            <div className="max-w-4xl mx-auto">
                <header className="mb-10 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: "rgba(202,219,0,0.15)", border: "1px solid rgba(202,219,0,0.30)" }}>
                        <span className="text-3xl">🧬</span>
                    </div>
                    <h1 className="text-4xl font-black mb-3" style={{ color: "#1A1A18" }}>
                        AI Health Interventions
                    </h1>
                    <p className="text-base" style={{ color: "rgba(26,26,24,0.55)" }}>
                        Personalized strategies based on your recent sleep, stress, and activity data.
                    </p>
                </header>

                {suggestions.length === 0 && !loading && (
                    <div className="glass-card rounded-3xl p-12 text-center">
                        <div className="mb-6 text-6xl">🧬</div>
                        <h2 className="text-2xl font-bold mb-4" style={{ color: "#1A1A18" }}>Ready to optimize your health?</h2>
                        <p className="mb-8 max-w-md mx-auto" style={{ color: "rgba(26,26,24,0.55)" }}>
                            Our AI analyzes your recent logs to find areas for improvement.
                        </p>
                        <button
                            onClick={generateSuggestions}
                            className="px-8 py-4 rounded-2xl font-bold text-lg active:scale-95 transition-all"
                            style={{ background: "linear-gradient(135deg, #CADB00 0%, #B8C900 100%)", color: "#1A1A18", boxShadow: "0 4px 20px rgba(202,219,0,0.30)" }}
                        >
                            Generate Suggestions
                        </button>
                    </div>
                )}

                {loading && (
                    <div className="flex flex-col items-center py-20">
                        <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mb-4" style={{ borderColor: "rgba(202,219,0,0.30)", borderTopColor: "transparent" }}>
                            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                        </div>
                        <p className="text-xl font-semibold animate-pulse" style={{ color: "#1A1A18" }}>Analyzing your health data...</p>
                        <p className="text-sm mt-2" style={{ color: "rgba(26,26,24,0.50)" }}>Checking sleep patterns, stress levels, and nutrition adherence</p>
                    </div>
                )}

                {error && (
                    <div className="glass-card rounded-2xl p-6 text-center mb-8" style={{ borderLeft: "4px solid rgba(239,68,68,0.60)" }}>
                        <p style={{ color: "#DC2626" }}>{error}</p>
                        <button onClick={generateSuggestions} className="mt-4 text-sm font-semibold underline" style={{ color: "rgba(26,26,24,0.55)" }}>Try Again</button>
                    </div>
                )}

                {suggestions.length > 0 && (
                    <div className="grid gap-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xl font-bold" style={{ color: "#1A1A18" }}>Recommended for You</h3>
                            <button onClick={generateSuggestions} className="text-sm font-semibold" style={{ color: "rgba(26,26,24,0.50)" }}>Regenerate</button>
                        </div>

                        {suggestions.map((suggestion, idx) => (
                            <div key={idx} className="glass-card p-6 rounded-2xl active:scale-[0.99] transition-all">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                                                style={{
                                                    background: suggestion.type === 'sleep' ? 'rgba(99,102,241,0.10)' :
                                                        suggestion.type === 'nutrition' ? 'rgba(202,219,0,0.12)' :
                                                            suggestion.type === 'stress' ? 'rgba(245,165,36,0.10)' :
                                                                'rgba(59,130,246,0.10)',
                                                    color: suggestion.type === 'sleep' ? '#4338CA' :
                                                        suggestion.type === 'nutrition' ? '#5A6000' :
                                                            suggestion.type === 'stress' ? '#B45309' :
                                                                '#1D4ED8'
                                                }}>
                                                {suggestion.type}
                                            </span>
                                            {suggestion.priority === 'high' && (
                                                <span className="flex items-center text-xs font-bold gap-1" style={{ color: "#DC2626" }}>
                                                    <span className="animate-pulse">●</span> High Priority
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold mb-2" style={{ color: "#1A1A18" }}>{suggestion.title}</h3>
                                        <p className="leading-relaxed mb-4" style={{ color: "rgba(26,26,24,0.55)" }}>{suggestion.description}</p>

                                        {suggestion.reasoning && (
                                            <div className="p-3 rounded-xl text-sm italic mb-4" style={{ background: "rgba(26,26,24,0.04)", color: "rgba(26,26,24,0.55)" }}>
                                                "{suggestion.reasoning}"
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4 text-sm" style={{ color: "rgba(26,26,24,0.45)" }}>
                                            <span className="flex items-center gap-1">
                                                ⏱ {suggestion.durationDays || 14} Days
                                            </span>
                                            <span className="flex items-center gap-1">
                                                💪 Difficulty: {suggestion.difficulty || 'Medium'}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleAccept(suggestion)}
                                        className="px-5 py-3 rounded-xl font-semibold transition-all flex-shrink-0 active:scale-95"
                                        style={{ background: "rgba(202,219,0,0.12)", color: "#5A6000", border: "1px solid rgba(202,219,0,0.25)" }}
                                    >
                                        Accept Plan
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {contextUsed && suggestions.length > 0 && (
                    <div className="mt-10 p-6 glass-card rounded-2xl">
                        <h4 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "rgba(26,26,24,0.35)" }}>AI Context Used</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono" style={{ color: "rgba(26,26,24,0.55)" }}>
                            <div>
                                <strong className="block mb-1" style={{ color: "#1A1A18" }}>Recent Events:</strong>
                                <ul className="list-disc pl-4 space-y-1">
                                    {contextUsed.recent_events?.slice(0, 5).map((e, i) => (
                                        <li key={i}>{e}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <strong className="block mb-1" style={{ color: "#1A1A18" }}>Key Facts:</strong>
                                <ul className="list-disc pl-4 space-y-1">
                                    {contextUsed.key_facts?.map((e, i) => (
                                        <li key={i}>{e}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default InterventionSuggestions;

