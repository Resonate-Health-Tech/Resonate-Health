import React, { useState, useEffect } from "react";
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import BiomarkerRing from "../components/BiomarkerRing";

export default function BiomarkerHistoryDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const analysis = location.state?.analysis;
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  if (!analysis) {
    return <Navigate to="/biomarkers/history" replace />;
  }


  const biomarkersByCategory = analysis.biomarkersByCategory || {};


  useEffect(() => {
    if (Object.keys(biomarkersByCategory).length > 0 && !selectedCategory) {
      setSelectedCategory(Object.keys(biomarkersByCategory)[0]);
    }
  }, [biomarkersByCategory, selectedCategory]);


  const biomarkersArr = Object.entries(analysis.biomarkers || {}).map(
    ([name, info]) => ({
      name,
      value: info?.value,
      status: info?.status,
      unit: info?.unit || "",
      category: info?.category || null,
      categoryLabel: info?.categoryLabel || null,
      reason: info?.reason || null,
      isAvailable: info?.isAvailable !== false,
    })
  );

  const getOverallScore = () => {
    if (analysis.overallScore) return analysis.overallScore;
    if (biomarkersArr.length === 0) return null;


    const availableBiomarkers = biomarkersArr.filter(b => b.isAvailable !== false);
    if (availableBiomarkers.length === 0) return null;

    const goodCount = availableBiomarkers.filter(
      b => b.status?.toLowerCase() === 'good'
    ).length;
    return Math.round((goodCount / availableBiomarkers.length) * 100);
  };

  const getHealthInsights = () => {

    const total = biomarkersArr.length;

    const goodCount = biomarkersArr.filter(
      b => b.status?.toLowerCase() === 'good'
    ).length;
    const badCount = biomarkersArr.filter(
      b => b.status?.toLowerCase() === 'bad'
    ).length;

    return { goodCount, badCount, total };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: 'My Blood Report Analysis',
      text: `Health Score: ${overallScore}/100 | ${insights.goodCount} normal, ${insights.badCount} need attention`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Share cancelled
      }
    } else {
      setShowShareModal(true);
    }
  };

  const overallScore = getOverallScore();
  const insights = getHealthInsights();

  return (
    <div className="min-h-screen pb-24" style={{ background: "linear-gradient(135deg, #EEF5E0 0%, #EAF0F8 45%, #F3EEF5 100%)" }}>


      <section className="px-5 pt-6 pb-4 sticky top-0 backdrop-blur-lg z-10" style={{ background: "rgba(238,245,224,0.85)", borderBottom: "1px solid rgba(26,26,24,0.08)" }}>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 active:scale-95 transition-all"
            style={{ color: "rgba(26,26,24,0.50)" }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Back</span>
          </button>


          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center active:scale-95 transition-all"
              style={{ background: "rgba(255,255,255,0.70)", border: "1px solid rgba(26,26,24,0.10)" }}
            >
              <svg className="w-5 h-5" style={{ color: "rgba(26,26,24,0.60)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-black mb-1" style={{ color: "#1A1A18" }}>
            Analysis Report
          </h1>
          <p className="text-sm flex items-center gap-1.5" style={{ color: "rgba(26,26,24,0.50)" }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(analysis.updatedAt)}
          </p>
        </div>
      </section>


      {overallScore !== null && (
        <section className="px-5 py-6">
          <div className="glass-card rounded-3xl p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1">
                <p className="text-sm font-semibold mb-2" style={{ color: "rgba(26,26,24,0.55)" }}>Overall Health Score</p>
                <h2 className="text-5xl font-black mb-1" style={{ color: "#1A1A18" }}>
                  {overallScore}
                  <span className="text-xl font-normal ml-2" style={{ color: "rgba(26,26,24,0.35)" }}>/100</span>
                </h2>
                <p className="text-sm font-semibold" style={{ color: overallScore >= 70 ? '#5A6000' : overallScore >= 40 ? '#B45309' : '#DC2626' }}>
                  {overallScore >= 70 ? 'Excellent Health' :
                    overallScore >= 40 ? 'Needs Attention' : 'Consult Doctor'}
                </p>
              </div>


              <div className="relative w-28 h-28">
                <svg className="w-28 h-28 transform -rotate-90">
                  <circle cx="56" cy="56" r="48" strokeWidth="8" fill="transparent" stroke="rgba(26,26,24,0.08)" />
                  <circle
                    cx="56" cy="56" r="48"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 48}`}
                    strokeDashoffset={`${2 * Math.PI * 48 * (1 - overallScore / 100)}`}
                    stroke={overallScore >= 70 ? '#CADB00' : overallScore >= 40 ? '#F5A524' : '#EF4444'}
                    className="transition-all duration-1000"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-black" style={{ color: "#1A1A18" }}>{overallScore}%</span>
                </div>
              </div>
            </div>


            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl p-3 text-center" style={{ background: "rgba(26,26,24,0.04)" }}>
                <p className="text-2xl font-black" style={{ color: "#1A1A18" }}>{insights.total}</p>
                <p className="text-xs mt-1" style={{ color: "rgba(26,26,24,0.45)" }}>Total</p>
              </div>
              <div className="rounded-2xl p-3 text-center" style={{ background: "rgba(202,219,0,0.08)", border: "1px solid rgba(202,219,0,0.20)" }}>
                <p className="text-2xl font-black" style={{ color: "#5A6000" }}>{insights.goodCount}</p>
                <p className="text-xs mt-1" style={{ color: "rgba(26,26,24,0.45)" }}>Normal</p>
              </div>
              <div className="rounded-2xl p-3 text-center" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.20)" }}>
                <p className="text-2xl font-black" style={{ color: "#DC2626" }}>{insights.badCount}</p>
                <p className="text-xs mt-1" style={{ color: "rgba(26,26,24,0.45)" }}>Alert</p>
              </div>
            </div>
          </div>
        </section>
      )}


      {insights.badCount > 0 && (
        <section className="px-5 mb-6">
          <div className="glass-card rounded-2xl p-4 flex items-start gap-3 animate-fadeIn"
            style={{ animationDelay: '0.1s' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(245,165,36,0.10)" }}>
              <svg className="w-5 h-5" style={{ color: "#B45309" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold mb-1" style={{ color: "#B45309" }}>
                {insights.badCount} {insights.badCount === 1 ? 'biomarker needs' : 'biomarkers need'} attention
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(26,26,24,0.55)" }}>
                Consider consulting with your healthcare provider for personalized advice on improving these markers.
              </p>
            </div>
          </div>
        </section>
      )}


      <section className="px-5 mb-6">
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-bold" style={{ color: "#1A1A18" }}>Biomarker Results</h3>
              <p className="text-xs mt-1" style={{ color: "rgba(26,26,24,0.45)" }}>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: "#CADB00" }}></span>
                  Good
                </span>
                <span className="mx-2">•</span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-400"></span>
                  Needs attention
                </span>
                <span className="mx-2">•</span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: "rgba(26,26,24,0.20)" }}></span>
                  Unavailable
                </span>
              </p>
            </div>
          </div>


          {Object.keys(biomarkersByCategory).length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

              <div className="lg:col-span-1">
                <div className="rounded-2xl p-4" style={{ background: "rgba(26,26,24,0.03)", border: "1px solid rgba(26,26,24,0.06)" }}>
                  <h4 className="text-sm font-bold uppercase tracking-wider mb-3 px-2" style={{ color: "rgba(26,26,24,0.35)" }}>
                    Categories
                  </h4>
                  <div className="space-y-2">
                    {Object.keys(biomarkersByCategory).map((categoryLabel) => {
                      const categoryBiomarkers = biomarkersByCategory[categoryLabel] || {};
                      const categoryCount = Object.keys(categoryBiomarkers).length;
                      const isSelected = selectedCategory === categoryLabel;

                      return (
                        <button
                          key={categoryLabel}
                          onClick={() => setSelectedCategory(categoryLabel)}
                          className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                          style={isSelected
                            ? { background: "#CADB00", color: "#1A1A18", boxShadow: "0 2px 8px rgba(202,219,0,0.25)" }
                            : { background: "rgba(26,26,24,0.04)", color: "rgba(26,26,24,0.50)", border: "1px solid rgba(26,26,24,0.08)" }
                          }
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate">{categoryLabel || 'Other'}</span>
                            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0"
                              style={isSelected ? { background: "rgba(26,26,24,0.15)", color: "#1A1A18" } : { background: "rgba(26,26,24,0.08)", color: "rgba(26,26,24,0.45)" }}>
                              {categoryCount}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>


              <div className="lg:col-span-3">
                {selectedCategory && biomarkersByCategory[selectedCategory] ? (
                  <>
                    <div className="mb-4">
                      <h4 className="text-xl font-bold mb-1" style={{ color: "#1A1A18" }}>
                        {selectedCategory || 'Other'}
                      </h4>
                      <p className="text-sm" style={{ color: "rgba(26,26,24,0.45)" }}>
                        {Object.keys(biomarkersByCategory[selectedCategory] || {}).length} biomarkers
                      </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {Object.entries(biomarkersByCategory[selectedCategory] || {}).map(([name, info]) => (
                        <BiomarkerRing
                          key={name}
                          name={name}
                          value={info?.value}
                          status={info?.status}
                          unit={info?.unit || ""}
                          normalRange={info?.normalRange || ""}
                          reason={info?.reason || ""}
                          isAvailable={info?.isAvailable !== false}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-sm text-slate-400">Select a category to view biomarkers</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {biomarkersArr.map((b, idx) => (
                <BiomarkerRing
                  key={idx}
                  name={b.name}
                  value={b.value}
                  status={b.status}
                  unit={b.unit}
                  normalRange={b.normalRange}
                  reason={b.reason}
                  isAvailable={b.isAvailable}
                />
              ))}
            </div>
          )}
        </div>
      </section>


      {insights.badCount > 0 && (
        <section className="px-5 mb-6">
          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-4" style={{ color: "#1A1A18" }}>Priority Markers</h3>
            <div className="space-y-3">
              {biomarkersArr
                .filter(b => b.isAvailable !== false && b.status?.toLowerCase() === 'bad')
                .map((b, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-2xl animate-fadeIn"
                    style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", animationDelay: `${idx * 0.05}s` }}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(239,68,68,0.08)" }}>
                        <span className="text-lg">⚠️</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: "#1A1A18" }}>{b.name}</p>
                        <p className="text-xs" style={{ color: "rgba(26,26,24,0.50)" }}>
                          Current: {b.value} {b.unit}
                          {b.normalRange && ` • Normal: ${b.normalRange}`}
                          {b.reason && ` • ${b.reason}`}
                        </p>
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(239,68,68,0.08)", color: "#DC2626", border: "1px solid rgba(239,68,68,0.20)" }}>
                      Alert
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}


      <section className="px-5 space-y-3">

        {analysis.pdfUrl && (
          <a
            href={analysis.pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-4 glass-card rounded-2xl active:scale-[0.98] transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(202,219,0,0.12)" }}>
                <svg className="w-5 h-5" style={{ color: "#5A6000" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#1A1A18" }}>View Original PDF</p>
                <p className="text-xs" style={{ color: "rgba(26,26,24,0.45)" }}>Open in new tab</p>
              </div>
            </div>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-all" style={{ color: "rgba(26,26,24,0.35)" }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        )}


        <button
          onClick={() => navigate('/biomarkers/history')}
          className="w-full flex items-center justify-between p-4 glass-card rounded-2xl active:scale-[0.98] transition-all duration-200 group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(202,219,0,0.10)" }}>
              <svg className="w-5 h-5" style={{ color: "#5A6000" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold" style={{ color: "#1A1A18" }}>View All Reports</p>
              <p className="text-xs" style={{ color: "rgba(26,26,24,0.45)" }}>Compare with past results</p>
            </div>
          </div>
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-all" style={{ color: "rgba(26,26,24,0.35)" }}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>


        <button
          onClick={() => navigate('/biomarkers/upload')}
          className="w-full flex items-center justify-between p-4 glass-card rounded-2xl active:scale-[0.98] transition-all duration-200 group"
          style={{ border: "1px solid rgba(202,219,0,0.25)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(202,219,0,0.15)" }}>
              <svg className="w-5 h-5" style={{ color: "#5A6000" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold" style={{ color: "#1A1A18" }}>Upload New Report</p>
              <p className="text-xs" style={{ color: "rgba(26,26,24,0.45)" }}>Track your progress</p>
            </div>
          </div>
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-all" style={{ color: "rgba(26,26,24,0.35)" }}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </section>


      {showShareModal && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-end sm:items-center 
                   justify-center p-0 sm:p-5 animate-fadeIn"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl 
                     w-full sm:max-w-md p-6 animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-slate-50 mb-4">Share Report</h3>
            <p className="text-sm text-slate-400 mb-4">
              Copy link to share this report with your healthcare provider
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={window.location.href}
                className="flex-1 px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 text-sm"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setShowShareModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-primary text-slate-950 font-semibold text-sm
                         hover:bg-emerald-500 active:scale-95 transition-all"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}


      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}


