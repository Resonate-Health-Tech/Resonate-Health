import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { postWithCookie } from "../api";

export default function GetACoachPage() {
  const [form, setForm] = useState({
    name: "",
    countryCode: "+91",
    phone: "",
    goal: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    setIsVisible(true);
  }, []);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const validatePhone = () => {
    const phoneRegex = /^[0-9]{10}$/;
    if (!form.phone) {
      setError("Phone number is required");
      return false;
    }
    if (!phoneRegex.test(form.phone)) {
      setError("Please enter a valid 10-digit phone number");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validatePhone()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: form.name,
        phone: `${form.countryCode}${form.phone}`.replace(/\s+/g, ""),
        goal: form.goal,
      };

      const res = await postWithCookie("/api/coach/create", payload);

      if (res.message === "Coach request submitted successfully" || res.success) {
        setSuccess(true);
        setForm({ name: "", countryCode: "+91", phone: "", goal: "" });


        setTimeout(() => {
          navigate("/dashboard");
        }, 3000);
      } else {
        setError(res.message || "Failed to submit request");
      }
    } catch (err) {

      console.error("Error submitting coach request:", err);

      if (err.message.includes("JSON") || err.message.includes("DOCTYPE")) {
        setError("Backend service is not available. Please contact support at coach@resonate.fitness");
      } else if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
        setError("Network error. Please check your internet connection.");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };


  if (success) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen px-5 py-8" style={{ background: "linear-gradient(135deg, #EEF5E0 0%, #EAF0F8 45%, #F3EEF5 100%)" }}>

        <div className="w-full max-w-md relative animate-fadeIn">
          <div className="glass-card rounded-3xl p-8 shadow-2xl text-center">

            <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center animate-bounce"
              style={{ background: "rgba(202,219,0,0.15)", border: "2px solid rgba(202,219,0,0.30)" }}>
              <svg className="w-10 h-10" style={{ color: "#5A6000" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-3xl font-black mb-3" style={{ color: "#1A1A18" }}>
              Request Submitted! 🎉
            </h1>

            <p className="mb-6 leading-relaxed" style={{ color: "rgba(26,26,24,0.55)" }}>
              Thank you for your interest! Our coaching team will reach out to you within 24 hours.
            </p>

            <div className="rounded-2xl p-4 mb-6" style={{ background: "rgba(202,219,0,0.08)", border: "1px solid rgba(202,219,0,0.22)" }}>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(26,26,24,0.65)" }}>
                📞 We'll call you on <span className="font-semibold" style={{ color: "#5A6000" }}>{form.countryCode} {form.phone}</span>
              </p>
            </div>

            <button
              onClick={() => navigate("/dashboard")}
              className="w-full py-3.5 px-6 rounded-2xl font-bold active:scale-[0.98] transition-all duration-200"
              style={{ background: "linear-gradient(135deg, #CADB00 0%, #B8C900 100%)", color: "#1A1A18", boxShadow: "0 4px 20px rgba(202,219,0,0.30)" }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen px-5 py-8" style={{ background: "linear-gradient(135deg, #EEF5E0 0%, #EAF0F8 45%, #F3EEF5 100%)" }}>

      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-5 w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-all duration-200 z-10"
        style={{ background: "rgba(255,255,255,0.80)", border: "1px solid rgba(26,26,24,0.12)" }}
      >
        <svg className="w-5 h-5" style={{ color: "rgba(26,26,24,0.55)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>


      <div
        className={`w-full max-w-md relative transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
      >

        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center animate-pulse"
            style={{ background: "rgba(202,219,0,0.12)", border: "1px solid rgba(202,219,0,0.25)" }}>
            <span className="text-3xl">🏋️</span>
          </div>
          <h1 className="text-3xl font-black mb-2" style={{ color: "#1A1A18" }}>
            Get Your Personal Coach
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(26,26,24,0.55)" }}>
            Connect with expert fitness coaches to achieve your goals faster
          </p>
        </div>


        <div className="glass-card rounded-3xl p-6 shadow-2xl">


          <div className="rounded-2xl p-4 mb-6" style={{ background: "rgba(202,219,0,0.08)", border: "1px solid rgba(202,219,0,0.22)" }}>
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "#5A6000" }}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              What You'll Get:
            </h3>
            <ul className="space-y-2 text-xs" style={{ color: "rgba(26,26,24,0.65)" }}>
              <li className="flex items-center gap-2">
                <span style={{ color: "#CADB00" }}>✓</span>
                Personalized workout plans tailored to your goals
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: "#CADB00" }}>✓</span>
                One-on-one coaching sessions with certified trainers
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: "#CADB00" }}>✓</span>
                Nutrition guidance and meal planning support
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: "#CADB00" }}>✓</span>
                Progress tracking and regular check-ins
              </li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">


            <div className="space-y-2">
              <label className="block text-sm font-semibold mb-2" style={{ color: "rgba(26,26,24,0.65)" }}>
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    className={`w-5 h-5 transition-colors duration-200 ${focusedField === 'name' ? 'text-primary' : 'text-slate-500'
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className={`w-full rounded-2xl bg-slate-950/50 border-2 pl-12 pr-4 py-3.5 text-base text-slate-50
                            placeholder:text-slate-600 transition-all duration-200
                            focus:outline-none focus:bg-slate-950
                            ${focusedField === 'name'
                      ? 'border-primary shadow-lg shadow-primary/10'
                      : 'border-slate-700/50 hover:border-slate-600'
                    }`}
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  required
                  placeholder="Enter your full name"
                  autoComplete="name"
                />
              </div>
            </div>


            <div className="space-y-2">
              <label className="block text-sm font-semibold mb-2" style={{ color: "rgba(26,26,24,0.65)" }}>
                Phone Number *
              </label>
              <div className="flex gap-3">
                <select
                  className="w-24 rounded-2xl px-3 py-3.5 text-base transition-all duration-200 focus:outline-none"
                  style={{ background: "rgba(255,255,255,0.70)", border: "2px solid rgba(26,26,24,0.10)", color: "#1A1A18" }}
                  value={form.countryCode}
                  onChange={(e) => updateField("countryCode", e.target.value)}
                >
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+61">🇦🇺 +61</option>
                  <option value="+971">🇦🇪 +971</option>
                </select>

                <div className="relative flex-1">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-5 h-5 transition-colors duration-200"
                      style={{ color: focusedField === 'phone' ? '#CADB00' : 'rgba(26,26,24,0.30)' }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    className="w-full rounded-2xl pl-12 pr-4 py-3.5 text-base transition-all duration-200 focus:outline-none"
                    style={{
                      background: "rgba(255,255,255,0.70)",
                      border: `2px solid ${focusedField === 'phone' ? '#CADB00' : 'rgba(26,26,24,0.10)'}`,
                      color: "#1A1A18",
                      boxShadow: focusedField === 'phone' ? '0 0 0 3px rgba(202,219,0,0.12)' : 'none'
                    }}
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value.replace(/\D/g, ""))}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                    required
                    placeholder="Enter 10-digit phone number"
                    maxLength="10"
                    autoComplete="tel"
                  />
                </div>
              </div>
              <p className="text-xs flex items-center gap-1.5" style={{ color: "rgba(26,26,24,0.45)" }}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                We'll call you to discuss your fitness goals
              </p>
            </div>


            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-300">
                Your Fitness Goals *
              </label>
              <div className="relative">
                <div className="absolute left-4 top-4 pointer-events-none">
                  <svg
                    className={`w-5 h-5 transition-colors duration-200 ${focusedField === 'goal' ? 'text-primary' : 'text-slate-500'
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <textarea
                  className={`w-full rounded-2xl bg-slate-950/50 border-2 pl-12 pr-4 py-3.5 text-base text-slate-50
                            placeholder:text-slate-600 transition-all duration-200 resize-none
                            focus:outline-none focus:bg-slate-950
                            ${focusedField === 'goal'
                      ? 'border-primary shadow-lg shadow-primary/10'
                      : 'border-slate-700/50 hover:border-slate-600'
                    }`}
                  value={form.goal}
                  onChange={(e) => updateField("goal", e.target.value)}
                  onFocus={() => setFocusedField('goal')}
                  onBlur={() => setFocusedField(null)}
                  required
                  rows="4"
                  placeholder="e.g., Lose 10kg, Build muscle, Improve endurance, Learn proper form..."
                />
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                List all your fitness goals - you can have multiple
              </p>
            </div>


            {error && (
              <div className="flex items-start gap-3 text-sm text-red-400 bg-red-500/10 rounded-2xl px-4 py-3 border border-red-500/20 animate-shake">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="leading-relaxed">{error}</span>
              </div>
            )}


            <button
              type="submit"
              disabled={loading}
              className="relative w-full mt-2 rounded-2xl font-bold py-4 text-base overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-200 group"
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
                    Submitting...
                  </>
                ) : (
                  <>
                    Get Your Coach
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </span>
            </button>
          </form>


          <div className="flex items-center gap-2 mt-6 pt-6" style={{ borderTop: "1px solid rgba(26,26,24,0.08)" }}>
            <svg className="w-4 h-4 flex-shrink-0" style={{ color: "#CADB00" }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-xs leading-relaxed" style={{ color: "rgba(26,26,24,0.45)" }}>
              Your information is secure and will only be used to connect you with our coaching team.
            </p>
          </div>
        </div>


        <div className="mt-6 text-center">
          <p className="text-sm" style={{ color: "rgba(26,26,24,0.50)" }}>
            Questions? Email us at{" "}
            <a href="mailto:coach@resonate.fitness" className="font-semibold transition-colors" style={{ color: "#5A6000" }}>
              coach@resonate.fitness
            </a>
          </p>
        </div>
      </div>


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
