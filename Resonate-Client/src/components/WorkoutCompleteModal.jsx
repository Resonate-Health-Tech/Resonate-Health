import { useState } from 'react';

/**
 * Modal for capturing real RPE + energy level when marking a workout complete.
 * Props:
 *  - isOpen: boolean
 *  - onSave(rpe, energyLevel, notes): called with real user values
 *  - onSkip(): called when user skips rating
 *  - onClose(): called when user dismisses without action
 */
export default function WorkoutCompleteModal({ isOpen, onSave, onSkip, onClose }) {
    const [rpe, setRpe] = useState(null);
    const [energyLevel, setEnergyLevel] = useState(null);
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);

    if (!isOpen) return null;

    const handleSave = async () => {
        setSaving(true);
        await onSave(rpe, energyLevel, notes.trim());
        setSaving(false);
    };

    const handleSkip = async () => {
        setSaving(true);
        await onSkip();
        setSaving(false);
    };

    const RatingRow = ({ label, value, onChange, color = '#CADB00' }) => (
        <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1A18', margin: 0 }}>{label}</p>
                {value && (
                    <span style={{ fontSize: 13, fontWeight: 800, color, background: `${color}18`, padding: '2px 10px', borderRadius: 9999 }}>
                        {value}/10
                    </span>
                )}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <button
                        key={n}
                        onClick={() => onChange(n)}
                        style={{
                            flex: 1, aspectRatio: '1', borderRadius: 10, border: 'none',
                            fontSize: 12, fontWeight: 700, cursor: 'pointer',
                            transition: 'all 0.12s',
                            background: value === n
                                ? color
                                : value && n < value
                                    ? `${color}30`
                                    : 'rgba(26,26,24,0.06)',
                            color: value === n ? '#1A1A18' : value && n < value ? '#1A1A18' : 'rgba(26,26,24,0.40)',
                            transform: value === n ? 'scale(1.1)' : 'scale(1)',
                        }}
                    >
                        {n}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        /* Overlay */
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(0,0,0,0.40)', backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            }}
        >
            {/* Sheet */}
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    width: '100%', maxWidth: 520,
                    background: '#fff',
                    borderRadius: '28px 28px 0 0',
                    padding: '28px 24px 36px',
                    fontFamily: "'DM Sans', sans-serif",
                    boxShadow: '0 -8px 48px rgba(0,0,0,0.14)',
                    animation: 'wcmSlideUp 0.28s cubic-bezier(0.34,1.56,0.64,1)',
                }}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1A1A18', margin: 0 }}>
                        🎯 How did it go?
                    </h2>
                    <button
                        onClick={onClose}
                        style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'rgba(26,26,24,0.07)', cursor: 'pointer', fontSize: 16, color: '#1A1A18' }}
                    >
                        ✕
                    </button>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(26,26,24,0.50)', marginBottom: 24, marginTop: 4 }}>
                    Rate your session so we can personalise your next workout.
                </p>

                {/* RPE */}
                <RatingRow
                    label="Effort (RPE) — How hard did you push?"
                    value={rpe}
                    onChange={setRpe}
                    color="#CADB00"
                />

                {/* Energy */}
                <RatingRow
                    label="Energy Level — How did you feel overall?"
                    value={energyLevel}
                    onChange={setEnergyLevel}
                    color="#7C6FCD"
                />

                {/* Notes */}
                <div style={{ marginBottom: 24 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1A18', marginBottom: 8 }}>
                        Notes <span style={{ fontWeight: 400, color: 'rgba(26,26,24,0.40)' }}>(optional)</span>
                    </p>
                    <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="e.g. felt strong on squats, knee a bit sore…"
                        rows={2}
                        style={{
                            width: '100%', padding: '10px 14px', borderRadius: 14,
                            border: '2px solid rgba(26,26,24,0.10)', fontSize: 13,
                            color: '#1A1A18', resize: 'none', outline: 'none',
                            fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
                            background: 'rgba(26,26,24,0.03)',
                        }}
                    />
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 10 }}>
                    <button
                        onClick={handleSkip}
                        disabled={saving}
                        style={{
                            flex: 1, padding: '13px', borderRadius: 14,
                            border: '2px solid rgba(26,26,24,0.10)',
                            background: 'rgba(26,26,24,0.04)',
                            color: 'rgba(26,26,24,0.55)', fontSize: 14, fontWeight: 600,
                            cursor: saving ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
                        }}
                    >
                        Skip
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || (!rpe && !energyLevel)}
                        style={{
                            flex: 2, padding: '13px', borderRadius: 14, border: 'none',
                            background: (!rpe && !energyLevel) || saving
                                ? 'rgba(202,219,0,0.40)'
                                : 'linear-gradient(135deg,#CADB00,#9DB800)',
                            color: '#1A1A18', fontSize: 14, fontWeight: 800,
                            cursor: (!rpe && !energyLevel) || saving ? 'not-allowed' : 'pointer',
                            transition: 'all 0.15s',
                            boxShadow: (!rpe && !energyLevel) ? 'none' : '0 4px 16px rgba(202,219,0,0.35)',
                        }}
                    >
                        {saving ? 'Saving…' : '✓ Save & Complete'}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes wcmSlideUp {
                    from { opacity: 0; transform: translateY(60px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
