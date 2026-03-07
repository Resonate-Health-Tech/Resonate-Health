import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { uploadPDF } from "../middlewares/pdfUpload.js";
import {
  uploadDiagnostics,
  getLatestDiagnostics,
  getDiagnosticsHistory,
  getDiagnosticsStatus,
  fetchDiagnosticsFromAPI
} from "../controllers/diagnostics.controller.js";

const router = express.Router();

router.post("/upload", isAuthenticated, uploadPDF.single("report"), uploadDiagnostics);
router.get("/latest", isAuthenticated, getLatestDiagnostics);
router.get("/history", isAuthenticated, getDiagnosticsHistory);
router.get("/status/:id", isAuthenticated, getDiagnosticsStatus);
router.post("/fetch-from-api", isAuthenticated, fetchDiagnosticsFromAPI);

export default router;
