import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BiomarkerCard from "../components/BiomarkerCard";

// ── Mock data using the exact category names from biomarkerReference.js ──
const DEMO_BY_CATEGORY = {
  "General Health": {
    vitamin_b12: { value: 320, status: "good", unit: "pg/mL", normalRange: "211–911 pg/mL", reason: "Vitamin B12 is within optimal range, supporting nerve function and red blood cell formation.", isAvailable: true },
    vitamin_d: { value: 22, status: "bad", unit: "ng/mL", normalRange: "30–100 ng/mL", reason: "Vitamin D is below optimal. Supplementation and increased sun exposure are recommended.", isAvailable: true },
    hs_crp: { value: 1.8, status: "bad", unit: "mg/L", normalRange: "0–1 mg/L (low risk)", reason: "hs-CRP is in the moderate risk zone indicating mild systemic inflammation.", isAvailable: true },
    homocysteine: { value: 9.5, status: "good", unit: "µmol/L", normalRange: "5–15 µmol/L", reason: "Homocysteine is within normal range.", isAvailable: true },
    calcium: { value: 9.4, status: "good", unit: "mg/dL", normalRange: "8.5–10.5 mg/dL", reason: "Calcium level is normal, supporting bone and nerve function.", isAvailable: true },
  },
  "Complete Blood Health": {
    hemoglobin: { value: 14.8, status: "good", unit: "g/dL", normalRange: "13–17 g/dL", reason: "Hemoglobin is within normal range, indicating good oxygen-carrying capacity.", isAvailable: true },
    red_blood_cell_count: { value: 5.1, status: "good", unit: "million/mm³", normalRange: "4.5–5.5 million/mm³", reason: "RBC count is healthy.", isAvailable: true },
    white_blood_cell_count: { value: 7200, status: "good", unit: "cells/mm³", normalRange: "4000–11000 cells/mm³", reason: "WBC count is within normal range, suggesting a healthy immune system.", isAvailable: true },
    platelet_count: { value: 245000, status: "good", unit: "per µL", normalRange: "150000–450000 per µL", reason: "Platelet count is normal, indicating proper blood clotting function.", isAvailable: true },
    hematocrit: { value: 45, status: "good", unit: "%", normalRange: "40–54%", reason: "Hematocrit is within normal range.", isAvailable: true },
    neutrophils: { value: 62, status: "good", unit: "%", normalRange: "40–75%", reason: "Neutrophil percentage is normal.", isAvailable: true },
    lymphocytes: { value: 28, status: "good", unit: "%", normalRange: "20–40%", reason: "Lymphocyte percentage is within range.", isAvailable: true },
    esr: { value: 12, status: "good", unit: "mm/hr", normalRange: "0–15 mm/hr", reason: "ESR is within normal limits.", isAvailable: true },
  },
  "Cholesterol Assessment": {
    total_cholesterol: { value: 192, status: "good", unit: "mg/dL", normalRange: "<200 mg/dL", reason: "Total cholesterol is in the desirable range.", isAvailable: true },
    hdl_cholesterol: { value: 52, status: "good", unit: "mg/dL", normalRange: ">40 mg/dL", reason: "HDL (good cholesterol) is at a healthy level.", isAvailable: true },
    ldl_cholesterol: { value: 118, status: "bad", unit: "mg/dL", normalRange: "<100 mg/dL (optimal)", reason: "LDL cholesterol is slightly above optimal. Dietary modifications can help.", isAvailable: true },
    triglycerides: { value: 158, status: "bad", unit: "mg/dL", normalRange: "<150 mg/dL", reason: "Triglycerides are mildly elevated. Reducing refined carbohydrates and sugar is advised.", isAvailable: true },
    vldl_cholesterol: { value: 28, status: "good", unit: "mg/dL", normalRange: "5–40 mg/dL", reason: "VLDL cholesterol is within normal range.", isAvailable: true },
  },
  "Glucose Regulation": {
    fasting_glucose: { value: 94, status: "good", unit: "mg/dL", normalRange: "70–100 mg/dL", reason: "Fasting blood glucose is within normal range.", isAvailable: true },
    hba1c: { value: 5.5, status: "good", unit: "%", normalRange: "4.0–5.6%", reason: "HbA1c indicates excellent long-term blood sugar control.", isAvailable: true },
    fasting_insulin: { value: 8.2, status: "good", unit: "µIU/mL", normalRange: "2.0–25.0 µIU/mL", reason: "Fasting insulin is within normal range.", isAvailable: true },
  },
  "Detox Panel": {
    sgpt_alt: { value: 38, status: "good", unit: "U/L", normalRange: "10–40 U/L", reason: "ALT is normal, indicating healthy liver function.", isAvailable: true },
    sgot_ast: { value: 29, status: "good", unit: "U/L", normalRange: "15–40 U/L", reason: "AST is within normal range.", isAvailable: true },
    total_bilirubin: { value: 0.8, status: "good", unit: "mg/dL", normalRange: "0.3–1.2 mg/dL", reason: "Total bilirubin is normal.", isAvailable: true },
    albumin: { value: 4.5, status: "good", unit: "g/dL", normalRange: "3.5–5.5 g/dL", reason: "Albumin is within normal range, reflecting good liver function.", isAvailable: true },
    alkaline_phosphatase: { value: 88, status: "good", unit: "U/L", normalRange: "44–147 U/L", reason: "ALP is normal.", isAvailable: true },
  },
  "Kidney Health": {
    serum_creatinine: { value: 1.0, status: "good", unit: "mg/dL", normalRange: "0.7–1.3 mg/dL", reason: "Creatinine is within normal range, indicating healthy kidney function.", isAvailable: true },
    blood_urea_nitrogen: { value: 14, status: "good", unit: "mg/dL", normalRange: "7–20 mg/dL", reason: "BUN is within normal range.", isAvailable: true },
    uric_acid: { value: 6.8, status: "good", unit: "mg/dL", normalRange: "3.5–7.2 mg/dL", reason: "Uric acid is within normal range.", isAvailable: true },
  },
  "Fatigue": {
    ferritin: { value: 28, status: "bad", unit: "ng/mL", normalRange: "30–400 ng/mL", reason: "Ferritin is below normal. Low iron stores can cause fatigue and poor recovery.", isAvailable: true },
    tsh: { value: 2.1, status: "good", unit: "µIU/mL", normalRange: "0.4–4.0 µIU/mL", reason: "TSH is within normal range, indicating healthy thyroid function.", isAvailable: true },
    magnesium: { value: 1.9, status: "good", unit: "mg/dL", normalRange: "1.7–2.2 mg/dL", reason: "Magnesium is within normal range, supporting muscle and nerve function.", isAvailable: true },
    sodium: { value: 140, status: "good", unit: "mmol/L", normalRange: "135–145 mmol/L", reason: "Sodium is within normal range.", isAvailable: true },
    potassium: { value: 4.1, status: "good", unit: "mmol/L", normalRange: "3.5–5.0 mmol/L", reason: "Potassium is within normal range.", isAvailable: true },
  },
  "Hormone Health": {
    testosterone_total: { value: 520, status: "good", unit: "ng/dL", normalRange: "300–1000 ng/dL", reason: "Total testosterone is within a healthy range.", isAvailable: true },
    cortisol: { value: 14.2, status: "good", unit: "mcg/dL", normalRange: "6.2–19.4 mcg/dL (AM)", reason: "Cortisol is within normal morning range.", isAvailable: true },
    dhea_s: { value: 310, status: "good", unit: "µg/dL", normalRange: "80–560 µg/dL", reason: "DHEA-S is within normal range.", isAvailable: true },
  },
  "Micronutrients": {
    iron: { value: 88, status: "good", unit: "µg/dL", normalRange: "65–175 µg/dL", reason: "Iron level is within normal range.", isAvailable: true },
    vitamin_b9_folate: { value: 8.4, status: "good", unit: "ng/mL", normalRange: "2.7–17.0 ng/mL", reason: "Folate is within normal range, supporting DNA synthesis.", isAvailable: true },
  },
};

