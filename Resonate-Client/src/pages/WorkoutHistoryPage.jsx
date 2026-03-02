import { useState, useEffect } from 'react';
import { getWithCookie, postWithCookie } from '../api';
import { useNavigate } from 'react-router-dom';

const WorkoutHistoryPage = () => {
    const navigate = useNavigate();
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [completionData, setCompletionData] = useState({ rpe: 7, energyLevel: 7, notes: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => { loadHistory(); }, []);

    const loadHistory = async () => {
        try {
            const res = await getWithCookie('/api/workout/history');
            setWorkouts(res.workouts || []);
        } catch (err) {
            console.error("Failed to load history", err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    const handleComplete = async () => {
        if (!selectedWorkout) return;
        setIsSubmitting(true);
        try {
            await postWithCookie('/api/workout/complete', {
                workoutId: selectedWorkout._id,
                ...completionData
            });
            setWorkouts(prev => prev.map(w =>
                w._id === selectedWorkout._id ? { ...w, status: 'completed' } : w
            ));
            setShowCompleteModal(false);
            setSelectedWorkout(prev => ({ ...prev, status: 'completed' }));
        } catch (err) {
            console.error("Failed to complete workout", err);
            alert("Failed to log workout completion");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1A1A18", margin: "0 0 4px" }}>Workout History</h1>
                    <p style={{ fontSize: 13, color: "rgba(26,26,24,0.55)", margin: 0 }}>Review and log your workout completions.</p>
                </div>
                <button
                    onClick={() => navigate('/workout-generator')}
                    style={{ padding: "10px 18px", borderRadius: 12, border: "none", background: "#1A1A18", color: "#FFF", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                >
                    + New Workout
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid rgba(202,219,0,0.20)", borderTopColor: "#CADB00", animation: "spin 0.8s linear infinite" }} />
                </div>
            ) : workouts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "64px 20px", background: "rgba(255,255,255,0.65)", backdropFilter: "blur(12px)", border: "1.5px dashed rgba(26,26,24,0.15)", borderRadius: 24 }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🏋️</div>
                    <p style={{ fontSize: 15, color: "rgba(26,26,24,0.55)", marginBottom: 20 }}>No workouts generated yet.</p>
                    <button
                        onClick={() => navigate('/workout-generator')}
                        style={{ padding: "12px 28px", borderRadius: 12, border: "none", background: "#1A1A18", color: "#FFF", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
                    >
                        Generate Your First Plan
                    </button>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
                    {workouts.map(workout => (
                        <div
                            key={workout._id}
                            onClick={() => setSelectedWorkout(workout)}
                            className="glass-card"
                            style={{
                                borderRadius: 20, padding: 20, cursor: "pointer",
                                borderTop: `3px solid ${workout.status === 'completed' ? '#34C759' : '#CADB00'}`,
                                transition: "transform 0.15s, box-shadow 0.15s",
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                                <span style={{ fontSize: 11, color: "rgba(26,26,24,0.40)", fontVariantNumeric: "tabular-nums" }}>
                                    {formatDate(workout.createdAt)}
                                </span>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    {workout.status === 'completed' && (
                                        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 9999, background: "rgba(52,199,89,0.10)", color: "#14532D", border: "1px solid rgba(52,199,89,0.25)" }}>
                                            ✓ Done
                                        </span>
                                    )}
                                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 9999, background: "rgba(124,111,205,0.10)", color: "#4A3D6B" }}>
                                        {workout.inputs?.fitnessLevel || 'Custom'}
                                    </span>
                                </div>
                            </div>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1A1A18", marginBottom: 8 }}>
                                {workout.plan.title || "Workout Plan"}
                            </h3>
                            <div style={{ display: "flex", gap: 14, fontSize: 12, color: "rgba(26,26,24,0.50)", marginBottom: 10 }}>
                                <span>⏱ {workout.plan.duration}</span>
                                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>🎯 {workout.plan.focus}</span>
                            </div>
                            <div style={{ fontSize: 12, color: "rgba(26,26,24,0.40)" }}>
                                {workout.plan.exercises?.length || 0} exercises
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Workout detail modal */}
            {selectedWorkout && (
                <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.40)", backdropFilter: "blur(8px)" }}>
                    <div style={{
                        background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)",
                        borderRadius: 24, border: "1px solid rgba(255,255,255,0.80)",
                        boxShadow: "0 24px 64px rgba(0,0,0,0.15)",
                        width: "100%", maxWidth: 600, maxHeight: "90vh",
                        display: "flex", flexDirection: "column", overflow: "hidden",
                        fontFamily: "'DM Sans', sans-serif",
                    }}>
                        {/* Modal header */}
                        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(26,26,24,0.08)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1A1A18", margin: "0 0 4px" }}>{selectedWorkout.plan.title}</h2>
                                <div style={{ fontSize: 12, color: "rgba(26,26,24,0.45)", display: "flex", gap: 12 }}>
                                    <span>{formatDate(selectedWorkout.createdAt)}</span>
                                    <span>•</span>
                                    <span>{selectedWorkout.plan.duration}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedWorkout(null)}
                                style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(26,26,24,0.06)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#1A1A18" }}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal body */}
                        <div style={{ padding: "20px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
                            {/* Warmup */}
                            <div style={{ background: "rgba(52,199,89,0.06)", border: "1px solid rgba(52,199,89,0.15)", borderRadius: 14, padding: "14px 16px" }}>
                                <h3 style={{ fontSize: 11, fontWeight: 700, color: "#14532D", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Warmup</h3>
                                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                                    {selectedWorkout.plan.warmup?.map((ex, i) => (
                                        <li key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#1A1A18" }}>
                                            <span>{ex.name}</span>
                                            <span style={{ color: "rgba(26,26,24,0.45)" }}>{ex.duration || ex.reps}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Main circuit */}
                            <div>
                                <h3 style={{ fontSize: 11, fontWeight: 700, color: "#3D4000", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Main Circuit</h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    {selectedWorkout.plan.exercises?.map((ex, i) => (
                                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(202,219,0,0.07)", border: "1px solid rgba(202,219,0,0.18)", borderRadius: 12, padding: "10px 14px" }}>
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: "#1A1A18" }}>{ex.name}</div>
                                                <div style={{ fontSize: 12, color: "rgba(26,26,24,0.45)", marginTop: 2 }}>
                                                    {ex.sets && `${ex.sets} sets`}{ex.sets && ex.reps && ' × '}{ex.reps && `${ex.reps}`}{ex.duration && `${ex.duration}`}
                                                </div>
                                                {ex.notes && <div style={{ fontSize: 11, color: "#E07A3A", marginTop: 2, fontStyle: "italic" }}>{ex.notes}</div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Cooldown */}
                            <div style={{ background: "rgba(124,111,205,0.06)", border: "1px solid rgba(124,111,205,0.15)", borderRadius: 14, padding: "14px 16px" }}>
                                <h3 style={{ fontSize: 11, fontWeight: 700, color: "#4A3D6B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Cooldown</h3>
                                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                                    {selectedWorkout.plan.cooldown?.map((ex, i) => (
                                        <li key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#1A1A18" }}>
                                            <span>{ex.name}</span>
                                            <span style={{ color: "rgba(26,26,24,0.45)" }}>{ex.duration || ex.reps}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Actions */}
                            {selectedWorkout.status !== 'completed' ? (
                                <button
                                    onClick={() => setShowCompleteModal(true)}
                                    style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "#1A1A18", color: "#FFF", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}
                                >
                                    Log as Completed
                                </button>
                            ) : (
                                <div style={{ textAlign: "center", padding: "12px", fontSize: 14, fontWeight: 700, color: "#14532D", background: "rgba(52,199,89,0.08)", borderRadius: 12, border: "1px solid rgba(52,199,89,0.20)" }}>
                                    ✓ Workout Completed
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Completion modal */}
            {showCompleteModal && (
                <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.50)", backdropFilter: "blur(12px)" }}>
                    <div style={{ background: "rgba(255,255,255,0.97)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.80)", boxShadow: "0 24px 64px rgba(0,0,0,0.15)", width: "100%", maxWidth: 440, padding: 28, fontFamily: "'DM Sans', sans-serif" }}>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1A1A18", marginBottom: 24 }}>Log Completion</h2>

                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(26,26,24,0.60)", display: "block", marginBottom: 8 }}>Rate of Perceived Exertion (RPE)</label>
                                <input
                                    type="range" min="1" max="10"
                                    value={completionData.rpe}
                                    onChange={(e) => setCompletionData({ ...completionData, rpe: parseInt(e.target.value) })}
                                    style={{ width: "100%", accentColor: "#CADB00" }}
                                />
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(26,26,24,0.40)", marginTop: 4 }}>
                                    <span>Easy</span>
                                    <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: 18, color: "#1A1A18" }}>{completionData.rpe}</span>
                                    <span>Max Effort</span>
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(26,26,24,0.60)", display: "block", marginBottom: 8 }}>Energy Level</label>
                                <input
                                    type="range" min="1" max="10"
                                    value={completionData.energyLevel}
                                    onChange={(e) => setCompletionData({ ...completionData, energyLevel: parseInt(e.target.value) })}
                                    style={{ width: "100%", accentColor: "#7C6FCD" }}
                                />
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(26,26,24,0.40)", marginTop: 4 }}>
                                    <span>Exhausted</span>
                                    <span style={{ fontFamily: "'DM Serif Display',serif", fontSize: 18, color: "#1A1A18" }}>{completionData.energyLevel}</span>
                                    <span>Energized</span>
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(26,26,24,0.60)", display: "block", marginBottom: 8 }}>Notes (Optional)</label>
                                <textarea
                                    value={completionData.notes}
                                    onChange={(e) => setCompletionData({ ...completionData, notes: e.target.value })}
                                    style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "2px solid rgba(26,26,24,0.12)", fontSize: 13, color: "#1A1A18", resize: "none", outline: "none", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box" }}
                                    rows="3"
                                    placeholder="How did it feel?"
                                />
                            </div>

                            <div style={{ display: "flex", gap: 10 }}>
                                <button
                                    onClick={() => setShowCompleteModal(false)}
                                    style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid rgba(26,26,24,0.15)", background: "rgba(26,26,24,0.05)", fontSize: 14, fontWeight: 600, color: "rgba(26,26,24,0.70)", cursor: "pointer" }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleComplete}
                                    disabled={isSubmitting}
                                    style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: isSubmitting ? "rgba(26,26,24,0.08)" : "#1A1A18", color: isSubmitting ? "rgba(26,26,24,0.40)" : "#FFF", fontSize: 14, fontWeight: 700, cursor: isSubmitting ? "not-allowed" : "pointer", transition: "all 0.15s" }}
                                >
                                    {isSubmitting ? "Saving…" : "Confirm Log"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default WorkoutHistoryPage;
