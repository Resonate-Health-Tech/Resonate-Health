import { User } from "../models/User.js";
import { FitnessData } from "../models/FitnessData.js";
import { oauth2Client } from "../googleClient.js";

import { fetchSteps, parseSteps } from "./googleFitSteps.js";
import { fetchSleep, parseSleep } from "./googleFitSleep.js";
import { fetchWorkouts, parseWorkouts } from "./googleFitWorkouts.js";
import { MemoryService } from "./memory.service.js";
import { FitnessIngestor } from "./ingestors/fitness.ingestor.js";
import { RecoveryIngestor } from "./ingestors/recovery.ingestor.js";

import {
  normalizeLast7Days,
  normalizeWorkoutLast7Days,
} from "../utils/normalizeLast7Days.js";

const memoryService = new MemoryService();
const fitnessIngestor = new FitnessIngestor(memoryService);
const recoveryIngestor = new RecoveryIngestor(memoryService);



export async function syncGoogleFitForAllUsers() {
  const users = await User.find({
    fitnessProvider: "google_fit",
    fitnessConnected: true,
  }).lean();

  console.log(`Syncing ${users.length} Google Fit users`);

  for (const user of users) {
    await syncUserSafely(user);
  }
}


async function syncUserSafely(user) {
  try {
    await syncSingleUser(user);
    console.log(`Synced user ${user._id}`);
  } catch (err) {
    console.error(`User ${user._id} sync failed:`, err.message);
  }
}


async function syncSingleUser(user) {
  oauth2Client.setCredentials({
    access_token: user.googleFit.accessToken,
    refresh_token: user.googleFit.refreshToken,
    expiry_date: user.googleFit.expiryDate,
  });

  if (Date.now() >= user.googleFit.expiryDate - 60_000) {
    const { credentials } = await oauth2Client.refreshAccessToken();

    oauth2Client.setCredentials(credentials);

    await User.updateOne(
      { _id: user._id },
      {
        "googleFit.accessToken": credentials.access_token,
        "googleFit.expiryDate": credentials.expiry_date,
      }
    );
  }

  await fetchAndSaveFitnessData(user);
}


async function fetchAndSaveFitnessData(user) {
  const [stepsBuckets, sleepBuckets, workoutBuckets] =
    await Promise.allSettled([
      fetchSteps(),
      fetchSleep(),
      fetchWorkouts(),
    ]);

  const parsedSteps =
    stepsBuckets.status === "fulfilled"
      ? parseSteps(stepsBuckets.value)
      : [];

  const parsedSleep =
    sleepBuckets.status === "fulfilled"
      ? parseSleep(sleepBuckets.value)
      : [];

  const parsedWorkouts =
    workoutBuckets.status === "fulfilled"
      ? parseWorkouts(workoutBuckets.value)
      : [];

  const stepsHistory = normalizeLast7Days(parsedSteps, "steps");
  const sleepHistory = normalizeLast7Days(parsedSleep, "sleepHours");
  const workoutHistory = normalizeWorkoutLast7Days(parsedWorkouts);

  await FitnessData.updateOne(
    { userId: user._id, provider: "google_fit" },
    {
      $set: {
        stepsHistory,
        sleepHistory,
        workoutHistory,
        lastSyncTime: new Date(),
      },
    },
    { upsert: true }
  );
}

export async function pushDailyFitnessSummary(userId, memoryUserId = null) {
  try {
    const today = new Date().toISOString().split("T")[0];
    const fitnessData = await FitnessData.findOne({ userId, provider: "google_fit" });

    if (!fitnessData) return;

    const stepsEntry = fitnessData.stepsHistory.find(d => d.date === today);
    const sleepEntry = fitnessData.sleepHistory.find(d => d.date === today);
    const workoutsEntry = fitnessData.workoutHistory.find(d => d.date === today);

    const summaryData = {
      date: today,
      steps: stepsEntry ? stepsEntry.steps : 0,
      sleepHours: sleepEntry ? sleepEntry.sleepHours : 0,
      workoutCount: workoutsEntry ? workoutsEntry.workouts.length : 0
    };

    if (!memoryUserId) {
      const user = await User.findById(userId).select('firebaseUid');
      memoryUserId = user?.firebaseUid || userId;
    }

    // Push daily fitness summary (steps + workout count)
    await fitnessIngestor.processDailySummary(memoryUserId, summaryData);
    console.log(`Pushed daily fitness summary for user ${memoryUserId}`);

    // Push individual sleep entry to recovery.sleep so MemoryContextBuilder can query it
    if (sleepEntry && sleepEntry.sleepHours > 0) {
      try {
        await recoveryIngestor.processSleepEvent(memoryUserId, {
          hours: sleepEntry.sleepHours,
          quality_score: 0, // Google Fit does not provide quality score
          interruptions: 0,
          source: 'google_fit'
        });
        console.log(`Pushed sleep memory for user ${memoryUserId}: ${sleepEntry.sleepHours}h`);
      } catch (sleepMemError) {
        console.error(`Sleep memory push failed for user ${memoryUserId}:`, sleepMemError.message);
      }
    }

  } catch (error) {
    console.error(`Failed to push daily summary for user ${userId}:`, error.message);
  }
}
