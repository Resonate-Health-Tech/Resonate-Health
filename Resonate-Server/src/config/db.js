import mongoose from "mongoose";
import logger from "../utils/logger.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 200,                // Increased from 50 — supports 1000 concurrent users
      minPoolSize: 10,                 // Keep 10 warm to avoid cold-start latency
      serverSelectionTimeoutMS: 5000,  // Fail fast if DB is unreachable
      socketTimeoutMS: 45000,          // Allow long-running queries up to 45s
    });
    logger.info("DB", "MongoDB Connected");
  } catch (error) {
    logger.error("DB", "MongoDB Error", { error: error.message });
    process.exit(1);
  }
};
