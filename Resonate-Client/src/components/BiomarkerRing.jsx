
import React, { useState, useEffect } from "react";

export default function BiomarkerRing({ name, value, status, unit = "", normalRange = "", reason = "", isAvailable = true }) {
  const [showDetails, setShowDetails] = useState(false);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimated(true), 100);
  }, []);

  const statusLower = status?.toLowerCase();
  const isUndetermined = value == null || status == null || !isAvailable || statusLower === "unavailable" || statusLower === "unknown";
  const isGood = statusLower === "good";
  const isBad = statusLower === "bad";
  const isUnavailable = statusLower === "unavailable" || !isAvailable;
  const isUnknown = statusLower === "unknown";


  const getColors = () => {
    if (isUnavailable || isUnknown) {
      return {
        ring: "stroke-slate-500",
        bg: "stroke-slate-800",
        badge: "bg-slate-500/10 text-slate-400 border-slate-500/20",
        gradient: "from-slate-500/10 to-slate-600/5",
        icon: "text-slate-500",
      };
    }
    if (isGood) {
      return {
        ring: "stroke-emerald-400",
        bg: "stroke-slate-800",
        badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        gradient: "from-emerald-500/10 to-emerald-600/5",
        icon: "text-emerald-400",
      };
    }
    if (isBad) {
      return {
        ring: "stroke-red-400",
        bg: "stroke-slate-800",
        badge: "bg-red-500/10 text-red-400 border-red-500/20",
        gradient: "from-red-500/10 to-red-600/5",
        icon: "text-red-400",
      };
    }

    return {
      ring: "stroke-slate-500",
      bg: "stroke-slate-800",
      badge: "bg-slate-500/10 text-slate-400 border-slate-500/20",
      gradient: "from-slate-500/10 to-slate-600/5",
      icon: "text-slate-500",
    };
  };

  const colors = getColors();

  const getLabel = () => {
    if (isUnavailable) return "Unavailable";
    if (isUnknown) return "Unknown";
    if (isGood) return "Good";
    if (isBad) return "Needs Attention";
    return "Unknown";
  };

  const getIcon = () => {
    if (isUnavailable) return "—";
    if (isUnknown) return "❓";
    if (isGood) return "✓";
    if (isBad) return "⚠️";
    return "❓";
  };


  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const progress = isUndetermined ? 0 : 75;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <>

      <div
        onClick={() => setShowDetails(true)}
        className={`relative flex flex-col items-center bg-gradient-to-br ${colors.gradient} 
                  backdrop-blur-sm border border-slate-700/50 rounded-3xl p-5 gap-3
                  hover:border-${isGood ? 'emerald' : 'red'}-500/30 
                  active:scale-[0.97] transition-all duration-300 cursor-pointer group`}
      >

        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-slate-800/50 
                      flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>


        <div className="relative w-24 h-24 group-hover:scale-110 transition-transform duration-300">
          <svg className="w-24 h-24 transform -rotate-90">

            <circle
              cx="48"
              cy="48"
              r={radius}
              strokeWidth="6"
              fill="transparent"
              className={colors.bg}
            />

            {!isUndetermined && (
              <circle
                cx="48"
                cy="48"
                r={radius}
                strokeWidth="6"
                fill="transparent"
                className={`${colors.ring} transition-all duration-1000 ease-out`}
                strokeDasharray={circumference}
                strokeDashoffset={animated ? strokeDashoffset : circumference}
                strokeLinecap="round"
              />
            )}
          </svg>
          

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-black text-slate-50">
              {isUndetermined ? "--" : value}
            </span>
            {unit && !isUndetermined && (
              <span className="text-xs text-slate-500 font-medium">{unit}</span>
            )}
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm font-bold text-slate-50 mb-1 leading-tight">{name}</p>

          <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full 
                          border font-semibold ${colors.badge}`}>
            <span>{getIcon()}</span>
            {getLabel()}
          </span>
        </div>

        <div className="text-xs text-slate-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          Tap for details
        </div>
      </div>

      {showDetails && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-end sm:items-center 
                   justify-center p-0 sm:p-5 animate-fadeIn"
          onClick={() => setShowDetails(false)}
        >
          <div 
            className="bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl 
                     w-full sm:max-w-md max-h-[80vh] overflow-y-auto animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 
                          px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-black text-slate-50">{name}</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 
                         flex items-center justify-center active:scale-95 transition-all"
              >
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>


            <div className="p-6 space-y-5">

              <div className={`bg-gradient-to-br ${colors.gradient} border border-slate-700/50 
                            rounded-2xl p-6 text-center`}>
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="56" strokeWidth="8" fill="transparent" className={colors.bg} />
                    {!isUndetermined && (
                      <circle
                        cx="64" cy="64" r="56" strokeWidth="8" fill="transparent"
                        className={colors.ring}
                        strokeDasharray={2 * Math.PI * 56}
                        strokeDashoffset={2 * Math.PI * 56 * (1 - progress / 100)}
                        strokeLinecap="round"
                      />
                    )}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-slate-50">
                      {isUndetermined ? "--" : value}
                    </span>
                    {unit && !isUndetermined && (
                      <span className="text-sm text-slate-500 font-medium">{unit}</span>
                    )}
                  </div>
                </div>
                
                <span className={`inline-flex items-center gap-2 text-base px-4 py-2 rounded-full 
                                border font-bold ${colors.badge}`}>
                  <span className="text-xl">{getIcon()}</span>
                  {getLabel()}
                </span>
              </div>


              {normalRange && (
                <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-400 mb-1">Normal Range</p>
                      <p className="text-sm font-bold text-slate-50">{normalRange}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-300">What This Means</h4>
                <div className={`bg-${isGood ? 'emerald' : isBad ? 'red' : 'slate'}-500/5 border border-${isGood ? 'emerald' : isBad ? 'red' : 'slate'}-500/20 
                              rounded-2xl p-4`}>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {isUnavailable ? (
                      reason || "This biomarker was not available in your report. It may not have been tested or could not be extracted."
                    ) : isUnknown ? (
                      reason || "This biomarker value could not be determined from your report. Please ensure the PDF is clear and contains all relevant data."
                    ) : isGood ? (
                      `Your ${name} level is within the normal range. Keep maintaining your healthy lifestyle!`
                    ) : isBad ? (
                      reason || `Your ${name} level is outside the normal range. Consider consulting with your healthcare provider for personalized advice.`
                    ) : (
                      "Unable to determine the status of this biomarker."
                    )}
                  </p>
                </div>
              </div>

              {isBad && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-300">Recommendations</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-slate-400">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Consult with your healthcare provider</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-slate-400">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Monitor this biomarker regularly</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-slate-400">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Consider lifestyle modifications</span>
                    </li>
                  </ul>
                </div>
              )}

              <button
                onClick={() => setShowDetails(false)}
                className="w-full py-3 rounded-2xl bg-slate-800 border border-slate-700 
                         text-slate-300 font-semibold hover:bg-slate-700 active:scale-95 transition-all"
              >
                Close
              </button>

            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
}


