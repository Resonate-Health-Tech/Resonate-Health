import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { uploadPDF } from "../middlewares/pdfUpload.js";
import {
  uploadDiagnostics,
  getLatestDiagnostics,
  getDiagnosticsHistory,
  fetchDiagnosticsFromAPI
} from "../controllers/diagnostics.controller.js";

const router = express.Router();

router.post("/upload", isAuthenticated, uploadPDF.single("report"), uploadDiagnostics);
router.get("/latest", isAuthenticated, getLatestDiagnostics);
router.get("/history", isAuthenticated, getDiagnosticsHistory);
router.post("/fetch-from-api", isAuthenticated, fetchDiagnosticsFromAPI);

export default router;
