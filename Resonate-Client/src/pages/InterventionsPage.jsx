import React, { useState, useEffect } from 'react';
import AddInterventionModal from '../components/AddInterventionModal';
import { getAllInterventions, stopIntervention } from '../api';

const ICONS = {
    supplement: '💊', diet: '🥗', fitness: '💪', meditation: '🧘',
};

const STATUS_STYLE = {
    active: { bg: "rgba(52,199,89,0.10)", border: "rgba(52,199,89,0.25)", color: "#14532D", label: "Active" },
    completed: { bg: "rgba(124,111,205,0.10)", border: "rgba(124,111,205,0.25)", color: "#4A3D6B", label: "Completed" },
    discontinued: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.20)", color: "#991B1B", label: "Discontinued" },
};

export default function InterventionsPage() {
    const [interventions, setInterventions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIntervention, setEditingIntervention] = useState(null);
    const [activeTab, setActiveTab] = useState('active');

    const fetchInterventions = async () => {
        try {
            setLoading(true);
            const data = await getAllInterventions();
            setInterventions(data.interventions);
        } catch (err) {
            console.error(err);
            setError('Failed to load interventions');
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async (id, name) => {
        if (!window.confirm(`Mark ${name} as successfully completed?`)) return;
        try {
            await stopIntervention(id, 'completed');
            fetchInterventions();
        } catch (err) {
            console.error(err);
            alert("Failed to update intervention");
        }
    };

    const handleDiscontinue = async (id, name) => {
        const reason = window.prompt(`Why are you stopping ${name}? (Optional)`);
        if (reason === null) return;
        try {
            await stopIntervention(id, 'discontinued', reason);
            fetchInterventions();
        } catch (err) {
            console.error(err);
            alert("Failed to stop intervention");
        }
    };

    const handleEdit = (intervention) => {
        setEditingIntervention(intervention);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingIntervention(null);
    };

    const handleRestart = (intervention) => {
        const { _id, createdAt, updatedAt, outcomes, endDate, discontinuationReason, ...restartData } = intervention;
        setEditingIntervention({ ...restartData, status: 'active', startDate: new Date().toISOString().split('T')[0] });
        setIsModalOpen(true);
    };

    useEffect(() => { fetchInterventions(); }, []);

    const activeInterventions = interventions.filter(i => i.status === 'active');
    const historyInterventions = interventions.filter(i => i.status !== 'active');
    const displayedInterventions = activeTab === 'active' ? activeInterventions : historyInterventions;

    return (
        <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: "#1A1A18", margin: "0 0 4px" }}>
                        Interventions <span style={{ color: "#CADB00" }}>Manager</span>
                    </h1>
                    <p style={{ fontSize: 13, color: "rgba(26,26,24,0.55)", margin: 0 }}>Track your active protocols and health experiments.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{ padding: "10px 20px", borderRadius: 12, border: "none", background: "#1A1A18", color: "#FFF", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
                >
                    <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> New Intervention
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 0, borderBottom: "2px solid rgba(26,26,24,0.08)", marginBottom: 20 }}>
                {["active", "history"].map(tab => {
                    const count = tab === "active" ? activeInterventions.length : historyInterventions.length;
                    const isActive = activeTab === tab;
                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: "10px 18px", border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: 700,
                                color: isActive ? "#1A1A18" : "rgba(26,26,24,0.40)",
                                borderBottom: isActive ? "2px solid #CADB00" : "2px solid transparent",
                                marginBottom: -2, transition: "all 0.15s", textTransform: "uppercase", letterSpacing: "0.06em",
                            }}
                        >
                            {tab === "active" ? `Active (${count})` : `History (${count})`}
                        </button>
                    );
                })}
            </div>

            {/* Error */}
            {error && (
                <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.20)", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#EF4444", marginBottom: 16, textAlign: "center" }}>
                    {error}
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid rgba(202,219,0,0.20)", borderTopColor: "#CADB00", animation: "spin 0.8s linear infinite" }} />
                </div>
            ) : displayedInterventions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "64px 20px", background: "rgba(255,255,255,0.65)", backdropFilter: "blur(12px)", border: "1.5px dashed rgba(26,26,24,0.15)", borderRadius: 24 }}>
                    <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>🧪</div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1A1A18", marginBottom: 8 }}>
                        No {activeTab} interventions
                    </h3>
                    <p style={{ fontSize: 13, color: "rgba(26,26,24,0.55)", maxWidth: 360, margin: "0 auto 20px" }}>
                        {activeTab === 'active'
                            ? "You're not tracking any active protocols. Start an experiment!"
                            : "You haven't completed or discontinued any protocols yet."}
                    </p>
                    {activeTab === 'active' && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            style={{ fontSize: 13, fontWeight: 700, color: "#3D4000", textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}
                        >
                            Add your first protocol
                        </button>
                    )}
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
                    {displayedInterventions.map((item) => {
                        const ss = STATUS_STYLE[item.status] || STATUS_STYLE.discontinued;
                        return (
                            <div
                                key={item._id}
                                className="glass-card"
                                style={{
                                    borderRadius: 20, padding: 20,
                                    opacity: item.status !== 'active' ? 0.80 : 1,
                                    borderTop: `3px solid ${item.status === 'active' ? '#CADB00' : item.status === 'completed' ? '#7C6FCD' : '#EF4444'}`,
                                    transition: "transform 0.15s",
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
                            >
                                {/* Card header */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(26,26,24,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                                        {ICONS[item.type] || '⚡'}
                                    </div>
                                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                        <button
                                            onClick={() => handleEdit(item)}
                                            style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(26,26,24,0.06)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                            title="Edit"
                                        >
                                            <svg width="14" height="14" fill="none" stroke="#1A1A18" strokeWidth="1.7" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </button>
                                        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 9999, background: ss.bg, border: `1px solid ${ss.border}`, color: ss.color, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                            {item.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Title & rationale */}
                                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1A1A18", marginBottom: 6, lineHeight: 1.4 }}>{item.recommendation}</h3>
                                {item.rationale && <p style={{ fontSize: 12, color: "rgba(26,26,24,0.55)", marginBottom: 10, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.rationale}</p>}

                                {/* Meta */}
                                <div style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12, color: "rgba(26,26,24,0.55)", marginBottom: 14 }}>
                                    <span>⏱️ {item.durationDays} days</span>
                                    <span>🎯 {item.targetMetric}: {item.targetValue}%</span>
                                    <span>📅 Started {new Date(item.startDate).toLocaleDateString()}</span>
                                    {item.endDate && item.status !== 'active' && (
                                        <span style={{ color: "#DC2626" }}>🛑 Ended {new Date(item.endDate).toLocaleDateString()}</span>
                                    )}
                                </div>

                                {/* Actions */}
                                {(() => {
                                    const daysSince = Math.max(1, Math.floor((Date.now() - new Date(item.startDate)) / 86400000));
                                    const compliance = Math.min(Math.round(((item.outcomes?.length || 0) / daysSince) * 100), 100);
                                    return item.status === 'active' ? (
                                        <div>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                                <span style={{ fontSize: 11, color: "rgba(26,26,24,0.45)" }}>Day {daysSince} / {item.durationDays}</span>
                                                <span style={{ fontSize: 11, fontWeight: 700, color: compliance >= 70 ? "#34C759" : compliance >= 40 ? "#F59E42" : "rgba(26,26,24,0.45)" }}>
                                                    {compliance}% compliance
                                                </span>
                                            </div>
                                            <div style={{ height: 4, borderRadius: 2, background: "rgba(26,26,24,0.08)", overflow: "hidden", marginBottom: 10 }}>
                                                <div style={{ height: "100%", width: `${compliance}%`, background: compliance >= 70 ? "#CADB00" : compliance >= 40 ? "#F59E42" : "#EF4444", borderRadius: 2, transition: "width 0.8s ease-out" }} />
                                            </div>

                                            <div style={{ display: "flex", gap: 8 }}>
                                                <button
                                                    onClick={() => handleComplete(item._id, item.recommendation)}
                                                    style={{ flex: 1, padding: "8px 0", fontSize: 12, fontWeight: 700, borderRadius: 8, border: "1px solid rgba(52,199,89,0.25)", background: "rgba(52,199,89,0.08)", color: "#14532D", cursor: "pointer" }}
                                                >
                                                    Complete
                                                </button>
                                                <button
                                                    onClick={() => handleDiscontinue(item._id, item.recommendation)}
                                                    style={{ flex: 1, padding: "8px 0", fontSize: 12, fontWeight: 700, borderRadius: 8, border: "1px solid rgba(239,68,68,0.20)", background: "rgba(239,68,68,0.06)", color: "#DC2626", cursor: "pointer" }}
                                                >
                                                    Discontinue
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                            <div style={{ flex: 1, textAlign: "center", fontSize: 12, fontWeight: 600, color: "rgba(26,26,24,0.45)", padding: "8px 0", borderRadius: 8, background: "rgba(26,26,24,0.04)" }}>
                                                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                            </div>
                                            <button
                                                onClick={() => handleRestart(item)}
                                                style={{ padding: "8px 14px", fontSize: 12, fontWeight: 700, borderRadius: 8, border: "1.5px solid rgba(202,219,0,0.40)", background: "rgba(202,219,0,0.10)", color: "#3D4000", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                                            >
                                                <svg width="12" height="12" fill="none" stroke="#3D4000" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                                Restart
                                            </button>
                                        </div>
                                    );
                                })()}
                            </div>
                        );
                    })}
                </div>
            )}

            <AddInterventionModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onInterventionAdded={fetchInterventions}
                initialData={editingIntervention}
            />

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
