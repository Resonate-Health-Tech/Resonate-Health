import React, { useEffect, useState, useRef } from "react";
import { getWithCookie } from "../api";
import { useNavigate } from "react-router-dom";

export default function BiomarkerHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const scrollRef = useRef(null);
  const touchStartY = useRef(0);

  const navigate = useNavigate();

  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchHistory = async (isRefresh = false, cat = categoryFilter) => {
    if (isRefresh) setRefreshing(true);

    try {
      const query = cat !== 'all' ? `?category=${cat}` : '';
      const data = await getWithCookie(`/api/diagnostics/history${query}`);
      setHistory(data || []);
      setFilteredHistory(data || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load history.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory(false, categoryFilter);
  }, [categoryFilter]);


  useEffect(() => {
    let filtered = [...history];


    if (filter !== 'all') {
      filtered = filtered.filter(item =>
        filter === 'completed'
          ? item.status === 'completed' || item.status === 'analyzed'
          : item.status === 'pending' || item.status === 'processing'
      );
    }


    filtered.sort((a, b) => {
      const dateA = new Date(a.updatedAt);
      const dateB = new Date(b.updatedAt);
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredHistory(filtered);
  }, [filter, sortBy, history]);


  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (scrollRef.current && scrollRef.current.scrollTop === 0) {
      const touchY = e.touches[0].clientY;
      const pullDistance = touchY - touchStartY.current;
      if (pullDistance > 100 && !refreshing) {
        fetchHistory(true);
      }
    }
  };

  const openAnalysis = (analysis) => {
    navigate(`/biomarkers/history/${analysis._id}`, {
      state: { analysis }
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      completed: {
        color: 'emerald',
        icon: '✓',
        label: 'Completed',
        gradient: 'from-emerald-500/10 to-emerald-600/5'
      },
      analyzed: {
        color: 'primary',
        icon: '✓',
        label: 'Analyzed',
        gradient: 'from-primary/10 to-emerald-500/5'
      },
      pending: {
        color: 'amber',
        icon: '⏳',
        label: 'Pending',
        gradient: 'from-amber-500/10 to-amber-600/5'
      },
      processing: {
        color: 'blue',
        icon: '⚙️',
        label: 'Processing',
        gradient: 'from-blue-500/10 to-blue-600/5'
      },
      error: {
        color: 'red',
        icon: '⚠️',
        label: 'Error',
        gradient: 'from-red-500/10 to-red-600/5'
      }
    };
    return configs[status] || configs.pending;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-5" style={{ background: "linear-gradient(135deg, #EEF5E0 0%, #EAF0F8 45%, #F3EEF5 100%)" }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(202,219,0,0.15)" }}>
          <svg className="w-8 h-8 animate-pulse" style={{ color: "#5A6000" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-sm" style={{ color: "rgba(26,26,24,0.50)" }}>Loading your reports...</p>
        <div className="mt-4 flex gap-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full animate-bounce"
              style={{ background: "#CADB00", animationDelay: `${i * 0.15}s` }}
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      className="min-h-screen pb-24"
      style={{ background: "linear-gradient(135deg, #EEF5E0 0%, #EAF0F8 45%, #F3EEF5 100%)" }}
    >


      {refreshing && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 backdrop-blur-sm
                      rounded-full px-4 py-2 flex items-center gap-2 shadow-lg"
          style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(26,26,24,0.10)" }}>
          <svg className="animate-spin h-4 w-4" style={{ color: "#CADB00" }} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm font-medium" style={{ color: "#1A1A18" }}>Refreshing...</span>
        </div>
      )}


      <section className="px-5 pt-6 pb-4">
        <div className="mb-6">
          <h1 className="text-3xl font-black mb-1" style={{ color: "#1A1A18" }}>
            Blood Reports
          </h1>
          <p className="text-sm" style={{ color: "rgba(26,26,24,0.50)" }}>
            Track your biomarker analysis history
          </p>
        </div>


        {!error && history.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="glass-card rounded-2xl p-4 text-center">
              <p className="text-2xl font-black" style={{ color: "#1A1A18" }}>{history.length}</p>
              <p className="text-xs mt-1" style={{ color: "rgba(26,26,24,0.45)" }}>Total</p>
            </div>
            <div className="glass-card rounded-2xl p-4 text-center" style={{ border: "1px solid rgba(202,219,0,0.25)" }}>
              <p className="text-2xl font-black" style={{ color: "#5A6000" }}>
                {history.filter(h => h.status === 'completed' || h.status === 'analyzed').length}
              </p>
              <p className="text-xs mt-1" style={{ color: "rgba(26,26,24,0.45)" }}>Completed</p>
            </div>
            <div className="glass-card rounded-2xl p-4 text-center" style={{ border: "1px solid rgba(245,165,36,0.25)" }}>
              <p className="text-2xl font-black" style={{ color: "#B45309" }}>
                {history.filter(h => h.status === 'pending' || h.status === 'processing').length}
              </p>
              <p className="text-xs mt-1" style={{ color: "rgba(26,26,24,0.45)" }}>Pending</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-2">
          {['all', 'blood', 'urine', 'bca', 'cgm', 'other'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border"
              style={categoryFilter === cat
                ? { background: "#CADB00", color: "#1A1A18", borderColor: "#CADB00", boxShadow: "0 2px 8px rgba(202,219,0,0.25)" }
                : { background: "rgba(26,26,24,0.05)", color: "rgba(26,26,24,0.50)", borderColor: "rgba(26,26,24,0.10)" }
              }
            >
              {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>


        {!error && history.length > 0 && (
          <div className="space-y-3">

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setFilter('all')}
                className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                style={filter === 'all'
                  ? { background: "#CADB00", color: "#1A1A18", boxShadow: "0 2px 8px rgba(202,219,0,0.25)" }
                  : { background: "rgba(26,26,24,0.05)", color: "rgba(26,26,24,0.50)", border: "1px solid rgba(26,26,24,0.10)" }
                }
              >
                All Reports
              </button>
              <button
                onClick={() => setFilter('completed')}
                className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                style={filter === 'completed'
                  ? { background: "#CADB00", color: "#1A1A18", boxShadow: "0 2px 8px rgba(202,219,0,0.25)" }
                  : { background: "rgba(26,26,24,0.05)", color: "rgba(26,26,24,0.50)", border: "1px solid rgba(26,26,24,0.10)" }
                }
              >
                Completed
              </button>
              <button
                onClick={() => setFilter('pending')}
                className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                style={filter === 'pending'
                  ? { background: "#F5A524", color: "#1A1A18", boxShadow: "0 2px 8px rgba(245,165,36,0.25)" }
                  : { background: "rgba(26,26,24,0.05)", color: "rgba(26,26,24,0.50)", border: "1px solid rgba(26,26,24,0.10)" }
                }
              >
                Pending
              </button>
            </div>


            <div className="flex items-center justify-between">
              <p className="text-xs font-medium" style={{ color: "rgba(26,26,24,0.45)" }}>
                {filteredHistory.length} {filteredHistory.length === 1 ? 'report' : 'reports'}
              </p>
              <button
                onClick={() => setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold active:scale-95 transition-all"
                style={{ background: "rgba(26,26,24,0.06)", color: "rgba(26,26,24,0.55)", border: "1px solid rgba(26,26,24,0.10)" }}
              >
                <svg className={`w-3.5 h-3.5 transition-transform ${sortBy === 'oldest' ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                {sortBy === 'newest' ? 'Newest First' : 'Oldest First'}
              </button>
            </div>
          </div>
        )}
      </section>


      {error && (
        <section className="px-5">
          <div className="glass-card rounded-3xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.08)" }}>
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: "#1A1A18" }}>Failed to Load Reports</h3>
            <p className="text-sm mb-6" style={{ color: "rgba(26,26,24,0.50)" }}>{error}</p>
            <button
              onClick={() => fetchHistory(true)}
              className="px-6 py-3 rounded-2xl font-semibold active:scale-95 transition-all"
              style={{ background: "rgba(26,26,24,0.06)", color: "rgba(26,26,24,0.70)", border: "1px solid rgba(26,26,24,0.10)" }}
            >
              Try Again
            </button>
          </div>
        </section>
      )}


      {!error && history.length === 0 && (
        <section className="px-5">
          <div className="glass-card rounded-3xl p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: "rgba(26,26,24,0.05)" }}>
              <svg className="w-10 h-10" style={{ color: "rgba(26,26,24,0.20)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: "#1A1A18" }}>No Reports Yet</h3>
            <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: "rgba(26,26,24,0.50)" }}>
              Upload your first blood report to get AI-powered health insights and biomarker analysis.
            </p>
            <button
              onClick={() => navigate('/biomarkers/upload')}
              className="px-6 py-3 rounded-2xl font-bold active:scale-95 transition-all duration-200"
              style={{ background: "linear-gradient(135deg, #CADB00 0%, #B8C900 100%)", color: "#1A1A18", boxShadow: "0 4px 16px rgba(202,219,0,0.25)" }}
            >
              Upload Blood Report
            </button>
          </div>
        </section>
      )}


      {!error && filteredHistory.length > 0 && (
        <section className="px-5">
          <div className="space-y-3">
            {filteredHistory.map((item, index) => {
              const statusConfig = getStatusConfig(item.status);

              return (
                <div
                  key={item._id}
                  className="glass-card rounded-2xl p-5 cursor-pointer hover:shadow-md active:scale-[0.98] transition-all duration-200 animate-fadeIn"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => openAnalysis(item)}
                >
                  <div className="flex items-start gap-4">

                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: item.status === 'completed' || item.status === 'analyzed' ? 'rgba(202,219,0,0.12)' : item.status === 'error' ? 'rgba(239,68,68,0.08)' : 'rgba(245,165,36,0.10)', border: item.status === 'completed' || item.status === 'analyzed' ? '1px solid rgba(202,219,0,0.25)' : '1px solid rgba(245,165,36,0.20)' }}>
                      <span className="text-xl">{statusConfig.icon}</span>
                    </div>


                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <h3 className="text-base font-bold mb-1" style={{ color: "#1A1A18" }}>
                            Blood Report Analysis
                          </h3>
                          <p className="text-sm" style={{ color: "rgba(26,26,24,0.50)" }}>
                            {formatDate(item.updatedAt)}
                          </p>
                        </div>


                        <span className="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={item.status === 'completed' || item.status === 'analyzed'
                            ? { background: "rgba(202,219,0,0.15)", color: "#5A6000", border: "1px solid rgba(202,219,0,0.25)" }
                            : item.status === 'error'
                              ? { background: "rgba(239,68,68,0.08)", color: "#DC2626", border: "1px solid rgba(239,68,68,0.20)" }
                              : { background: "rgba(245,165,36,0.10)", color: "#B45309", border: "1px solid rgba(245,165,36,0.20)" }
                          }>
                          {statusConfig.label}
                        </span>
                      </div>


                      {item.biomarkers && Object.keys(item.biomarkers).length > 0 && (
                        <div className="flex items-center gap-3 mb-3 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span>{Object.keys(item.biomarkers).length} biomarkers</span>
                          </div>
                          {(() => {

                            const biomarkers = Object.values(item.biomarkers || {});
                            const availableBiomarkers = biomarkers.filter(b => b?.isAvailable !== false);
                            if (availableBiomarkers.length > 0) {
                              const goodCount = availableBiomarkers.filter(b => b?.status?.toLowerCase() === 'good').length;
                              const calculatedScore = Math.round((goodCount / availableBiomarkers.length) * 100);
                              return (
                                <div className="flex items-center gap-1">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                  </svg>
                                  <span>Score: {calculatedScore}/100</span>
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      )}


                      <button
                        className="flex items-center gap-1.5 text-sm font-semibold transition-colors group"
                        style={{ color: "#CADB00" }}
                      >
                        View Full Analysis
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                          fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}


      <button
        onClick={() => navigate('/biomarkers/upload')}
        className="fixed bottom-20 right-5 w-14 h-14 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 z-40"
        style={{ background: "linear-gradient(135deg, #CADB00 0%, #B8C900 100%)", color: "#1A1A18", boxShadow: "0 4px 24px rgba(202,219,0,0.35)" }}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>


      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
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

