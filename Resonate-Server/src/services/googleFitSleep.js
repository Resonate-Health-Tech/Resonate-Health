import { google } from "googleapis";
import { oauth2Client } from "../googleClient.js";

export async function fetchSleep() {
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
        { dataTypeName: "com.google.sleep.segment" }
      ],
      bucketByTime: { durationMillis: 86400000 },
      startTimeMillis,
      endTimeMillis,
    },
  });

  return response.data.bucket || [];
}

export function parseSleep(buckets) {
  const sleepMap = {};

  for (const bucket of buckets) {
    const date = new Date(Number(bucket.startTimeMillis))
      .toISOString()
      .split("T")[0];

    let totalSleepMs = 0;
    let deepMs = 0;
    let remMs = 0;
    let lightMs = 0;
    const points = bucket.dataset?.[0]?.point || [];

    for (const p of points) {
      const sleepStage = p.value?.[0]?.intVal;
      const durationMs = (Number(p.endTimeNanos) - Number(p.startTimeNanos)) / 1e6;

      // Google Fit sleep stages: 1=light, 2=deep, 3=REM, 4=awake
      if (sleepStage === 1) {
        lightMs += durationMs;
        totalSleepMs += durationMs;
      } else if (sleepStage === 2) {
        deepMs += durationMs;
        totalSleepMs += durationMs;
      } else if (sleepStage === 3) {
        remMs += durationMs;
        totalSleepMs += durationMs;
      }
      // sleepStage === 4 (awake) is excluded from sleep totals
    }

    const toMinutes = (ms) => ms > 0 ? Math.round(ms / 60000) : null;

    sleepMap[date] = {
      sleepHours: Math.round((totalSleepMs / (1000 * 60 * 60)) * 10) / 10,
      deepSleepMinutes: toMinutes(deepMs),
      remSleepMinutes: toMinutes(remMs),
      lightSleepMinutes: toMinutes(lightMs),
    };
  }

  const result = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);

    const key = d.toISOString().split("T")[0];
    const entry = sleepMap[key];

    result.push({
      date: key,
      sleepHours: entry?.sleepHours ?? 0,
      deepSleepMinutes: entry?.deepSleepMinutes ?? null,
      remSleepMinutes: entry?.remSleepMinutes ?? null,
      lightSleepMinutes: entry?.lightSleepMinutes ?? null,
    });
  }

  return result;
}

