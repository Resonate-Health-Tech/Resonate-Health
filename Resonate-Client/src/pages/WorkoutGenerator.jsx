import { useState } from 'react';
import { postWithCookie } from '../api';
import WorkoutCompleteModal from '../components/WorkoutCompleteModal';

/* ─────────────────────────────────────────────
   Redesigned AI Workout Planner
   • Left-aligned two-column layout (form | summary sidebar)
   • Pill-dot step indicator
   • Rich option cards with icons
   • Premium generated-plan view
───────────────────────────────────────────── */

const STEPS = [
    { label: 'Level', emoji: '💪' },
    { label: 'Equipment', emoji: '🏋️' },
    { label: 'Time', emoji: '⏱️' },
    { label: 'Injuries', emoji: '🩹' },
    { label: 'Energy', emoji: '⚡' },
    { label: 'Timing', emoji: '🕐' },
    { label: 'Barriers', emoji: '🎯' },
];

const WorkoutGenerator = ({ onClose, onWorkoutGenerated }) => {
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [generatedPlan, setGeneratedPlan] = useState(null);
    const [error, setError] = useState(null);
    const [workoutId, setWorkoutId] = useState(null);
    const [completing, setCompleting] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);

    const [formData, setFormData] = useState({
        fitnessLevel: '',
        equipment: [],
        timeAvailable: 30,
        injuries: [],
        motivationLevel: '',
        workoutTiming: '',
        goalBarriers: [],
    });
    const [customBarrier, setCustomBarrier] = useState('');

    const levels = [
        { id: 'Beginner', emoji: '🌱', sub: "Just starting out" },
        { id: 'Intermediate', emoji: '🔥', sub: "Training regularly" },
        { id: 'Advanced', emoji: '🚀', sub: "Looking for a challenge" },
    ];
    const equipmentList = [
        { id: 'Dumbbells', emoji: '🏋️' },
        { id: 'Kettlebells', emoji: '🫙' },
        { id: 'Barbell', emoji: '⚖️' },
        { id: 'Resistance Bands', emoji: '🔗' },
        { id: 'Pull-up Bar', emoji: '🏗️' },
        { id: 'Gym Machine', emoji: '🤖' },
        { id: 'None (Bodyweight)', emoji: '🤸' },
    ];
    const injuryList = [
        { id: 'None', emoji: '✅' }, { id: 'Knees', emoji: '🦵' },
        { id: 'Shoulders', emoji: '💪' }, { id: 'Back', emoji: '🫀' },
        { id: 'Wrists', emoji: '✋' }, { id: 'Ankles', emoji: '🦶' },
    ];
    const motivationLevels = [
        { id: 'Low', emoji: '😴', sub: "Easy session to get moving" },
        { id: 'Medium', emoji: '😤', sub: "Solid, balanced workout" },
        { id: 'High', emoji: '🔥', sub: "Push me to the limit!" },
    ];
    const timingOptions = [
        { id: 'Morning', emoji: '🌅', sub: "6am – 12pm" },
        { id: 'Afternoon', emoji: '☀️', sub: "12pm – 5pm" },
        { id: 'Evening', emoji: '🌙', sub: "5pm – 10pm" },
    ];
    const barrierOptions = ['Time Constraints', 'Low Energy', 'Lack of Discipline', 'Boredom', 'Slow Progress', 'None'];

    const totalSteps = STEPS.length;
    const next = () => setStep(p => p + 1);
    const back = () => setStep(p => p - 1);

    const toggle = (cat, item) => {
        setFormData(prev => {
            const list = prev[cat];
            if (list.includes(item)) return { ...prev, [cat]: list.filter(i => i !== item) };
            if ((cat === 'injuries' || cat === 'goalBarriers') && item === 'None') return { ...prev, [cat]: ['None'] };
            if ((cat === 'injuries' || cat === 'goalBarriers') && list.includes('None')) return { ...prev, [cat]: [item] };
            return { ...prev, [cat]: [...list, item] };
        });
    };

    const generatePlan = async () => {
        setLoading(true); setError(null);
        try {
            const finalBarriers = [...formData.goalBarriers];
            if (customBarrier.trim()) finalBarriers.push(customBarrier.trim());
            const res = await postWithCookie('/api/workout/generate', {
                ...formData,
                equipment: formData.equipment.includes('None (Bodyweight)') ? [] : formData.equipment,
                injuries: formData.injuries.includes('None') ? [] : formData.injuries,
                goalBarriers: finalBarriers.includes('None') ? [] : finalBarriers,
            });
            setGeneratedPlan(res.plan);
            setWorkoutId(res.workoutId);
            setStep(totalSteps + 1);
            if (onWorkoutGenerated) onWorkoutGenerated(res.workoutId, res.plan);
        } catch (err) {
            setError(err.message || 'Failed to generate plan');
        } finally {
            setLoading(false);
        }
    };

    // Open the RPE modal instead of hardcoding values
    const handleComplete = () => {
        if (!workoutId) return;
        setShowCompleteModal(true);
    };

    const handleModalSave = async (rpe, energyLevel, notes) => {
        setCompleting(true);
        setShowCompleteModal(false);
        try {
            await postWithCookie('/api/workout/complete', { workoutId, rpe, energyLevel, notes });
            setCompleted(true);
        } catch {
            setError('Failed to mark workout as complete');
        } finally {
            setCompleting(false);
        }
    };

    const handleModalSkip = async () => {
        setCompleting(true);
        setShowCompleteModal(false);
        try {
            await postWithCookie('/api/workout/complete', { workoutId, rpe: null, energyLevel: null, notes: '' });
            setCompleted(true);
        } catch {
            setError('Failed to mark workout as complete');
        } finally {
            setCompleting(false);
        }
    };

    const resetAll = () => {
        setStep(0); setGeneratedPlan(null); setCompleted(false);
        setFormData({ fitnessLevel: '', equipment: [], timeAvailable: 30, injuries: [], motivationLevel: '', workoutTiming: '', goalBarriers: [] });
        setCustomBarrier('');
    };

    /* ── Common style helpers ── */
    const card = {
        background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)',
        border: '1.5px solid rgba(26,26,24,0.08)', borderRadius: 20,
        boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
    };

    const optCard = (sel) => ({
        ...card,
        padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14,
        width: '100%', textAlign: 'left', cursor: 'pointer', transition: 'all 0.18s',
        border: `2px solid ${sel ? '#CADB00' : 'rgba(26,26,24,0.08)'}`,
        background: sel ? 'rgba(202,219,0,0.10)' : 'rgba(255,255,255,0.80)',
        transform: sel ? 'scale(1.01)' : 'scale(1)',
    });

    const pill = (sel, color = '#CADB00') => ({
        padding: '8px 18px', borderRadius: 9999, fontSize: 13, fontWeight: 600,
        cursor: 'pointer', transition: 'all 0.15s',
        border: `2px solid ${sel ? color : 'rgba(26,26,24,0.10)'}`,
        background: sel ? `${color}28` : 'rgba(255,255,255,0.70)',
        color: sel ? '#1A1A18' : 'rgba(26,26,24,0.55)',
        boxShadow: sel ? `0 0 0 3px ${color}22` : 'none',
    });

    const btnPrimary = {
        padding: '12px 32px', borderRadius: 14, border: 'none',
        background: '#1A1A18', color: '#FFF', fontSize: 14, fontWeight: 700,
        cursor: 'pointer', transition: 'all 0.15s', letterSpacing: '0.01em',
        boxShadow: '0 4px 16px rgba(26,26,24,0.20)',
    };

    const btnBack = {
        padding: '11px 20px', borderRadius: 14,
        background: 'rgba(26,26,24,0.05)', border: '1.5px solid rgba(26,26,24,0.10)',
        color: 'rgba(26,26,24,0.55)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
        transition: 'all 0.15s',
    };

    const stepMeta = STEPS[step] || {};

    /* ─────────────── RENDER ─────────────── */
    return (
        <div style={{ fontFamily: "'DM Sans',sans-serif", padding: '32px 28px 36px' }}>

            {/* ── Loading overlay ── */}
            {loading && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: 20 }}>
                    {/* Concentric spinner */}
                    <div style={{ position: 'relative', width: 72, height: 72 }}>
                        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '3px solid rgba(202,219,0,0.15)', borderTopColor: '#CADB00', animation: 'wgSpin 0.8s linear infinite' }} />
                        <div style={{ position: 'absolute', inset: 10, borderRadius: '50%', border: '3px solid rgba(26,26,24,0.06)', borderTopColor: 'rgba(26,26,24,0.25)', animation: 'wgSpin 1.2s linear infinite reverse' }} />
                        <div style={{ position: 'absolute', inset: '50%', transform: 'translate(-50%,-50%)', fontSize: 22 }}>✨</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: 18, fontWeight: 700, color: '#1A1A18', margin: '0 0 4px' }}>Building your perfect plan…</p>
                        <p style={{ fontSize: 13, color: 'rgba(26,26,24,0.50)', margin: 0 }}>AI is crafting a routine tailored just for you</p>
                    </div>
                    <style>{`@keyframes wgSpin { to { transform:rotate(360deg); } }`}</style>
                </div>
            )}

            {/* ── Form steps ── */}
            {!loading && step <= totalSteps && !generatedPlan && (
                <div>
                    {/* Step dots + label */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
                        {STEPS.map((s, i) => (
                            <div key={i} style={{
                                height: 6, borderRadius: 3, flex: i === step ? 3 : 1,
                                background: i < step ? '#CADB00' : i === step ? '#1A1A18' : 'rgba(26,26,24,0.12)',
                                transition: 'all 0.4s ease',
                            }} />
                        ))}
                    </div>

                    {/* Step header */}
                    <div style={{ marginBottom: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                            <span style={{ fontSize: 30 }}>{stepMeta.emoji}</span>
                            <div>
                                <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(26,26,24,0.40)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                                    Step {step + 1} of {totalSteps}
                                </p>
                                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1A1A18', margin: 0 }}>
                                    {step === 0 && "What's your fitness level?"}
                                    {step === 1 && 'What equipment do you have?'}
                                    {step === 2 && 'How much time today?'}
                                    {step === 3 && 'Any injuries or limitations?'}
                                    {step === 4 && 'How motivated are you?'}
                                    {step === 5 && 'When are you working out?'}
                                    {step === 6 && "Any barriers to your goal?"}
                                </h2>
                            </div>
                        </div>
                    </div>

                    {/* ─── Step 0: Fitness Level ─── */}
                    {step === 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {levels.map(l => (
                                <button key={l.id} onClick={() => { setFormData({ ...formData, fitnessLevel: l.id }); next(); }} style={optCard(formData.fitnessLevel === l.id)}>
                                    <span style={{ fontSize: 28, flexShrink: 0 }}>{l.emoji}</span>
                                    <div>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A18' }}>{l.id}</div>
                                        <div style={{ fontSize: 12, color: 'rgba(26,26,24,0.50)', marginTop: 2 }}>{l.sub}</div>
                                    </div>
                                    {formData.fitnessLevel === l.id && <span style={{ marginLeft: 'auto', fontSize: 18, color: '#CADB00', flexShrink: 0 }}>✓</span>}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* ─── Step 1: Equipment ─── */}
                    {step === 1 && (
                        <>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
                                {equipmentList.map(e => (
                                    <button key={e.id} onClick={() => toggle('equipment', e.id)} style={pill(formData.equipment.includes(e.id))}>
                                        {e.emoji} {e.id}
                                    </button>
                                ))}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                                <button style={btnBack} onClick={back}>← Back</button>
                                <button style={{ ...btnPrimary, opacity: formData.equipment.length === 0 ? 0.4 : 1 }}
                                    disabled={formData.equipment.length === 0} onClick={next}>Continue →</button>
                            </div>
                        </>
                    )}

                    {/* ─── Step 2: Time ─── */}
                    {step === 2 && (
                        <>
                            <div style={{ marginBottom: 32, padding: '0 4px' }}>
                                {/* Big number display */}
                                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                    <span style={{ fontSize: 72, fontWeight: 800, color: '#1A1A18', lineHeight: 1 }}>{formData.timeAvailable}</span>
                                    <span style={{ fontSize: 20, color: 'rgba(26,26,24,0.40)', marginLeft: 8, fontWeight: 500 }}>min</span>
                                </div>
                                {/* Quick picks */}
                                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
                                    {[15, 20, 30, 45, 60, 75, 90].map(t => (
                                        <button key={t} onClick={() => setFormData({ ...formData, timeAvailable: t })}
                                            style={pill(formData.timeAvailable === t)}>
                                            {t}m
                                        </button>
                                    ))}
                                </div>
                                <input type="range" min="15" max="90" step="5" value={formData.timeAvailable}
                                    onChange={e => setFormData({ ...formData, timeAvailable: parseInt(e.target.value) })}
                                    style={{ width: '100%', accentColor: '#CADB00', height: 6, cursor: 'pointer' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(26,26,24,0.35)', marginTop: 4, fontWeight: 600 }}>
                                    <span>15 min</span><span>90 min</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                                <button style={btnBack} onClick={back}>← Back</button>
                                <button style={btnPrimary} onClick={next}>Continue →</button>
                            </div>
                        </>
                    )}

                    {/* ─── Step 3: Injuries ─── */}
                    {step === 3 && (
                        <>
                            <p style={{ fontSize: 13, color: 'rgba(26,26,24,0.50)', marginBottom: 18, marginTop: -8 }}>We'll filter exercises that might aggravate these areas.</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
                                {injuryList.map(e => (
                                    <button key={e.id} onClick={() => toggle('injuries', e.id)} style={pill(formData.injuries.includes(e.id), '#EF4444')}>
                                        {e.emoji} {e.id}
                                    </button>
                                ))}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                                <button style={btnBack} onClick={back}>← Back</button>
                                <button style={btnPrimary} onClick={next}>Continue →</button>
                            </div>
                        </>
                    )}

                    {/* ─── Step 4: Motivation ─── */}
                    {step === 4 && (
                        <>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                                {motivationLevels.map(l => (
                                    <button key={l.id} onClick={() => { setFormData({ ...formData, motivationLevel: l.id }); next(); }} style={optCard(formData.motivationLevel === l.id)}>
                                        <span style={{ fontSize: 28, flexShrink: 0 }}>{l.emoji}</span>
                                        <div>
                                            <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A18' }}>{l.id}</div>
                                            <div style={{ fontSize: 12, color: 'rgba(26,26,24,0.50)', marginTop: 2 }}>{l.sub}</div>
                                        </div>
                                        {formData.motivationLevel === l.id && <span style={{ marginLeft: 'auto', fontSize: 18, color: '#CADB00', flexShrink: 0 }}>✓</span>}
                                    </button>
                                ))}
                            </div>
                            <button style={btnBack} onClick={back}>← Back</button>
                        </>
                    )}

                    {/* ─── Step 5: Timing ─── */}
                    {step === 5 && (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
                                {timingOptions.map(t => (
                                    <button key={t.id} onClick={() => { setFormData({ ...formData, workoutTiming: t.id }); next(); }}
                                        style={{ ...optCard(formData.workoutTiming === t.id), flexDirection: 'column', alignItems: 'center', padding: '20px 12px', textAlign: 'center' }}>
                                        <span style={{ fontSize: 32, marginBottom: 8 }}>{t.emoji}</span>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A18' }}>{t.id}</div>
                                        <div style={{ fontSize: 11, color: 'rgba(26,26,24,0.45)', marginTop: 2 }}>{t.sub}</div>
                                    </button>
                                ))}
                            </div>
                            <button style={btnBack} onClick={back}>← Back</button>
                        </>
                    )}

                    {/* ─── Step 6: Barriers ─── */}
                    {step === 6 && (
                        <>
                            <p style={{ fontSize: 13, color: 'rgba(26,26,24,0.50)', marginBottom: 18, marginTop: -8 }}>We'll tailor the plan to help you overcome these.</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
                                {barrierOptions.map(b => (
                                    <button key={b} onClick={() => toggle('goalBarriers', b)} style={pill(formData.goalBarriers.includes(b), '#7C6FCD')}>
                                        {b}
                                    </button>
                                ))}
                            </div>
                            <input type="text" placeholder="Other barrier? (e.g. noisy apartment, no gym nearby)"
                                value={customBarrier} onChange={e => setCustomBarrier(e.target.value)}
                                style={{
                                    width: '100%', padding: '11px 16px', borderRadius: 14, border: '2px solid rgba(26,26,24,0.10)',
                                    fontSize: 13, color: '#1A1A18', outline: 'none', marginBottom: 24,
                                    boxSizing: 'border-box', fontFamily: "'DM Sans',sans-serif", background: 'rgba(255,255,255,0.70)'
                                }} />
                            {error && <div style={{ fontSize: 13, color: '#EF4444', marginBottom: 12, textAlign: 'center', fontWeight: 600 }}>{error}</div>}
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                                <button style={btnBack} onClick={back}>← Back</button>
                                <button
                                    style={{
                                        ...btnPrimary, background: 'linear-gradient(135deg,#CADB00,#9DB800)', color: '#1A1A18',
                                        boxShadow: '0 6px 20px rgba(202,219,0,0.40)', fontSize: 15, padding: '13px 36px'
                                    }}
                                    onClick={generatePlan} disabled={loading}>
                                    ✨ Generate My Plan
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ── Generated Plan View ── */}
            {!loading && generatedPlan && (
                <div>
                    {/* Plan header */}
                    <div style={{ background: 'linear-gradient(135deg,#1A1A18 0%,#2D2D2A 100%)', borderRadius: 20, padding: '24px 24px 20px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(202,219,0,0.10)' }} />
                        <div style={{ position: 'absolute', bottom: -30, left: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(202,219,0,0.06)' }} />
                        <div style={{ position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#CADB00', textTransform: 'uppercase', letterSpacing: '0.1em' }}>✨ AI Generated</span>
                                <button onClick={resetAll} style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', padding: '4px 12px', borderRadius: 20 }}>
                                    New Plan
                                </button>
                            </div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#FFF', margin: '0 0 10px', lineHeight: 1.2 }}>{generatedPlan.title}</h2>
                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                {generatedPlan.duration && <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20, background: 'rgba(202,219,0,0.20)', color: '#CADB00' }}>⏱ {generatedPlan.duration}</span>}
                                {generatedPlan.focus && <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.80)' }}>🎯 {generatedPlan.focus}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Warmup */}
                    {generatedPlan.warmup?.length > 0 && (
                        <div style={{ background: 'rgba(52,199,89,0.07)', border: '1.5px solid rgba(52,199,89,0.18)', borderRadius: 16, padding: '16px 18px', marginBottom: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <span style={{ fontSize: 16 }}>🟢</span>
                                <h3 style={{ fontSize: 11, fontWeight: 800, color: '#14532D', textTransform: 'uppercase', letterSpacing: '0.10em', margin: 0 }}>Warmup</h3>
                            </div>
                            {generatedPlan.warmup.map((ex, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#1A1A18', padding: '5px 0', borderBottom: i < generatedPlan.warmup.length - 1 ? '1px solid rgba(52,199,89,0.15)' : 'none' }}>
                                    <span>{ex.name}</span>
                                    <span style={{ color: 'rgba(26,26,24,0.45)', fontWeight: 600 }}>{ex.duration || ex.reps}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Main Circuit */}
                    {generatedPlan.exercises?.length > 0 && (
                        <div style={{ marginBottom: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                <span style={{ fontSize: 16 }}>🟡</span>
                                <h3 style={{ fontSize: 11, fontWeight: 800, color: '#4D5300', textTransform: 'uppercase', letterSpacing: '0.10em', margin: 0 }}>Main Circuit</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {generatedPlan.exercises.map((ex, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(202,219,0,0.08)', border: '1.5px solid rgba(202,219,0,0.20)', borderRadius: 14, padding: '12px 16px' }}>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A18' }}>{ex.name}</div>
                                            <div style={{ fontSize: 12, color: 'rgba(26,26,24,0.45)', marginTop: 2 }}>
                                                {ex.sets && `${ex.sets} sets`}{ex.sets && ex.reps && ' × '}{ex.reps && `${ex.reps}`}{ex.duration && ` · ${ex.duration}`}
                                            </div>
                                            {ex.notes && <div style={{ fontSize: 11, color: '#B85C20', fontStyle: 'italic', marginTop: 3 }}>{ex.notes}</div>}
                                        </div>
                                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(26,26,24,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'rgba(26,26,24,0.45)', flexShrink: 0, marginLeft: 12 }}>{i + 1}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Cooldown */}
                    {generatedPlan.cooldown?.length > 0 && (
                        <div style={{ background: 'rgba(124,111,205,0.07)', border: '1.5px solid rgba(124,111,205,0.18)', borderRadius: 16, padding: '16px 18px', marginBottom: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <span style={{ fontSize: 16 }}>🔵</span>
                                <h3 style={{ fontSize: 11, fontWeight: 800, color: '#4A3D6B', textTransform: 'uppercase', letterSpacing: '0.10em', margin: 0 }}>Cooldown</h3>
                            </div>
                            {generatedPlan.cooldown.map((ex, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#1A1A18', padding: '5px 0', borderBottom: i < generatedPlan.cooldown.length - 1 ? '1px solid rgba(124,111,205,0.15)' : 'none' }}>
                                    <span>{ex.name}</span>
                                    <span style={{ color: 'rgba(26,26,24,0.45)', fontWeight: 600 }}>{ex.duration || ex.reps}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* CTA */}
                    {!completed ? (
                        <button onClick={handleComplete} disabled={completing}
                            style={{
                                width: '100%', padding: '15px', borderRadius: 16, border: 'none',
                                background: completing ? 'rgba(202,219,0,0.50)' : 'linear-gradient(135deg,#CADB00,#9DB800)',
                                color: '#1A1A18', fontSize: 15, fontWeight: 800, cursor: completing ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s', boxShadow: '0 6px 24px rgba(202,219,0,0.35)', letterSpacing: '0.01em'
                            }}>
                            {completing ? 'Saving…' : '✓ Mark as Complete'}
                        </button>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(5,150,105,0.08)', borderRadius: 16, border: '1.5px solid rgba(5,150,105,0.18)' }}>
                            <div style={{ fontSize: 28, marginBottom: 6 }}>🎉</div>
                            <div style={{ fontSize: 15, fontWeight: 800, color: '#059669' }}>Workout Recorded!</div>
                            <div style={{ fontSize: 13, color: 'rgba(26,26,24,0.50)', marginTop: 4 }}>Great work! Check your history below.</div>
                        </div>
                    )}
                </div>
            )}

            <style>{`
        @keyframes wgSpin { to { transform:rotate(360deg); } }
        input[type=range]::-webkit-slider-thumb { width:20px; height:20px; }
      `}</style>

            {/* RPE Completion Modal */}
            <WorkoutCompleteModal
                isOpen={showCompleteModal}
                onSave={handleModalSave}
                onSkip={handleModalSkip}
                onClose={() => setShowCompleteModal(false)}
            />
        </div>
    );
};

export default WorkoutGenerator;
