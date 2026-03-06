import React, { useEffect, useState } from "react";
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import BiomarkerCard from "../components/BiomarkerCard";

export default function BiomarkerHistoryDetailPage() {
  const location = useLocation();
  const analysis = location.state?.analysis;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [biomarkers, setBiomarkers] = useState([]);
  const [biomarkersByCategory, setBiomarkersByCategory] = useState({});
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  if (!analysis) {
    return <Navigate to="/biomarkers/history" replace />;
  }

  const fetchLatest = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const latest = analysis;
      if (!latest || latest.status !== "completed") {
        setError("No completed analysis found yet.");
        setBiomarkers([]);
        setMeta(null);
        return;
      }

      const biomarkersData = latest.biomarkersByCategory || {};

      // Build biomarkers array from biomarkersByCategory so each biomarker
      // gets its correct category string. 
      const seen = new Set();
      const biomarkersArr = [];
      const biomarkersByCat = latest.biomarkersByCategory || {};
      const flatBiomarkers = latest.biomarkers || {};

      for (const [categoryName, markersInCat] of Object.entries(biomarkersByCat)) {
        if (!markersInCat || typeof markersInCat !== "object") continue;
        for (const [name, info] of Object.entries(markersInCat)) {
          if (seen.has(name)) continue;
          seen.add(name);
          biomarkersArr.push({
            name,
            value: info?.value,
            status: info?.status,
            unit: info?.unit || "",
            category: categoryName,
            categoryLabel: info?.categoryLabel || null,
            reason: info?.reason || null,
            isAvailable: info?.isAvailable !== false,
            normalRange: info?.normalRange || ""
          });
        }
      }

      for (const [name, info] of Object.entries(flatBiomarkers)) {
        if (seen.has(name)) continue;
        seen.add(name);
        biomarkersArr.push({
          name,
          value: info?.value,
          status: info?.status,
          unit: info?.unit || "",
          category: info?.category || "Other",
          categoryLabel: info?.categoryLabel || null,
          reason: info?.reason || null,
          isAvailable: info?.isAvailable !== false,
          normalRange: info?.normalRange || ""
        });
      }

      setBiomarkers(biomarkersArr);
      setBiomarkersByCategory(biomarkersData);
      setMeta({ updatedAt: latest.updatedAt, pdfUrl: latest.pdfUrl, overallScore: latest.overallScore });
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load analysis details.");
      setBiomarkers([]);
      setMeta(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchLatest(); }, [analysis]);

  const getOverallScore = () => {
    if (meta?.overallScore) return meta.overallScore;
    if (biomarkers.length === 0) return null;
    const available = biomarkers.filter(b => b.isAvailable !== false);
    if (available.length === 0) return null;
    const good = available.filter(b => b.status?.toLowerCase() === "good").length;
    return Math.round((good / available.length) * 100);
  };

  const insights = () => {
    const total = biomarkers.length;
    const goodCount = biomarkers.filter(b => b.status?.toLowerCase() === "good").length;
    const badCount = biomarkers.filter(b => b.status?.toLowerCase() === "bad").length;
    const unknownCount = total - goodCount - badCount;
    return { goodCount, badCount, unknownCount, total };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatToday = () => {
    const d = new Date();
    return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid rgba(202,219,0,0.20)", borderTopColor: "#CADB00", animation: "spin 0.8s linear infinite" }} />
        <p style={{ fontSize: 13, color: "rgba(26,26,24,0.45)", marginTop: 12, fontFamily: "'DM Sans',sans-serif" }}>Loading latest analysis…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const overallScore = getOverallScore() || 0;
  const stats = insights();

  // Stacked bar percentages
  const goodPct = stats.total > 0 ? (stats.goodCount / stats.total) * 100 : 0;
  const badPct = stats.total > 0 ? (stats.badCount / stats.total) * 100 : 0;
  const unknownPct = stats.total > 0 ? (stats.unknownCount / stats.total) * 100 : 0;

  // Filter categories — only show chips for categories that actually have biomarkers
  const categories = Object.keys(biomarkersByCategory).filter(c =>
    c && c !== "null" && biomarkersByCategory[c] && Object.keys(biomarkersByCategory[c]).length > 0
  );
  // Determine which biomarkers to show
  let displayedBiomarkers = biomarkers;
  if (selectedCategories.length > 0) {
    displayedBiomarkers = biomarkers.filter(b => {
      const cat = b.category || b.categoryLabel || "Other";
      return selectedCategories.includes(cat);
    });
  }

  const handleCategoryClick = (cat) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", paddingBottom: "40px" }}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-[32px] font-bold text-[#1A1A18] leading-tight flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md border border-black/10 flex items-center justify-center shadow-sm hover:bg-white transition"
              title="Go Back"
            >
              <svg width="20" height="20" fill="none" stroke="#1A1A18" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            Historical Analysis
          </h1>
          {meta?.pdfUrl && (
            <a
              href={meta.pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] hover:bg-gray-50 rounded-full text-sm font-semibold transition"
              style={{ color: "#1A1A18" }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              View PDF
            </a>
          )}
        </div>
        <p className="text-[#6B7280] text-[15px]">{meta?.updatedAt ? formatDate(meta.updatedAt) : formatToday()}</p>
      </div>

      {error && !loading && (
        <div className="glass-card" style={{ borderRadius: 24, padding: "40px 24px", textAlign: "center", marginBottom: "32px" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(26,26,24,0.06)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="24" height="24" fill="none" stroke="rgba(26,26,24,0.30)" strokeWidth="1.7" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1A1A18", marginBottom: 8 }}>No Analysis Found</h3>
          <p style={{ fontSize: 13, color: "rgba(26,26,24,0.55)", maxWidth: 320, margin: "0 auto 24px" }}>{error}</p>
          <button
            onClick={() => navigate('/biomarkers/upload')}
            className="bg-[#CADB00] text-[#1A1A18] font-bold py-3 px-6 rounded-xl border border-transparent hover:brightness-105"
          >
            Upload Blood Report
          </button>
        </div>
      )}

      {/* Hero Card */}
      {!error && (
        <div className="bg-[#151923] rounded-[24px] p-6 md:p-10 mb-8 flex flex-col md:flex-row gap-8 md:gap-16 shadow-lg border border-white/5 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-[#CADB00]/10 blur-[100px] pointer-events-none"></div>

          {/* Left Column */}
          <div className="flex-1 flex flex-col relative z-10">
            <h2 className="text-[#A1A1AA] text-xs font-bold tracking-widest uppercase mb-1">Latest Diagnostics Report</h2>
            <p className="text-[#CADB00] text-[15px] font-semibold mb-8">
              {meta?.updatedAt ? `Last updated ${formatDate(meta.updatedAt)}` : "Recently updated"}
            </p>

            <div className="flex flex-col items-center justify-center mb-6">
              {/* Score Ring */}
              <div className="relative w-[140px] h-[140px] flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90 absolute inset-0">
                  <circle cx="70" cy="70" r="62" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                  <circle cx="70" cy="70" r="62" fill="none" stroke="#CADB00" strokeWidth="12"
                    strokeDasharray={`${2 * Math.PI * 62}`}
                    strokeDashoffset={`${2 * Math.PI * 62 * (1 - overallScore / 100)}`}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1s ease-out", filter: "drop-shadow(0 0 12px rgba(202,219,0,0.5))" }}
                  />
                </svg>
                <div className="z-10 text-center">
                  <span className="text-[44px] font-bold text-white leading-none tracking-tight block">{overallScore}</span>
                </div>
              </div>
              <p className="text-[#A1A1AA] text-sm mt-4 font-semibold">Health Score</p>
            </div>

            {/* Badges */}
            <div className="flex justify-center gap-3">
              <span className="bg-[#8C5D30] text-white px-4 py-1.5 rounded-full text-xs font-bold">{stats.badCount} Flagged</span>
              <span className="bg-[#CADB00] text-[#1A1A18] px-4 py-1.5 rounded-full text-xs font-bold">{stats.goodCount} Optimal</span>
              <span className="bg-[#8B789C] text-white px-4 py-1.5 rounded-full text-xs font-bold">{stats.unknownCount} Unknown</span>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-[1.5] flex flex-col justify-center relative z-10">
            <h2 className="text-[#A1A1AA] text-xs font-bold tracking-widest uppercase mb-4">Biomarker Overview</h2>

            {/* Stacked Bar */}
            <div className="h-6 w-full rounded-md overflow-hidden flex mb-2 shadow-inner">
              {goodPct > 0 && <div className="h-full bg-[#CADB00] transition-all" style={{ width: `${goodPct}%` }}></div>}
              {badPct > 0 && <div className="h-full bg-[#8C5D30] transition-all" style={{ width: `${badPct}%` }}></div>}
              {unknownPct > 0 && <div className="h-full bg-[#8B789C] transition-all" style={{ width: `${unknownPct}%` }}></div>}
            </div>

            {/* Legends */}
            <div className="flex gap-16 mb-10">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#CADB00]"></div>
                <span className="text-white text-[13px] font-medium">{stats.goodCount} Optimal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#8C5D30]"></div>
                <span className="text-white text-[13px] font-medium">{stats.badCount} Flagged</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#8B789C]"></div>
                <span className="text-white text-[13px] font-medium">{stats.unknownCount} Unknown</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/biomarkers/history')}
                className="w-full bg-[#CADB00] hover:bg-[#D5E700] text-[#1A1A18] font-bold py-3.5 rounded-[16px] transition flex items-center justify-center gap-2"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                Back to History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Biomarker Section */}
      {!error && displayedBiomarkers.length > 0 && (
        <div>
          <h2 className="text-[22px] font-bold text-[#1A1A18] mb-4">Categories</h2>

          {/* Filter Chips */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-2 custom-scrollbar no-scrollbar items-center">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${selectedCategories.includes(cat)
                  ? "bg-[#CADB00] text-[#1A1A18] shadow-sm"
                  : "bg-[#F5F1EB] text-[#6B7280] hover:bg-[#EBE7E1]"
                  }`}
              >
                {cat}
              </button>
            ))}
            {selectedCategories.length > 0 && (
              <button
                onClick={() => setSelectedCategories([])}
                className="ml-2 px-3 py-1.5 rounded-full text-xs font-bold text-red-500 hover:bg-red-50 transition"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {displayedBiomarkers.map((b, idx) => (
              <BiomarkerCard
                key={idx}
                name={b.name}
                value={b.value}
                status={b.status}
                unit={b.unit}
                category={b.category || b.categoryLabel || "Other"}
                normalRange={b.normalRange}
                reason={b.reason}
                isAvailable={b.isAvailable}
              />
            ))}
          </div>
        </div>
      )}

      {/* Action links omitted here, kept it clean like the screenshot. 
          If they want History, we can add it to the Sidebar later. */}

      <style>{`
         @keyframes spin { to { transform: rotate(360deg); } }
         .no-scrollbar::-webkit-scrollbar { display: none; }
         .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