// Build flat biomarkers array from the category map (first category wins for deduplication)
function buildBiomarkersArr(byCat) {
  const seen = new Set();
  const arr = [];
  for (const [categoryName, markers] of Object.entries(byCat)) {
    for (const [name, info] of Object.entries(markers)) {
      if (seen.has(name)) continue;
      seen.add(name);
      arr.push({ name, category: categoryName, ...info });
    }
  }
  return arr;
}

const DEMO_META = {
  updatedAt: new Date().toISOString(),
  overallScore: null, // computed dynamically below
};

export default function DemoReportPage() {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const navigate = useNavigate();

  const biomarkers = buildBiomarkersArr(DEMO_BY_CATEGORY);

  // Stats
  const total = biomarkers.length;
  const goodCount = biomarkers.filter(b => b.status === "good").length;
  const badCount = biomarkers.filter(b => b.status === "bad").length;
  const unknownCount = total - goodCount - badCount;
  const overallScore = total > 0 ? Math.round((goodCount / total) * 100) : 0;

  // Stacked bar
  const goodPct = total > 0 ? (goodCount / total) * 100 : 0;
  const badPct = total > 0 ? (badCount / total) * 100 : 0;
  const unknownPct = total > 0 ? (unknownCount / total) * 100 : 0;

  // Categories (only non-empty ones)
  const categories = Object.keys(DEMO_BY_CATEGORY).filter(
    c => c && Object.keys(DEMO_BY_CATEGORY[c]).length > 0
  );

  // Filter
  let displayedBiomarkers = biomarkers;
  if (selectedCategories.length > 0) {
    displayedBiomarkers = biomarkers.filter(b => selectedCategories.includes(b.category));
  }

  const handleCategoryClick = (cat) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(Math.abs(now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
  };

  const formatToday = () => {
    const d = new Date();
    return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #EEF5E0 0%, #EAF0F8 45%, #F3EEF5 100%)",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "28px 32px 48px" }}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[32px] font-bold text-[#1A1A18] leading-tight flex items-center justify-between">
            <span className="flex items-center gap-3">
              Diagnostics
              <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: "rgba(202,219,0,0.18)", color: "#5A6000", border: "1px solid rgba(202,219,0,0.30)" }}>
                DEMO
              </span>
            </span>
          </h1>
          <p className="text-[#6B7280] text-[15px]">{formatToday()}</p>
        </div>

        {/* Hero Card — identical to LatestAnalysisPage */}
        <div className="bg-[#151923] rounded-[24px] p-6 md:p-10 mb-8 flex flex-col md:flex-row gap-8 md:gap-16 shadow-lg border border-white/5 relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-[#CADB00]/10 blur-[100px] pointer-events-none" />

          {/* Left Column */}
          <div className="flex-1 flex flex-col relative z-10">
            <h2 className="text-[#A1A1AA] text-xs font-bold tracking-widest uppercase mb-1">Latest Diagnostics Report</h2>
            <p className="text-[#CADB00] text-[15px] font-semibold mb-8">
              Last updated {formatDate(DEMO_META.updatedAt)}
            </p>

            <div className="flex flex-col items-center justify-center mb-6">
              {/* Score Ring */}
              <div className="relative w-[140px] h-[140px] flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90 absolute inset-0">
                  <circle cx="70" cy="70" r="62" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                  <circle
                    cx="70" cy="70" r="62" fill="none" stroke="#CADB00" strokeWidth="12"
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
              <span className="bg-[#8C5D30] text-white px-4 py-1.5 rounded-full text-xs font-bold">{badCount} Flagged</span>
              <span className="bg-[#CADB00] text-[#1A1A18] px-4 py-1.5 rounded-full text-xs font-bold">{goodCount} Optimal</span>
              <span className="bg-[#8B789C] text-white px-4 py-1.5 rounded-full text-xs font-bold">{unknownCount} Unknown</span>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex-[1.5] flex flex-col justify-center relative z-10">
            <h2 className="text-[#A1A1AA] text-xs font-bold tracking-widest uppercase mb-4">Biomarker Overview</h2>

            {/* Stacked Bar */}
            <div className="h-6 w-full rounded-md overflow-hidden flex mb-2 shadow-inner">
              {goodPct > 0 && <div className="h-full bg-[#CADB00] transition-all" style={{ width: `${goodPct}%` }} />}
              {badPct > 0 && <div className="h-full bg-[#8C5D30] transition-all" style={{ width: `${badPct}%` }} />}
              {unknownPct > 0 && <div className="h-full bg-[#8B789C] transition-all" style={{ width: `${unknownPct}%` }} />}
            </div>

            {/* Legends */}
            <div className="flex gap-16 mb-10">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#CADB00]" />
                <span className="text-white text-[13px] font-medium">{goodCount} Optimal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#8C5D30]" />
                <span className="text-white text-[13px] font-medium">{badCount} Flagged</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#8B789C]" />
                <span className="text-white text-[13px] font-medium">{unknownCount} Unknown</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/register')}
                className="w-full bg-[#CADB00] hover:bg-[#D5E700] text-[#1A1A18] font-bold py-3.5 rounded-[16px] transition flex items-center justify-center gap-2"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Create Free Account
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-transparent border border-white/20 text-white hover:bg-white/5 font-semibold py-3.5 rounded-[16px] transition"
              >
                Sign In to Upload Your Report
              </button>
            </div>
          </div>
        </div>

        {/* Biomarker Section */}
        <div>
          <h2 className="text-[22px] font-bold text-[#1A1A18] mb-4">Categories</h2>

          {/* Filter Chips */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-2 items-center no-scrollbar">
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

          {/* Biomarker Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {displayedBiomarkers.map((b, idx) => (
              <BiomarkerCard
                key={idx}
                name={b.name}
                value={b.value}
                status={b.status}
                unit={b.unit}
                category={b.category}
                normalRange={b.normalRange}
                reason={b.reason}
                isAvailable={b.isAvailable}
              />
            ))}
          </div>
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </div>
    </div>
  );
}
