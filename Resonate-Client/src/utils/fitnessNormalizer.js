export function normalizeFitnessData(apiData) {
  const stepsHistory = apiData.stepsHistory || [];
  const sleepHistory = apiData.sleepHistory || [];
  const workoutHistory = apiData.workoutHistory || [];

  const labels = stepsHistory.map(item =>
    new Date(item.date).toLocaleDateString("en-US", { weekday: "short" })
  );

  const weeklySteps = stepsHistory.map(item => item.steps);
  const weeklySleep = sleepHistory.map(item => item.sleepHours);

  const todaySteps =
    stepsHistory.length > 0
      ? stepsHistory[stepsHistory.length - 1].steps
      : 0;

  const sleepHours =
    sleepHistory.length > 0
      ? sleepHistory[sleepHistory.length - 1].sleepHours
      : 0;

  const today = new Date().toISOString().split("T")[0];
  const todayWorkout = workoutHistory.find(w => w.date === today);

  const workoutCount = todayWorkout ? todayWorkout.workouts.length : 0;

  // First Google Fit workout name recorded today
  const todayWorkoutName =
    todayWorkout?.workouts?.[0]?.activityType ||
    todayWorkout?.workouts?.[0]?.name ||
    null;

  // Total active minutes across today's Google Fit workouts
  const activeMinutes = todayWorkout
    ? todayWorkout.workouts.reduce((sum, w) => sum + (w.durationMinutes || 0), 0)
    : 0;

  // ── New metric signal fields for NewDashboardPage ─────────────────────────

  // Resting HR: last sleep entry may carry heartRate data, fallback null
  const lastSleep = sleepHistory.length > 0 ? sleepHistory[sleepHistory.length - 1] : null;
  const restingHR = lastSleep?.restingHeartRate || null;
  const prevRestingHR = sleepHistory.length > 1 ? sleepHistory[sleepHistory.length - 2]?.restingHeartRate || null : null;
  const restingHRTrend = restingHR && prevRestingHR ? restingHR - prevRestingHR : null;

  // HRV: derived from step consistency as proxy if not directly available
  // If raw HRV is stored on sleepHistory entries, use it; else null
  const hrvHistory = sleepHistory.map(s => s.hrv || null).filter(Boolean);
  const currentHRV = hrvHistory.length > 0 ? Math.round(hrvHistory[hrvHistory.length - 1]) : null;
  const prevHRV = hrvHistory.length > 1 ? hrvHistory[hrvHistory.length - 2] : null;
  const hrvTrendPct = currentHRV && prevHRV
    ? ((currentHRV - prevHRV) / prevHRV * 100).toFixed(1)
    : null;

  // Weekly HRV array for sparkline (last 7 entries)
  const weeklyHRV = sleepHistory.slice(-7).map(s => s.hrv || null);

  // Sleep quality & deep sleep (from sleep stages if available)
  const todaySleep = lastSleep;
  const totalSleepMin = (todaySleep?.sleepHours || 0) * 60;
  const deepSleepMin = todaySleep?.deepSleepMinutes || null;
  const remSleepMin = todaySleep?.remSleepMinutes || null;
  const lightSleepMin = todaySleep?.lightSleepMinutes || null;

  const sleepQualityPct = totalSleepMin > 0 && (deepSleepMin || remSleepMin || lightSleepMin)
    ? Math.min(Math.round(((deepSleepMin || 0) + (remSleepMin || 0) + (lightSleepMin || 0)) / totalSleepMin * 100), 100)
    : null;

  const deepSleepPct = totalSleepMin > 0 && deepSleepMin
    ? Math.round((deepSleepMin / totalSleepMin) * 100)
    : null;

  // Recovery % = weighted combo of HRV + sleep quality
  let recoveryPct = null;
  if (currentHRV !== null || sleepHours > 0) {
    const hrvComponent = currentHRV !== null ? Math.min((currentHRV / 100) * 100, 100) : 60;
    const sleepComponent = Math.min((sleepHours / 9) * 100, 100);
    recoveryPct = Math.round(hrvComponent * 0.6 + sleepComponent * 0.4);
  }

  // Cardio load: sum of durationMinutes across all of this week's workouts
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const weeklyWorkouts = workoutHistory.filter(w => w.date >= sevenDaysAgo);
  const cardioLoad = weeklyWorkouts.reduce((sum, day) =>
    sum + (day.workouts || []).reduce((s, w) => s + (w.durationMinutes || 0), 0), 0
  );

  // Prev week for cardio load trend
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const prevWeekWorkouts = workoutHistory.filter(w => w.date >= fourteenDaysAgo && w.date < sevenDaysAgo);
  const prevCardioLoad = prevWeekWorkouts.reduce((sum, day) =>
    sum + (day.workouts || []).reduce((s, w) => s + (w.durationMinutes || 0), 0), 0
  );
  const cardioLoadTrend = cardioLoad !== 0 && prevCardioLoad !== 0
    ? Math.round(cardioLoad - prevCardioLoad)
    : null;

  // Sleep trend vs previous day
  const prevSleepHours = sleepHistory.length > 1
    ? sleepHistory[sleepHistory.length - 2]?.sleepHours || null
    : null;
  const sleepTrend = sleepHours && prevSleepHours
    ? (sleepHours - prevSleepHours).toFixed(1)
    : null;

  return {
    todaySteps,
    sleepHours,
    workoutCount,
    todayWorkoutName,
    activeMinutes,
    weeklySteps,
    weeklySleep,
    labels,
    lastSyncTime: apiData.lastSyncTime,
    // New fields
    restingHR,
    restingHRTrend,
    currentHRV,
    hrvTrendPct,
    weeklyHRV,
    sleepQualityPct,
    deepSleepPct,
    recoveryPct,
    cardioLoad: cardioLoad || null,
    cardioLoadTrend,
    sleepTrend,
  };
}

