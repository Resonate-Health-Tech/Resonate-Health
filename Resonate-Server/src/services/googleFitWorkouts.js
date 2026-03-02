import { google } from "googleapis";
import { oauth2Client } from "../googleClient.js";

export async function fetchWorkouts() {
  const fitness = google.fitness({
    version: "v1",
    auth: oauth2Client,
  });

  const endTimeMillis = Date.now();
  const startTimeMillis = new Date(
  new Date(endTimeMillis - 6 * 24 * 60 * 60 * 1000)
    .setHours(0, 0, 0, 0)
).getTime();

  const response = await fitness.users.dataset.aggregate({
    userId: "me",
    requestBody: {
      aggregateBy: [
        { dataTypeName: "com.google.activity.segment" }
      ],
      bucketByTime: { durationMillis: 86400000 },
      startTimeMillis,
      endTimeMillis,
    },
  });

  return response.data.bucket || [];
}

const ACTIVITY_MAP = {
  1: "Biking",
  7: "Walking",
  8: "Running",
  72: "Workout",
  93: "Strength Training",
  94: "Yoga",
  109: "HIIT"
};

const VALID_WORKOUT_CODES = new Set([
  1, 7, 8, 72, 93, 94, 109
]);

export function parseWorkouts(buckets) {
  const workoutMap = {};

  for (const bucket of buckets) {
    const date = new Date(Number(bucket.startTimeMillis))
      .toISOString()
      .split("T")[0];

    const points = bucket.dataset?.[0]?.point || [];

    for (const p of points) {
      const activityCode = p.value?.[0]?.intVal;

      if (!VALID_WORKOUT_CODES.has(activityCode)) continue;

      const durationMinutes =
        (Number(p.endTimeNanos) - Number(p.startTimeNanos)) / 1e6 / 60000;

      if (durationMinutes < 10) continue;

      if (!workoutMap[date]) {
        workoutMap[date] = [];
      }

      workoutMap[date].push({
        type: ACTIVITY_MAP[activityCode] || "Workout",
        durationMinutes: Math.round(durationMinutes),
        caloriesBurned: p.value?.[1]?.fpVal || 0
      });
    }
  }

  const result = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);

    const key = d.toISOString().split("T")[0];

    result.push({
      date: key,
      workouts: workoutMap[key] ?? []
    });
  }

  return result;
}
