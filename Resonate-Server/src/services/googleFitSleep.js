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
    const points = bucket.dataset?.[0]?.point || [];

    for (const p of points) {
      const sleepStage = p.value?.[0]?.intVal;

      const SLEEP_STAGES = [1, 2, 3, 4];

      if (SLEEP_STAGES.includes(sleepStage)) {
        totalSleepMs +=
          (Number(p.endTimeNanos) - Number(p.startTimeNanos)) / 1e6;
      }
    }

    const sleepHours =
      Math.round((totalSleepMs / (1000 * 60 * 60)) * 10) / 10;

    sleepMap[date] = sleepHours;
  }

  const result = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);

    const key = d.toISOString().split("T")[0];

    result.push({
      date: key,
      sleepHours: sleepMap[key] ?? 0
    });
  }

  return result;
}
