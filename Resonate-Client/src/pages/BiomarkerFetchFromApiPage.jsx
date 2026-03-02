import React, { useState, useEffect } from "react";
import { postWithCookie, getWithCookie } from "../api";
import BiomarkerRing from "../components/BiomarkerRing";
import { useNavigate } from "react-router-dom";

export default function BiomarkerFetchFromApiPage() {
  const [loading, setLoading] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);
  const [biomarkers, setBiomarkers] = useState([]);
  const [error, setError] = useState("");
  const [connectedLabs, setConnectedLabs] = useState([]);
  const [selectedLab, setSelectedLab] = useState("");
  const navigate = useNavigate();

  const supportedLabs = [
    {
      id: "thyrocare",
      name: "Thyrocare",
      logo: "🧪",
      description: "India's leading diagnostic chain",
      features: ["Fast results", "Pan-India coverage"]
    },
    {
      id: "metropolis",
      name: "Metropolis",
      logo: "🔬",
      description: "Premium diagnostic services",
      features: ["Advanced tests", "Home collection"]
    },
    {
      id: "srl",
      name: "SRL Diagnostics",
      logo: "⚕️",
      description: "Trusted pathology labs",
      features: ["ISO certified", "Quick reports"]
    },
    {
      id: "redcliffe",
      name: "Redcliffe Labs",
      logo: "🩺",
      description: "Affordable health checkups",
      features: ["Budget-friendly", "Online reports"]
    }
  ];

  useEffect(() => {
    checkLabConnection();
  }, []);

  const checkLabConnection = async () => {
    try {
      setTimeout(() => {
        setConnectedLabs(["thyrocare"]);
        setSelectedLab("thyrocare");
        setCheckingConnection(false);
      }, 1000);
    } catch (err) {
      console.error(err);
      setCheckingConnection(false);
    }
  };

  const handleFetch = async () => {
    if (!selectedLab) {
      setError("Please select a lab to fetch data from");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await postWithCookie("/api/diagnostics/fetch-from-api", {
        labId: selectedLab
      });

      const biomarkersArr = Object.entries(
        data.diagnostics.biomarkers || {}
      ).map(([name, info]) => ({
        name,
        value: info.value,
        status: info.status,
        unit: info.unit || "",
        normalRange: info.normalRange || "",
      }));

      setBiomarkers(biomarkersArr);

      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 300);

    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch data from lab. Please try again or check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const getOverallScore = () => {
    if (biomarkers.length === 0) return null;
    const goodCount = biomarkers.filter(
      b => b.status?.toLowerCase() === 'good' || b.status?.toLowerCase() === 'normal'
    ).length;
    return Math.round((goodCount / biomarkers.length) * 100);
  };

  const overallScore = getOverallScore();

  if (checkingConnection) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-5" style={{ background: "linear-gradient(135deg, #EEF5E0 0%, #EAF0F8 45%, #F3EEF5 100%)" }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 animate-pulse" style={{ background: "rgba(202,219,0,0.15)" }}>
          <svg className="w-8 h-8" style={{ color: "#5A6000" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <p className="text-sm" style={{ color: "rgba(26,26,24,0.50)" }}>Checking lab connections...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: "linear-gradient(135deg, #EEF5E0 0%, #EAF0F8 45%, #F3EEF5 100%)" }}>


      <section className="px-5 pt-6 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-4 active:scale-95 transition-all"
          style={{ color: "rgba(26,26,24,0.45)" }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Back</span>
        </button>

        <h1 className="text-3xl font-black mb-1" style={{ color: "#1A1A18" }}>
          Lab Integration
        </h1>
        <p className="text-sm" style={{ color: "rgba(26,26,24,0.50)" }}>
          Fetch blood reports directly from diagnostic labs
        </p>
      </section>


      <section className="px-5 mb-6">
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="text-xs font-semibold text-primary mb-1">No PDF Upload Needed</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect your diagnostic lab account to automatically fetch test results.
                Your data is encrypted and secure.
              </p>
            </div>
          </div>
        </div>
      </section>


      <section className="px-5 mb-6">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6">
          <h2 className="text-lg font-bold text-slate-50 mb-4">Select Your Lab</h2>

          <div className="space-y-3 mb-6">
            {supportedLabs.map((lab) => {
              const isConnected = connectedLabs.includes(lab.id);
              const isSelected = selectedLab === lab.id;

              return (
                <button
                  key={lab.id}
                  onClick={() => setSelectedLab(lab.id)}
                  disabled={!isConnected}
                  className="w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.98]"
                  style={isSelected
                    ? { borderColor: "#CADB00", background: "rgba(202,219,0,0.06)" }
                    : isConnected
                      ? { borderColor: "rgba(26,26,24,0.12)", background: "rgba(255,255,255,0.60)" }
                      : { borderColor: "rgba(26,26,24,0.06)", background: "rgba(26,26,24,0.03)", opacity: 0.5, cursor: "not-allowed" }
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">

                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={isSelected ? { background: "rgba(202,219,0,0.15)" } : { background: "rgba(26,26,24,0.05)" }}>
                        {lab.logo}
                      </div>


                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-bold" style={{ color: "#1A1A18" }}>{lab.name}</h3>
                          {isConnected && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                              style={{ background: "rgba(202,219,0,0.15)", color: "#5A6000", border: "1px solid rgba(202,219,0,0.25)" }}>
                              Connected
                            </span>
                          )}
                        </div>
                        <p className="text-xs mb-2" style={{ color: "rgba(26,26,24,0.50)" }}>{lab.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {lab.features.map((feature, idx) => (
                            <span key={idx} className="text-xs flex items-center gap-1" style={{ color: "rgba(26,26,24,0.50)" }}>
                              <svg className="w-3 h-3" style={{ color: "#CADB00" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>


                    <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={isSelected
                        ? { borderColor: "#CADB00", background: "#CADB00" }
                        : { borderColor: "rgba(26,26,24,0.20)" }
                      }>
                      {isSelected && (
                        <svg className="w-4 h-4" style={{ color: "#1A1A18" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {!isConnected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`Connect to ${lab.name} - Coming soon!`);
                      }}
                      className="mt-3 w-full px-4 py-2 rounded-xl text-sm font-semibold active:scale-95 transition-all"
                      style={{ background: "rgba(26,26,24,0.06)", color: "rgba(26,26,24,0.60)", border: "1px solid rgba(26,26,24,0.10)" }}
                    >
                      Connect Lab Account
                    </button>
                  )}
                </button>
              );
            })}
          </div>


          {error && (
            <div className="flex items-start gap-3 text-sm text-red-400 bg-red-500/10 
                          rounded-2xl px-4 py-3 border border-red-500/20 mb-4 animate-shake">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="leading-relaxed">{error}</span>
            </div>
          )}


          <button
            onClick={handleFetch}
            disabled={loading || !selectedLab}
            className="w-full relative py-4 px-6 rounded-2xl font-bold overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-200 group"
            style={{ background: "linear-gradient(135deg, #CADB00 0%, #B8C900 100%)", color: "#1A1A18", boxShadow: "0 4px 20px rgba(202,219,0,0.30)" }}
          >
            {!loading && (
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent 
                             translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></span>
            )}

            <span className="relative flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Fetching from {supportedLabs.find(l => l.id === selectedLab)?.name}...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Fetch Latest Results
                </>
              )}
            </span>
          </button>


          {loading && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-center gap-2 text-xs" style={{ color: "rgba(26,26,24,0.45)" }}>
                <svg className="w-4 h-4 animate-pulse" style={{ color: "#CADB00" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Securely connecting to lab servers...</span>
              </div>
            </div>
          )}
        </div>
      </section>


      {biomarkers.length > 0 && (
        <>

          <section id="results-section" className="px-5 mb-6">
            <div className="glass-card rounded-3xl p-6 animate-fadeIn">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(202,219,0,0.15)" }}>
                  <svg className="w-6 h-6" style={{ color: "#5A6000" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-black mb-1" style={{ color: "#1A1A18" }}>Results Fetched Successfully!</h3>
                  <p className="text-sm" style={{ color: "rgba(26,26,24,0.55)" }}>
                    We've analyzed {biomarkers.length} biomarkers from your latest report
                  </p>
                  {overallScore !== null && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                      style={{ background: "rgba(202,219,0,0.10)", border: "1px solid rgba(202,219,0,0.22)" }}>
                      <span className="text-xs font-medium" style={{ color: "rgba(26,26,24,0.55)" }}>Health Score:</span>
                      <span className="text-base font-black" style={{ color: overallScore >= 70 ? '#5A6000' : overallScore >= 40 ? '#B45309' : '#DC2626' }}>
                        {overallScore}/100
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>


          <section className="px-5 mb-6">
            <div className="glass-card rounded-3xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold" style={{ color: "#1A1A18" }}>Your Biomarkers</h3>
                  <p className="text-xs mt-1" style={{ color: "rgba(26,26,24,0.45)" }}>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ background: "#CADB00" }}></span>
                      Normal
                    </span>
                    <span className="mx-2">•</span>
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-400"></span>
                      Needs attention
                    </span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {biomarkers.map((b, idx) => (
                  <BiomarkerRing
                    key={idx}
                    name={b.name}
                    value={b.value}
                    status={b.status}
                    unit={b.unit}
                    normalRange={b.normalRange}
                  />
                ))}
              </div>
            </div>
          </section>


          <section className="px-5">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/biomarkers/history')}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-semibold active:scale-[0.98] transition-all"
                style={{ background: "rgba(26,26,24,0.06)", color: "rgba(26,26,24,0.70)", border: "2px solid rgba(26,26,24,0.10)" }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                View History
              </button>
              <button
                onClick={() => {
                  setBiomarkers([]);
                  setError("");
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-semibold active:scale-[0.98] transition-all"
                style={{ background: "rgba(202,219,0,0.12)", color: "#5A6000", border: "2px solid rgba(202,219,0,0.25)" }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Fetch Again
              </button>
            </div>
          </section>
        </>
      )}


      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}


