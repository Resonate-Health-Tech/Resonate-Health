import { oauth2Client } from "../googleClient.js";
import { User } from "../models/User.js";
import { FitnessData } from "../models/FitnessData.js";

import { fetchSteps, parseSteps } from "../services/googleFitSteps.js";
import { fetchSleep, parseSleep } from "../services/googleFitSleep.js";
import { fetchWorkouts, parseWorkouts } from "../services/googleFitWorkouts.js";

export const redirectToGoogleFit = (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/fitness.activity.read",
      "https://www.googleapis.com/auth/fitness.sleep.read",
    ],
    prompt: "consent",
    state: req.user.firebaseUid,
  });

  res.redirect(url);
};

export const handleGoogleFitCallback = async (req, res) => {
  try {
    const { code, state: firebaseUid } = req.query;

    if (!code || !firebaseUid) {
      return res.status(400).send("Invalid OAuth callback");
    }


    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(401).send("User not found");
    }

    user.googleFit = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: tokens.expiry_date,
    };
    user.fitnessProvider = "google_fit";
    user.fitnessConnected = true;

    await user.save();

    const stepBuckets = await fetchSteps(tokens.access_token);
    const stepsHistory = parseSteps(stepBuckets);

    const sleepBuckets = await fetchSleep(tokens.access_token);
    const sleepHistory = parseSleep(sleepBuckets);

    const workoutBuckets = await fetchWorkouts(tokens.access_token);
    const workoutHistory = parseWorkouts(workoutBuckets);

    await FitnessData.findOneAndUpdate(
      {
        userId: user._id,
        provider: "google_fit",
      },
      {
        $set: {
          stepsHistory,
          sleepHistory,
          workoutHistory,
          lastSyncTime: new Date(),
        },
      },
      {
        upsert: true,
        new: true,
      }
    );

    return res.redirect(
      `${process.env.CLIENT_URL}/dashboard`
    );
  } catch (error) {
    console.error("Google Fit OAuth error:", error);
    res.status(500).send("Failed to connect Google Fit");
  }
};

export const getGoogleFitData = async (req, res) => {

  try {
    if (!req.user) return res.status(404).json({ message: "User not found" });

    const userId = req.user._id;

    const fitness = await FitnessData.findOne(
      { userId, provider: "google_fit" },
      {
        _id: 0,
        stepsHistory: 1,
        sleepHistory: 1,
        workoutHistory: 1,
        lastSyncTime: 1,
        stepGoal: 1
      }
    );


    return res.json(fitness);
  }

  catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export const updateStepGoal = async (req, res) => {
  try {
    const userId = req.user._id;
    const { stepGoal } = req.body;

    if (stepGoal === undefined) return res.status(400).json({ message: "Step goal required" });

    const fitness = await FitnessData.findOneAndUpdate(
      { userId, provider: "google_fit" },
      { $set: { stepGoal } },
      { new: true, upsert: true }
    );

    res.json({ stepGoal: fitness.stepGoal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
