import admin from "firebase-admin";
import dotenv from "dotenv";
dotenv.config();

if (!admin.apps.length) {
  try {
    if (!process.env.FIREBASE_ADMIN_KEY) {
      throw new Error("FIREBASE_ADMIN_KEY is not set in environment variables");
    }
    const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY);
    console.log("[Firebase Admin] Initializing for project:", serviceAccount?.project_id);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: "resonate-client.appspot.com",
    });

    console.log("[Firebase Admin] Initialized successfully");
  } catch (err) {
    console.error("[Firebase Admin] INITIALIZATION FAILED:", err.message);
    process.exit(1); // crash fast so the problem is obvious
  }
}

export default admin;
