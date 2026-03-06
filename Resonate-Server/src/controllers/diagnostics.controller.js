import { Diagnostics } from "../models/Diagnostics.js";
import { User } from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import axios from "axios";
import { redisClient } from "../config/redis.js";
import sendReportReady from "../services/notification.js";
import dotenv from "dotenv";
import { processBiomarkers } from "../utils/biomarkerReference.js";
import { BIOMARKERS_LIST } from "../config/biomarkers.js";
import logger from "../utils/logger.js";
import { addPdfJob } from "../services/queues/pdfQueue.js";

import { DiagnosticsIngestor } from "../services/ingestors/diagnostics.ingestor.js";
import { MemoryService } from "../services/memory.service.js";
import { insightsCacheService } from "../services/insights/insights.cache.service.js";

dotenv.config();

const memoryService = new MemoryService();
const diagnosticsIngestor = new DiagnosticsIngestor(memoryService);

// Helper to build the cache key for a user's diagnostics history
const diagCacheKey = (userId, category) => `diag_history:${userId}:${category || 'all'}`;


export const uploadDiagnostics = async (req, res) => {

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "PDF file required" });
  }

  const userId = req.user.firebaseUid

  try {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "resonate-reports",
      },
      async (error, result) => {
        try {
          if (error) {
            console.error("Cloudinary upload error:", JSON.stringify(error, null, 2));
            return res.status(500).json({
              message: "Cloudinary upload failed",
              detail: error.message || error.error?.message || String(error)
            });
          }

          const pdfUrl = result.secure_url;

          const category = req.body.category || 'blood';

          const record = await Diagnostics.create({
            userId,
            pdfUrl,
            category,
            status: "pending",
          });

          // Dispatch parsing to background queue
          await addPdfJob(`parse-pdf-${record._id}`, {
            userId,
            pdfUrl,
            category,
            recordId: record._id
          });

          logger.info(`Queued PDF parsing job for record ${record._id}`);

          // Invalidate diagnostics history cache instantly so UI marks it as pending
          await redisClient.del(diagCacheKey(userId, null));
          await redisClient.del(diagCacheKey(userId, record.category));

          return res.status(202).json({
            message: "Report uploaded and is being processed in the background",
            diagnostics: {
              _id: record._id,
              userId: record.userId,
              pdfUrl: record.pdfUrl,
              status: record.status,
              createdAt: record.createdAt,
            },
          });

        } catch (err) {
          console.error("Internal record creation error:", err);
          return res.status(500).json({ message: "Failed to queue job" });
        }
      }
    );

    uploadStream.end(req.file.buffer);

  } catch (err) {
    console.error("Outer error:", err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};


export const getLatestDiagnostics = async (req, res) => {
  try {
    const userId = req.user.firebaseUid;

    const latest = await Diagnostics.findOne({ userId })
      .sort({ createdAt: -1 })
      .select("biomarkers biomarkersByCategory status pdfUrl updatedAt createdAt");


    return res.json(latest);
  } catch (error) {
    console.error("getLatestDiagnostics error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};



export const getDiagnosticsHistory = async (req, res) => {
  try {
    const userId = req.user.firebaseUid;
    const { category } = req.query;

    // Check Redis cache first
    const cacheKey = diagCacheKey(userId, category);
    const cachedStr = await redisClient.get(cacheKey);

    if (cachedStr) {
      logger.info(`diagCache HIT (Redis) for user ${userId}`);
      return res.json(JSON.parse(cachedStr));
    }

    const query = { userId };
    if (category && category !== 'all') {
      query.category = category;
    }

    const history = await Diagnostics.find(query)
      .sort({ createdAt: -1 })
      .select("biomarkers biomarkersByCategory status category pdfUrl updatedAt createdAt");

    const plainHistory = JSON.parse(JSON.stringify(history));

    // Set in Redis with 30s TTL
    await redisClient.setex(cacheKey, 30, JSON.stringify(plainHistory));

    return res.json(plainHistory);
  } catch (error) {
    console.error("getDiagnosticsHistory error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


export const fetchDiagnosticsFromAPI = async (req, res) => {
  // Guard: Lab API integration is not yet configured
  if (!process.env.LAB_API_URL || !process.env.LAB_API_KEY) {
    return res.status(501).json({
      message: "Lab API integration is not configured on this server.",
      code: "NOT_IMPLEMENTED"
    });
  }

  try {
    const userId = req.user.firebaseUid;

    const user = await User.findOne({ firebaseUid: userId });
    const userGender = user?.gender || null;

    const labResponse = await axios.get(
      `${process.env.LAB_API_URL}/reports?patient_id=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.LAB_API_KEY}`
        },
        timeout: 30000
      }
    );

    const data = labResponse.data;

    if (!data) {
      return res.status(400).json({ message: "No biomarker data received" });
    }

    const processed = processBiomarkers(data, userGender, null);

    const record = await Diagnostics.create({
      userId: userId,
      pdfUrl: "N/A",
      biomarkers: processed.all,
      biomarkersByCategory: processed.byCategory,
      status: "completed"
    });

    // Push to Memory Layer (same pattern as uploadDiagnostics)
    try {
      const memoryMarkers = Object.entries(processed.all).map(([key, data]) => ({
        name: key,
        value: data.value,
        unit: data.unit,
        status: data.status,
        previous_value: null
      }));

      await diagnosticsIngestor.processReport(userId, {
        date: new Date().toISOString().split('T')[0],
        markers: memoryMarkers
      }, 'blood');
      logger.info(`Pushed blood report memory for user ${userId} (from Lab API)`);
    } catch (memoryError) {
      console.error("Memory push error (Lab API):", memoryError);
    }

    return res.json({
      message: "Data fetched & processed successfully",
      diagnostics: record
    });

  } catch (error) {
    logger.error("fetchDiagnosticsFromAPI", "Lab API fetch failed", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
