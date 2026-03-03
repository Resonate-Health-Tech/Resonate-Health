import React, { createContext, lazy, Suspense, useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";

import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

// ── Lazy page imports ──
const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const NewDashboardPage = lazy(() => import("./pages/NewDashboardPage"));
const FitnessDashboardPage = lazy(() => import("./pages/FitnessDashboardPage"));
const BiomarkerFetchFromApiPage = lazy(() => import("./pages/BiomarkerFetchFromApiPage"));
const BiomarkerUploadPage = lazy(() => import("./pages/BiomarkerUploadPage"));
const LatestAnalysisPage = lazy(() => import("./pages/LatestAnalysisPage"));
const BiomarkerHistoryPage = lazy(() => import("./pages/BiomarkerHistoryPage"));
const BiomarkerHistoryDetailPage = lazy(() => import("./pages/BiomarkerHistoryDetailPage"));
const DemoReportPage = lazy(() => import("./pages/DemoReportPage"));
const GetACoachPage = lazy(() => import("./pages/GetACoachPage"));
const NutritionPage = lazy(() => import("./pages/NutritionPage"));
const MealHistoryPage = lazy(() => import("./pages/MealHistoryPage"));
const InterventionsPage = lazy(() => import("./pages/InterventionsPage"));
const InterventionSuggestions = lazy(() => import("./pages/InterventionSuggestions"));
const AdminMemoryDashboard = lazy(() => import("./pages/AdminMemoryDashboard"));
const MemoriesPage = lazy(() => import("./pages/MemoriesPage"));
const InsightsPage = lazy(() => import("./pages/InsightsPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage")); // profile/settings

export const AuthContext = createContext(null);

function PageLoader() {
  return (
    <div
      className="flex items-center justify-center"
      style={{ minHeight: "100vh", background: "linear-gradient(135deg, #EEF5E0 0%, #EAF0F8 45%, #F3EEF5 100%)" }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        {/* Lime spinner */}
        <div
          style={{
            width: 40, height: 40,
            borderRadius: "50%",
            border: "3px solid rgba(202,219,0,0.20)",
            borderTopColor: "#CADB00",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ fontSize: 13, color: "rgba(26,26,24,0.45)", fontFamily: "'DM Sans', sans-serif" }}>
          Loading…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

/** Wraps a page with AppLayout (sidebar + topbar) */
function WithLayout({ children }) {
  return <AppLayout>{children}</AppLayout>;
}

function AppWrapper() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const navigate = useNavigate();

  // Warm up backends
  useEffect(() => {
    const BACKEND_URL = import.meta.env.VITE_API_BASE_URL;
    const MICROSERVICE_URL = import.meta.env.VITE_API_MICROSERVICE_URL;
    if (BACKEND_URL) fetch(`${BACKEND_URL}/health`).catch(() => { });
    if (MICROSERVICE_URL) fetch(`${MICROSERVICE_URL}/`).catch(() => { });
  }, []);

  // Firebase auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoadingAuth(false);
      if (firebaseUser) {
        // Seed profile immediately from Firebase so name shows before backend responds
        if (firebaseUser.displayName) {
          setProfile(prev => prev || { name: firebaseUser.displayName });
        }
        // Fetch backend profile to get full data (name, dob, etc.)
        const BASE_URL = import.meta.env.VITE_API_BASE_URL;
        fetch(`${BASE_URL}/api/user/profile`, { credentials: "include" })
          .then((res) => res.ok ? res.json() : null)
          .then((data) => { if (data?.user) setProfile(data.user); })
          .catch(() => { });
      } else {
        setProfile(null);
      }
    });
    return () => unsub();
  }, []);

  if (loadingAuth) return null;

  return (
    <AuthContext.Provider value={{ user, profile }}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Public & Auth pages (no sidebar) ── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/demo-report" element={<DemoReportPage />} />
          <Route path="/get-coach" element={<GetACoachPage />} />

          {/* ── Authenticated pages (sidebar + topbar via AppLayout) ── */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <WithLayout><NewDashboardPage /></WithLayout>
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <WithLayout><DashboardPage /></WithLayout>
            </ProtectedRoute>
          } />

          <Route path="/fitness" element={
            <ProtectedRoute>
              <WithLayout><FitnessDashboardPage /></WithLayout>
            </ProtectedRoute>
          } />

          <Route path="/nutrition" element={
            <ProtectedRoute>
              <WithLayout><NutritionPage /></WithLayout>
            </ProtectedRoute>
          } />

          <Route path="/diagnostics" element={
            <ProtectedRoute>
              <WithLayout><LatestAnalysisPage /></WithLayout>
            </ProtectedRoute>
          } />

          <Route path="/interventions" element={
            <ProtectedRoute>
              <WithLayout><InterventionsPage /></WithLayout>
            </ProtectedRoute>
          } />

          <Route path="/memories" element={
            <ProtectedRoute>
              <WithLayout><MemoriesPage /></WithLayout>
            </ProtectedRoute>
          } />

          <Route path="/insights" element={
            <ProtectedRoute>
              <WithLayout><InsightsPage /></WithLayout>
            </ProtectedRoute>
          } />

          {/* ── Sub-routes still accessible ── */}
          <Route path="/interventions/suggest" element={
            <ProtectedRoute>
              <WithLayout><InterventionSuggestions /></WithLayout>
            </ProtectedRoute>
          } />

          <Route path="/meal-history" element={
            <ProtectedRoute>
              <WithLayout><MealHistoryPage /></WithLayout>
            </ProtectedRoute>
          } />

          <Route path="/admin/memory" element={
            <ProtectedRoute>
              <WithLayout><AdminMemoryDashboard /></WithLayout>
            </ProtectedRoute>
          } />

          <Route path="/biomarkers/upload" element={
            <ProtectedRoute>
              <WithLayout><BiomarkerUploadPage /></WithLayout>
            </ProtectedRoute>
          } />

          <Route path="/biomarkers/api" element={
            <ProtectedRoute>
              <WithLayout><BiomarkerFetchFromApiPage /></WithLayout>
            </ProtectedRoute>
          } />

          <Route path="/biomarkers/latest" element={
            <ProtectedRoute>
              <WithLayout><LatestAnalysisPage /></WithLayout>
            </ProtectedRoute>
          } />

          <Route path="/biomarkers/history" element={
            <ProtectedRoute>
              <WithLayout><BiomarkerHistoryPage /></WithLayout>
            </ProtectedRoute>
          } />

          <Route path="/biomarkers/history/:id" element={
            <ProtectedRoute>
              <WithLayout><BiomarkerHistoryDetailPage /></WithLayout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </AuthContext.Provider>
  );
}

export default AppWrapper;
