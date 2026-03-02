export function normalizeLast7Days(data, valueKey, defaultValue = 0) {
  const map = new Map(data.map(d => [d.date, d]));

  const result = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000)
      .toISOString()
      .split("T")[0];

    result.push(
      map.get(date) || { date, [valueKey]: defaultValue }
    );
  }

  return result;
}

export function normalizeWorkoutLast7Days(workouts) {
  const map = new Map(workouts.map(w => [w.date, w.workouts]));

  const result = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000)
      .toISOString()
      .split("T")[0];

    result.push({
      date,
      workouts: map.get(date) || [],
    });
  }

  return result;
}
