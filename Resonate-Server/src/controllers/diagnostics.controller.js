import { Diagnostics } from "../models/Diagnostics.js";
import { User } from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import axios from "axios";
import NodeCache from "node-cache";
import sendReportReady from "../services/notification.js";
import dotenv from "dotenv";
import { processBiomarkers } from "../utils/biomarkerReference.js";
import { BIOMARKERS_LIST } from "../config/biomarkers.js";
import logger from "../utils/logger.js";

import { DiagnosticsIngestor } from "../services/ingestors/diagnostics.ingestor.js";
import { MemoryService } from "../services/memory.service.js";
import { insightsCacheService } from "../services/insights/insights.cache.service.js";

dotenv.config();

const memoryService = new MemoryService();
const diagnosticsIngestor = new DiagnosticsIngestor(memoryService);

// In-memory cache for diagnostics history — 30 second TTL
// Dramatically reduces MongoDB load during dashboard refreshes at scale
const diagCache = new NodeCache({ stdTTL: 30, checkperiod: 60 });

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
    const user = await User.findOne({ firebaseUid: userId });
    const userGender = user?.gender || null;

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

          try {
            const parsingResponse = await axios.post(
              `${process.env.MICROSERVICE_URL}/parse-report`,
              {
                pdfUrl,
                biomarkers: BIOMARKERS_LIST
              },
              {
                headers: {
                  "x-internal-secret": process.env.INTERNAL_API_SECRET
                },
                timeout: 90000 // 90s — AI parsing can be slow
              }
            );



            const rawBiomarkers = parsingResponse.data.values || {};

            if (!rawBiomarkers || Object.keys(rawBiomarkers).length === 0) {
              record.status = "failed";
              await record.save();
              return res.status(400).json({
                message: "No biomarkers found in the report"
              });
            }

            const processed = processBiomarkers(rawBiomarkers, userGender, null);

            record.biomarkers = processed.all;
            record.biomarkersByCategory = processed.byCategory;
            record.status = "completed";
            await record.save();

            try {
              await sendReportReady(userId);
            } catch (notifError) {
              console.error("Notification error:", notifError);
            }

            // Push to Memory Layer
            try {
              if (category === 'cgm') {
                // Build a CGM summary from biomarkers for the dedicated processCGM ingestor
                const cgmSummary = {
                  description: `CGM data from report on ${new Date().toISOString().split('T')[0]}`,
                  period: new Date().toISOString().split('T')[0],
                  avg_glucose_mg_dl: processed.all?.avg_glucose?.value ?? null,
                  time_in_range_percent: processed.all?.time_in_range?.value ?? null,
                  spike_count: processed.all?.spike_count?.value ?? null,
                  fasting_glucose_mg_dl: processed.all?.fasting_glucose?.value ?? null
                };
                await diagnosticsIngestor.processCGM(userId, cgmSummary);
                logger.info(`Pushed CGM diagnostics memory for user ${userId}`);
              } else {
                const memoryMarkers = Object.entries(processed.all).map(([key, data]) => ({
                  name: key,
                  value: data.value,
                  unit: data.unit,
                  status: data.status,
                  previous_value: null // TODO: Fetch previous record to compare
                }));

                await diagnosticsIngestor.processReport(userId, {
                  date: new Date().toISOString().split('T')[0],
                  markers: memoryMarkers
                }, category);
                logger.info(`Pushed ${category} report memory for user ${userId}`);
              }
            } catch (memoryError) {
              console.error("Memory push error:", memoryError);
              // Don't fail the request if memory push fails
            }

            // Invalidate diagnostics history cache for this user so they
            // immediately see the new upload on their next dashboard load
            diagCache.del(diagCacheKey(userId, null));
            diagCache.del(diagCacheKey(userId, record.category));

            // Invalidate insights cache — new biomarker data means insights need to be refreshed
            // Fire-and-forget: don't await, don't block the response
            insightsCacheService.invalidateCache(userId).catch(err =>
              logger.error('invalidateInsightsCache', 'Failed to invalidate insight cache', err)
            );

            return res.json({
              message: "Report uploaded and parsed successfully",
              diagnostics: {
                _id: record._id,
                userId: record.userId,
                pdfUrl: record.pdfUrl,
                status: record.status,
                biomarkers: record.biomarkers,
                biomarkersByCategory: record.biomarkersByCategory,
                createdAt: record.createdAt,
                updatedAt: record.updatedAt
              },
            });

          } catch (err) {
            console.error("Parsing error:", err);
            record.status = "failed";
            await record.save();

            if (err.response) {
              return res.status(err.response.status).json({
                message: err.response.data.detail || err.response.data.message || "Microservice error",
              });
            }

            return res.status(500).json({
              message: "Microservice unreachable or parsing failed",
            });
          }

        } catch (err) {
          console.error("Internal error:", err);
          return res.status(500).json({ message: "Internal server error" });
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

    // Check cache first — avoids hammering MongoDB on every dashboard refresh
    const cacheKey = diagCacheKey(userId, category);
    const cached = diagCache.get(cacheKey);
    if (cached !== undefined) {
      logger.info(`diagCache HIT for user ${userId}`);
      return res.json(cached);
    }

    const query = { userId };
    if (category && category !== 'all') {
      query.category = category;
    }

    const history = await Diagnostics.find(query)
      .sort({ createdAt: -1 })
      .select("biomarkers biomarkersByCategory status category pdfUrl updatedAt createdAt");

    // JSON round-trip: strips Mongoose internals (TCP socket refs, etc.) that
    // node-cache's `clone` library cannot deep-copy (read-only properties crash it)
    const plainHistory = JSON.parse(JSON.stringify(history));
    diagCache.set(cacheKey, plainHistory);
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
