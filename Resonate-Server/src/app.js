import express from "express";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import timeout from "connect-timeout";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import diagnosticsRoutes from "./routes/diagnostics.routes.js";
import fitRoutes from "./routes/fitConnect.routes.js"
import waterRoutes from "./routes/water.routes.js"
import coachRoutes from "./routes/coachLead.routes.js"
import workoutRoutes from "./routes/workout.routes.js"
import nutritionRoutes from "./routes/nutrition.routes.js"
import foodRoutes from "./routes/food.routes.js"
import interventionRoutes from "./routes/intervention.routes.js";
import dailyLogRoutes from "./routes/dailyLog.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import insightsRoutes from "./routes/insights.routes.js";
import adminDashboardRoutes from "./routes/admin.dashboard.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { defaultRateLimiter, strictRateLimiter } from "./middlewares/rateLimiter.js";
import { notFoundHandler, errorHandler } from "./middlewares/errorHandler.js";

import logger from "./utils/logger.js";

// Swagger docs
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.config.js";

dotenv.config();

const app = express();

// Security headers (must be first)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Required for Swagger UI
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://lh3.googleusercontent.com"],
      connectSrc: ["'self'", process.env.CLIENT_URL_1, process.env.CLIENT_URL_2, process.env.MICROSERVICE_URL].filter(Boolean),
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    }
  }
}));

// Global request timeout — abort requests taking > 30 seconds
app.use(timeout("30s"));
app.use((req, res, next) => {
  if (!req.timedout) next();
});

// Gzip compression — reduces JSON payload sizes by 60-80%
app.use(compression());

app.use(cors({
  origin: [process.env.CLIENT_URL_1, process.env.CLIENT_URL_2],
  credentials: true
}));

app.use(express.json({ limit: '2mb' }));

app.use(cookieParser());

// Apply global rate limiter to ALL routes
app.use(defaultRateLimiter);


// API Documentation - available at /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Resonate API Docs"
}));

// Health check endpoints
app.get("/", (req, res) => {
  res.send("Resonate API is running...");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Auth, diagnostics, and food upload routes — stricter rate limiting (30 req/min)
// Auth, diagnostics, and food upload routes — stricter rate limiting (30 req/min)
app.use("/api/auth", strictRateLimiter, authRoutes);
app.use("/api/diagnostics", strictRateLimiter, diagnosticsRoutes);
app.use("/api/food", strictRateLimiter, foodRoutes);

// Standard routes
app.use("/api/user", userRoutes);
app.use("/api/fit", fitRoutes);
app.use("/api/water", waterRoutes);
app.use("/api/coach", coachRoutes);
app.use("/api/workout", workoutRoutes);
app.use("/api/nutrition", nutritionRoutes);
app.use("/api/interventions", interventionRoutes);
app.use("/api/daily-logs", dailyLogRoutes);
app.use("/api/admin/memory", adminRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/dashboard", dashboardRoutes);



// Catch-all for undefined routes — must come after all route registrations
app.use(notFoundHandler);

// Centralized error handler — must be last middleware
app.use(errorHandler);

logger.info("App", "Express app initialized");

export default app;
