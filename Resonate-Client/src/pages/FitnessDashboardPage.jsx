import React, { useEffect, useState, useRef } from "react";
import MetricCard from "../components/MetricCard";
import BarChart from "../components/BarChart";
import QuickAddWidget from "../components/QuickAddWidget";
import WaterTracker from "../components/WaterTracker";
import LineChart from "../components/LineChart";
import WorkoutGenerator from "./WorkoutGenerator";
import WorkoutCompleteModal from "../components/WorkoutCompleteModal";
import { normalizeFitnessData } from "../utils/fitnessNormalizer";
import { getWithCookie, postWithCookie } from "../api";
import { useNavigate } from "react-router-dom";

export default function FitnessDashboardPage() {
  const navigate = useNavigate();
  const [fitness, setFitness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [syncStatus, setSyncStatus] = useState('synced');
  const [stepGoal, setStepGoal] = useState(0);
  const [newStepGoal, setNewStepGoal] = useState(0);
  const [isEditingStepGoal, setIsEditingStepGoal] = useState(false);
  const [waterData, setWaterData] = useState({ amountMl: 0, goalMl: 2500 });
  const [waterLoading, setWaterLoading] = useState(true);

  const [workouts, setWorkouts] = useState([]);
  const [workoutsLoading, setWorkoutsLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [completingId, setCompletingId] = useState(null);
  // Modal state for RPE capture on completion
  const [completeModal, setCompleteModal] = useState({ open: false, workoutId: null });
  const [connectingGoogleFit, setConnectingGoogleFit] = useState(false);

  const handleConnectGoogleFit = async () => {
    try {
      setConnectingGoogleFit(true);
      const res = await getWithCookie("/api/fit/google/url");
      if (res && res.url) {
        window.location.href = res.url;
      }
    } catch (error) {
      console.error("Failed to get Google Fit URL", error);
    } finally {
      setConnectingGoogleFit(false);
    }
  };

  const loadWater = async () => {
    try {
      const res = await getWithCookie('/api/water');
      if (res && res.today) {
        setWaterData({
          amountMl: res.today.amountMl || 0,
          goalMl: res.today.goalMl || 2500
        });
      }
    } catch (error) {
      console.error("Failed to fetch water data", error);
    } finally {
      setWaterLoading(false);
    }
  };

  const loadWorkouts = async () => {
    try {
      const res = await getWithCookie('/api/workout/history');
      if (res && res.workouts) {
        setWorkouts(res.workouts);
      }
    } catch (error) {
      console.error("Failed to fetch workout history", error);
    } finally {
      setWorkoutsLoading(false);
    }
  };

  // Open the RPE modal instead of silently sending fake values
  const handleMarkComplete = (e, workoutId) => {
    e.stopPropagation();
    setCompleteModal({ open: true, workoutId });
  };

  // Called when user saves real RPE / energy from the modal
  const handleModalSave = async (rpe, energyLevel, notes) => {
    const { workoutId } = completeModal;
    setCompletingId(workoutId);
    setCompleteModal({ open: false, workoutId: null });
    try {
      await postWithCookie('/api/workout/complete', { workoutId, rpe, energyLevel, notes });
      setWorkouts(prev => prev.map(w => w._id === workoutId ? { ...w, status: 'completed', rpe, energyLevel } : w));
      if (selectedWorkout?._id === workoutId) {
        setSelectedWorkout(prev => ({ ...prev, status: 'completed', rpe, energyLevel }));
      }
    } catch (err) {
      console.error('Failed to mark workout complete', err);
    } finally {
      setCompletingId(null);
    }
  };

  // Called when user skips rating — saves with null values (no fake defaults)
  const handleModalSkip = async () => {
    const { workoutId } = completeModal;
    setCompletingId(workoutId);
    setCompleteModal({ open: false, workoutId: null });
    try {
      await postWithCookie('/api/workout/complete', { workoutId, rpe: null, energyLevel: null, notes: '' });
      setWorkouts(prev => prev.map(w => w._id === workoutId ? { ...w, status: 'completed' } : w));
      if (selectedWorkout?._id === workoutId) {
        setSelectedWorkout(prev => ({ ...prev, status: 'completed' }));
      }
    } catch (err) {
      console.error('Failed to mark workout complete', err);
    } finally {
      setCompletingId(null);
    }
  };

  const logWater = async (amount) => {
    try {
      const res = await postWithCookie('/api/water/log', { amountMl: amount });
      if (res) {
        setWaterData({
          amountMl: res.amountMl || 0,
          goalMl: res.goalMl || 2500
        });
      }
    } catch (error) {
      console.error("Failed to log water", error);
    }
  };

  const scrollRef = useRef(null);
  const touchStartY = useRef(0);

  const loadFitness = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
      setSyncStatus('syncing');
    }

    try {
      const apiData = await getWithCookie("/api/fit/getGoogleFitData");
      const normalizedData = normalizeFitnessData(apiData);
      setFitness(normalizedData);
      setStepGoal(apiData.stepGoal || 0);
      setSyncStatus('synced');
    } catch (error) {
      console.error("Failed to load fitness data:", error);
      setFitness(null);
      setSyncStatus('error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFitness();
    loadWater();
    loadWorkouts();
  }, []);


  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (scrollRef.current && scrollRef.current.scrollTop === 0) {
      const touchY = e.touches[0].clientY;
      const pullDistance = touchY - touchStartY.current;
      if (pullDistance > 100 && !refreshing) {
        loadFitness(true);
      }
    }
  };

  const getStepsProgress = () => {
    if (!fitness?.todaySteps) return 0;
    if (stepGoal === 0) return 0;
    return Math.min((fitness.todaySteps / stepGoal) * 100, 100);
  };

  const updateStepGoal = async (newGoal) => {
    try {
      await postWithCookie("/api/fit/step-goal", { stepGoal: parseInt(newGoal) });
      setStepGoal(parseInt(newGoal));
      setIsEditingStepGoal(false);
    } catch (error) {
      console.error("Failed to update step goal", error);
    }
  };

  const getSleepQuality = (hours) => {
    if (!hours) return { label: "No data", color: "slate", emoji: "😴" };
    if (hours < 6) return { label: "Poor", color: "red", emoji: "😫" };
    if (hours < 7) return { label: "Fair", color: "amber", emoji: "😐" };
    if (hours < 9) return { label: "Good", color: "emerald", emoji: "😊" };
    return { label: "Excellent", color: "primary", emoji: "😴" };
  };

  const getRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    const diffTime = today - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 0) return 'Today';
    return `${diffDays} days ago`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ minHeight: "60vh" }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          border: "3px solid rgba(202,219,0,0.20)",
          borderTopColor: "#CADB00",
          animation: "spin 0.8s linear infinite",
        }} />
        <p style={{ fontSize: 13, color: "rgba(26,26,24,0.45)", marginTop: 12, fontFamily: "'DM Sans',sans-serif" }}>Syncing fitness data…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const sleepQuality = getSleepQuality(fitness?.sleepHours);
  const stepsProgress = getStepsProgress();

  return (
    <div
      ref={scrollRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Refresh toast */}
      {refreshing && (
        <div style={{
          position: "fixed", top: 80, left: "50%", transform: "translateX(-50%)", zIndex: 50,
          background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)",
          border: "1px solid rgba(26,26,24,0.10)", borderRadius: 9999,
          padding: "8px 16px", display: "flex", alignItems: "center", gap: 8,
          boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
        }}>
          <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid rgba(202,219,0,0.30)", borderTopColor: "#CADB00", animation: "spin 0.8s linear infinite" }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: "#1A1A18" }}>Syncing…</span>
        </div>
      )}

      {/* Header row */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[32px] font-bold text-[#1A1A18] mb-1">Fitness</h1>
          <p className="text-[15px] text-[#1A1A18]/60 m-0">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>

        {fitness ? (
          <div className="flex items-center gap-3">
            <span className="text-[14px] font-medium text-[#1A1A18]/60 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#CADB00]"></span>
              Google Fit Connected
            </span>
          </div>
        ) : (
          <button
            onClick={handleConnectGoogleFit}
            disabled={connectingGoogleFit}
            className={`border border-[#CADB00] text-[#8C9800] px-5 py-2.5 rounded-2xl font-medium flex items-center gap-2 transition-colors ${connectingGoogleFit ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#CADB00]/10'}`}
          >
            {connectingGoogleFit ? 'Connecting...' : 'Connect Google Fit'}
          </button>
        )}
      </div>

      {/* No data state */}
      {!fitness ? (
        <div className="glass-card" style={{ borderRadius: 24, padding: 32, textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(26,26,24,0.06)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="24" height="24" fill="none" stroke="rgba(26,26,24,0.30)" strokeWidth="1.7" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1A1A18", marginBottom: 8 }}>No Fitness Data</h3>
          <p style={{ fontSize: 13, color: "rgba(26,26,24,0.55)", marginBottom: 24, maxWidth: 320, margin: "0 auto 24px" }}>
            Connect your fitness device to see your activity, sleep, and workout data here.
          </p>
        </div>
      ) : (
        <>
          {/* Row 1: 4 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

            {/* Steps Card */}
            <div className="bg-white/40 border border-[#1A1A18]/10 rounded-[28px] p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[15px] font-medium text-[#1A1A18]/70 mb-2">Steps Today</p>
                  <h2 className="text-[40px] font-bold text-[#1A1A18] leading-none mb-1">
                    {fitness.todaySteps?.toLocaleString() || "0"}
                  </h2>
                  <p className="text-[13px] text-[#1A1A18]/50 flex items-center gap-1">
                    of {stepGoal.toLocaleString()} goal
                    <button onClick={() => { setNewStepGoal(stepGoal); setIsEditingStepGoal(true); }}
                      className="text-[#1A1A18]/40 hover:text-[#CADB00] transition-colors p-1"
                    >
                      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </p>

                  {isEditingStepGoal && (
                    <div className="flex items-center gap-2 mt-2 bg-white/50 p-1.5 rounded-lg border border-[#1A1A18]/10">
                      <input
                        type="number"
                        value={newStepGoal}
                        onChange={(e) => setNewStepGoal(e.target.value)}
                        className="w-20 px-2 py-1 rounded-md border border-[#CADB00] text-[13px] outline-none text-[#1A1A18] bg-transparent"
                        autoFocus
                      />
                      <button onClick={() => updateStepGoal(newStepGoal)}
                        className="text-[#CADB00] font-bold text-[12px] px-2 py-1 rounded-md hover:bg-[#CADB00]/10 transition-colors"
                      >
                        Save
                      </button>
                      <button onClick={() => setIsEditingStepGoal(false)}
                        className="text-[#1A1A18]/40 hover:text-[#1A1A18]/70 text-[12px] p-1"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
                <div className="text-[#CADB00]">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 9a2 2 0 100-4 2 2 0 000 4z" />
                    <path d="M14 19a2 2 0 100-4 2 2 0 000 4z" />
                    <path d="M10 13c-1.5 0-3-1-3-2.5S8.5 8 10 8" />
                    <path d="M14 15c1.5 0 3 1 3 2.5s-1.5 2.5-3 2.5" />
                  </svg>
                </div>
              </div>
              <div>
                <div className="h-3 w-full bg-[#1A1A18]/5 rounded-full mb-3">
                  <div className="h-full bg-[#CADB00] rounded-full" style={{ width: `${Math.min(stepsProgress, 100)}%` }}></div>
                </div>
                <p className="text-[13px] font-medium text-[#8C9800]">
                  {Math.round(stepsProgress)}% of daily goal
                </p>
              </div>
            </div>

            {/* Sleep Card */}
            <div className="bg-white/40 border border-[#1A1A18]/10 rounded-[28px] p-6 flex flex-col justify-between">
              <div>
                <p className="text-[15px] font-medium text-[#1A1A18]/70 mb-2">Sleep Duration</p>
                <h2 className="text-[40px] font-bold text-[#1A1A18] leading-none mb-4">
                  {fitness.sleepHours || "0"}<span className="text-[24px]">h</span>
                </h2>
                <div className="flex gap-1 mb-6">
                  <div className="h-2.5 w-1/3 bg-[#1A1A18] rounded-full"></div>
                  <div className="h-2.5 w-2/3 bg-[#1A1A18]/60 rounded-full"></div>
                </div>
              </div>
              <p className="text-[14px] text-[#1A1A18]/70 font-medium">
                Quality: {sleepQuality.label}
              </p>
            </div>

            {/* Workouts Card */}
            <div className="bg-white/40 border border-[#1A1A18]/10 rounded-[28px] p-6 flex flex-col justify-between">
              <div>
                <p className="text-[15px] font-medium text-[#1A1A18]/70 mb-2">Workouts Today</p>
                <h2 className="text-[40px] font-bold text-[#CADB00] leading-none mb-6">
                  {fitness.workoutCount || "0"}
                </h2>
                {fitness.workoutCount > 0 && fitness.todayWorkoutName && (
                  <div className="bg-[#CADB00]/10 border-l-4 border-[#CADB00] rounded-r-lg px-3 py-2 mb-4">
                    <p className="text-[13px] text-[#1A1A18] font-medium">{fitness.todayWorkoutName}</p>
                  </div>
                )}
              </div>
              <p className="text-[14px] text-[#1A1A18]/70 font-medium">
                {fitness.activeMinutes > 0
                  ? `Active: ${fitness.activeMinutes} min today`
                  : `${fitness.workoutCount} session${fitness.workoutCount !== 1 ? 's' : ''} logged`}
              </p>
            </div>

            {/* Hydration Card View */}
            <div className="bg-white/40 border border-[#1A1A18]/10 rounded-[28px] p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[15px] font-medium text-[#1A1A18]/70 mb-2">Hydration</p>
                  <h2 className="text-[40px] font-bold text-[#1A1A18] leading-none mb-1">
                    {waterData.amountMl}<span className="text-[24px]">ml</span>
                  </h2>
                  <p className="text-[13px] text-[#1A1A18]/50">of {waterData.goalMl}ml goal</p>
                </div>
                <div className="text-[#1A1A18]">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
                  </svg>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => logWater(200)} className="text-[14px] font-medium text-[#1A1A18]/70 hover:text-[#1A1A18]">
                  +200ml
                </button>
                <button onClick={() => logWater(500)} className="text-[14px] font-medium text-[#1A1A18]/70 hover:text-[#1A1A18]">
                  +500ml
                </button>
              </div>
            </div>
          </div>

          {/* AI Workout Generator — inline */}
          <div className="mb-8">
            <div className="mb-5">
              <h3 className="text-[26px] font-bold text-[#1A1A18] mb-1">AI Workout Planner</h3>
              <p className="text-[14px] text-[#1A1A18]/60 m-0">Generate a personalised workout based on your goals, time, and equipment.</p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.65)", backdropFilter: "blur(12px)", border: "1px solid rgba(26,26,24,0.08)", borderRadius: 24 }}>
              <WorkoutGenerator
                onWorkoutGenerated={() => loadWorkouts()}
              />
            </div>
          </div>

          {/* Row 2: Chart cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
            {/* Steps chart */}
            <div className="bg-white/40 border border-[#1A1A18]/10 rounded-[28px] p-6 pb-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[18px] font-bold text-[#1A1A18]">Weekly Steps</h3>
                <span className="text-[13px] text-[#1A1A18]/70 font-medium">
                  Avg: {Math.round(fitness.weeklySteps?.reduce((a, b) => a + b, 0) / 7)?.toLocaleString() || 0}
                </span>
              </div>
              <BarChart
                data={fitness.weeklySteps}
                labels={fitness.labels}
                unit=""
                color="lime"
                average={Math.round(fitness.weeklySteps?.reduce((a, b) => a + b, 0) / 7) || 0}
              />
            </div>

            {/* Sleep chart */}
            <div className="bg-white/40 border border-[#1A1A18]/10 rounded-[28px] p-6 pb-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[18px] font-bold text-[#1A1A18]">Sleep This Week</h3>
                <span className="text-[13px] text-[#1A1A18]/70 font-medium">
                  Avg: {(fitness.weeklySleep?.reduce((a, b) => a + b, 0) / 7)?.toFixed(1) || 0}h
                </span>
              </div>
              <LineChart
                data={fitness.weeklySleep}
                labels={fitness.labels}
                unit="h"
                color="purple"
                average={(fitness.weeklySleep?.reduce((a, b) => a + b, 0) / 7)?.toFixed(1) || 0}
              />
            </div>
          </div>

          {/* row 2.5: Workout History Slider */}
          <div className="mb-8">
            <div className="mb-5">
              <h3 className="text-[26px] font-bold text-[#1A1A18] mb-1">Workout History</h3>
              <p className="text-[14px] text-[#1A1A18]/60 m-0">Last 10 sessions</p>
            </div>

            <div
              style={{
                display: "flex", gap: "16px", overflowX: "auto", overflowY: "hidden",
                paddingBottom: "16px", scrollbarWidth: "none", msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch"
              }}
              className="custom-scrollbar-hide"
            >
              <style>{`.custom-scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>

              {workoutsLoading ? (
                <div style={{ width: "100%", padding: "40px", display: "flex", justifyContent: "center" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid rgba(202,219,0,0.2)", borderTopColor: "#CADB00", animation: "spin 0.8s linear infinite" }} />
                </div>
              ) : workouts.slice(0, 10).map((workout) => (
                <div
                  key={workout._id}
                  onClick={() => setSelectedWorkout(workout)}
                  style={{
                    flexShrink: 0, width: "320px", background: "#F1F4F9",
                    border: "1px solid rgba(26,26,24,0.08)",
                    borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column",
                    cursor: "pointer", transition: "transform 0.2s ease, box-shadow 0.2s ease"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.06)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <h4 style={{ fontSize: 18, fontWeight: 700, color: "#1A1A18", margin: "0 0 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {workout.plan?.title || "Workout Plan"}
                  </h4>
                  <div style={{ fontSize: 13, color: "rgba(26,26,24,0.6)", marginBottom: 16 }}>
                    {getRelativeDate(workout.createdAt)}
                  </div>

                  <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 14px", borderRadius: 9999, background: "#EEF8D7", color: "#4D5300" }}>
                      {workout.plan?.duration || "N/A"}
                    </span>
                    {workout.inputs?.fitnessLevel && (
                      <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 14px", borderRadius: 9999, background: "#EEF8D7", color: "#4D5300" }}>
                        {workout.inputs.fitnessLevel}
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: 13, color: "rgba(26,26,24,0.7)", flex: 1, marginBottom: 18, display: "flex", gap: "16px", flexWrap: "wrap", lineHeight: 1.4 }}>
                    {workout.plan?.exercises?.slice(0, 3).map((ex, i) => (
                      <span key={i}>{ex.name}</span>
                    ))}
                  </div>

                  <div style={{ height: 1, background: "rgba(26,26,24,0.2)", margin: "0 0 16px 0" }}></div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    {workout.status === 'completed' ? (
                      <>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#059669" }}>✓ Completed</span>
                        <span style={{ fontSize: 13, color: "rgba(26,26,24,0.6)", fontWeight: 500 }}>
                          {workout.rpe ? `RPE: ${workout.rpe}/10` : 'Completed'}
                        </span>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(26,26,24,0.6)" }}>Not completed</span>
                        <button
                          onClick={(e) => handleMarkComplete(e, workout._id)}
                          disabled={completingId === workout._id}
                          style={{
                            fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 9999,
                            background: completingId === workout._id ? "rgba(202,219,0,0.3)" : "#CADB00",
                            border: "none", color: "#1A1A18", cursor: completingId === workout._id ? "not-allowed" : "pointer",
                            transition: "all 0.15s", whiteSpace: "nowrap"
                          }}
                        >
                          {completingId === workout._id ? "Saving…" : "Mark Complete"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 3: Quick Insights */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1A1A18", margin: 0 }}>Quick Insights</h3>

            {fitness.todaySteps >= 10000 && (
              <div className="glass-card insight-block-lime" style={{ borderRadius: "0 12px 12px 0", display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px" }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(202,219,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="16" height="16" fill="none" stroke="#CADB00" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#3D4000", marginBottom: 2 }}>Goal Achieved! 🎉</p>
                  <p style={{ fontSize: 12, color: "rgba(26,26,24,0.55)", lineHeight: 1.5, margin: 0 }}>
                    You've reached your daily step goal of {stepGoal.toLocaleString()}.
                  </p>
                </div>
              </div>
            )}

            {fitness.sleepHours < 7 && fitness.sleepHours > 0 && (
              <div className="badge-amber" style={{ borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 12, width: "auto" }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#92400E", marginBottom: 2 }}>Improve Sleep</p>
                  <p style={{ fontSize: 12, color: "rgba(146,64,14,0.70)", lineHeight: 1.5, margin: 0 }}>
                    You slept {fitness.sleepHours}h last night. Aim for 7-9 hrs for optimal recovery.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Row 3: Hydration Log Integration */}
          <div className="mb-8">
            <WaterTracker externalData={waterData} setExternalData={setWaterData} />
          </div>

          {/* Footer: Last synced */}
          <div style={{ textAlign: "center", padding: "8px 0 4px" }}>
            <p style={{ fontSize: 12, color: "rgba(26,26,24,0.35)", margin: 0 }}>
              Last synced:{" "}
              <span style={{ color: "rgba(26,26,24,0.50)", fontWeight: 500 }}>
                {fitness.lastSyncTime
                  ? new Date(fitness.lastSyncTime).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                  : "Never"}
              </span>
            </p>
          </div>
        </>
      )}

      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes workoutSlideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        @keyframes workoutFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>


      {/* ── Workout Detail Overlay ── */}
      {selectedWorkout && (
        <div
          onClick={() => setSelectedWorkout(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "flex-end", justifyContent: "center",
            animation: "workoutFadeIn 0.22s ease",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 680,
              background: "#fff",
              borderRadius: "28px 28px 0 0",
              padding: "32px 28px 40px",
              maxHeight: "88vh", overflowY: "auto",
              boxShadow: "0 -8px 48px rgba(0,0,0,0.16)",
              animation: "workoutSlideUp 0.28s cubic-bezier(0.34,1.56,0.64,1)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: "#1A1A18", margin: "0 0 6px" }}>
                  {selectedWorkout.plan?.title || "Workout Plan"}
                </h2>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {selectedWorkout.plan?.duration && (
                    <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 14px", borderRadius: 9999, background: "#EEF8D7", color: "#4D5300" }}>
                      ⏱ {selectedWorkout.plan.duration}
                    </span>
                  )}
                  {selectedWorkout.inputs?.fitnessLevel && (
                    <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 14px", borderRadius: 9999, background: "#EEF8D7", color: "#4D5300" }}>
                      {selectedWorkout.inputs.fitnessLevel}
                    </span>
                  )}
                  {selectedWorkout.plan?.focus && (
                    <span style={{ fontSize: 12, fontWeight: 600, padding: "4px 14px", borderRadius: 9999, background: "rgba(124,111,205,0.1)", color: "#4A3D6B" }}>
                      🎯 {selectedWorkout.plan.focus}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedWorkout(null)}
                style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: "rgba(26,26,24,0.07)", cursor: "pointer", fontSize: 18, color: "#1A1A18", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                ✕
              </button>
            </div>

            {/* Date & status */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <span style={{ fontSize: 13, color: "rgba(26,26,24,0.5)" }}>{getRelativeDate(selectedWorkout.createdAt)}</span>
              {selectedWorkout.status === 'completed' && (
                <span style={{ fontSize: 13, fontWeight: 700, color: "#059669", background: "rgba(5,150,105,0.08)", padding: "4px 12px", borderRadius: 9999 }}>✓ Completed</span>
              )}
            </div>

            {/* Warmup */}
            {selectedWorkout.plan?.warmup?.length > 0 && (
              <div style={{ background: "rgba(52,199,89,0.06)", border: "1px solid rgba(52,199,89,0.18)", borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
                <h3 style={{ fontSize: 11, fontWeight: 700, color: "#14532D", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Warmup</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {selectedWorkout.plan.warmup.map((ex, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#1A1A18" }}>
                      <span>{ex.name}</span>
                      <span style={{ color: "rgba(26,26,24,0.45)" }}>{ex.duration || ex.reps}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Exercises */}
            {selectedWorkout.plan?.exercises?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 11, fontWeight: 700, color: "#3D4000", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Main Circuit</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {selectedWorkout.plan.exercises.map((ex, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(202,219,0,0.07)", border: "1px solid rgba(202,219,0,0.18)", borderRadius: 12, padding: "10px 14px" }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1A18" }}>{ex.name}</div>
                        <div style={{ fontSize: 12, color: "rgba(26,26,24,0.45)" }}>
                          {ex.sets && `${ex.sets} sets`}{ex.sets && ex.reps && " × "}{ex.reps && `${ex.reps}`}{ex.duration && ` · ${ex.duration}`}
                        </div>
                        {ex.notes && <div style={{ fontSize: 11, color: "#E07A3A", fontStyle: "italic", marginTop: 2 }}>{ex.notes}</div>}
                      </div>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(26,26,24,0.07)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "rgba(26,26,24,0.4)", fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cooldown */}
            {selectedWorkout.plan?.cooldown?.length > 0 && (
              <div style={{ background: "rgba(124,111,205,0.07)", border: "1px solid rgba(124,111,205,0.18)", borderRadius: 14, padding: "14px 16px", marginBottom: 28 }}>
                <h3 style={{ fontSize: 11, fontWeight: 700, color: "#4A3D6B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Cooldown</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {selectedWorkout.plan.cooldown.map((ex, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#1A1A18" }}>
                      <span>{ex.name}</span>
                      <span style={{ color: "rgba(26,26,24,0.45)" }}>{ex.duration || ex.reps}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            {selectedWorkout.status !== 'completed' && (
              <button
                onClick={(e) => handleMarkComplete(e, selectedWorkout._id)}
                disabled={completingId === selectedWorkout._id}
                style={{
                  width: "100%", padding: "14px", borderRadius: 16, border: "none",
                  background: completingId === selectedWorkout._id ? "rgba(202,219,0,0.5)" : "#CADB00",
                  color: "#1A1A18", fontSize: 15, fontWeight: 800,
                  cursor: completingId === selectedWorkout._id ? "not-allowed" : "pointer",
                  transition: "all 0.2s", letterSpacing: "0.01em",
                  boxShadow: "0 4px 16px rgba(202,219,0,0.30)"
                }}
              >
                {completingId === selectedWorkout._id ? "Saving…" : "✓ Mark as Complete"}
              </button>
            )}
            {selectedWorkout.status === 'completed' && (
              <div style={{ textAlign: "center", fontSize: 14, fontWeight: 700, color: "#059669", padding: "12px", background: "rgba(5,150,105,0.07)", borderRadius: 14, border: "1px solid rgba(5,150,105,0.15)" }}>
                🎉 Workout Completed!
              </div>
            )}
          </div>
        </div>
      )}

      {/* RPE Completion Modal */}
      <WorkoutCompleteModal
        isOpen={completeModal.open}
        onSave={handleModalSave}
        onSkip={handleModalSkip}
        onClose={() => setCompleteModal({ open: false, workoutId: null })}
      />
    </div>
  );
}

