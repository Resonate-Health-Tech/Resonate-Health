import admin from "../config/firebaseAdmin.js";
import dotenv from "dotenv";
dotenv.config();


export const verifyFirebaseToken = async (req, res, next) => {

  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("[Firebase Auth] Token verification failed:", error.code, error.message);
    return res.status(401).json({ message: "Invalid or expired token", detail: error.code });
  }
};


