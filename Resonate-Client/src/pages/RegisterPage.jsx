import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase";
import { postAuth } from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    gender: "",
    age: "",
    height: "",
    weight: "",
    dietType: "",
    goal: "",
    hasMedicalCondition: false,
    medicalConditions: "",
    countryCode: "+91",
    phone: "",
    cycleLengthDays: "",
    lastPeriodDate: "",
    menstrualPhase: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const totalSteps = form.gender === "female" ? 4 : 3;

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const completeBackendRegistration = async (token) => {
    const payload = {};

    if (form.name) payload.name = form.name;
    if (form.gender) payload.gender = form.gender;

    if (form.age) {
      const dob = new Date();
      dob.setFullYear(dob.getFullYear() - Number(form.age));
      payload.dateOfBirth = dob;
    }

    if (form.height) payload.heightCm = Number(form.height);
    if (form.weight) payload.weightKg = Number(form.weight);
    if (form.dietType) payload.dietType = form.dietType;
    if (form.goal) payload.goals = form.goal;

    if (
      form.gender === "female" &&
      (form.cycleLengthDays || form.lastPeriodDate || form.menstrualPhase)
    ) {
      payload.menstrualProfile = {};
      if (form.cycleLengthDays)
        payload.menstrualProfile.cycleLengthDays = Number(form.cycleLengthDays);
      if (form.lastPeriodDate)
        payload.menstrualProfile.lastPeriodDate = new Date(form.lastPeriodDate);
      if (form.menstrualPhase)
        payload.menstrualProfile.phase = form.menstrualPhase;
    }

    if (form.hasMedicalCondition && form.medicalConditions) {
      payload.hasMedicalCondition = true;
      payload.medicalConditions = form.medicalConditions
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
    }

    if (form.phone) {
      payload.phone = `${form.countryCode}${form.phone}`.replace(/\s+/g, "");
    }

    const res = await postAuth("/api/auth/register", token, payload);

    if (res.message === "User Registered") {
      sessionStorage.setItem("verifiedUser", "true");
      navigate("/dashboard");
      return;
    }

    if (res.message === "User already registered!") {
      setError("User already registered, please try with a different email");
      await auth.signOut();
      return;
    }

    await auth.signOut();
    setError("Something went wrong!");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    setError("");
    setLoading(true);

    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const token = await cred.user.getIdToken();
      await completeBackendRegistration(token);
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        try {
          const signinCred = await signInWithEmailAndPassword(
            auth,
            form.email,
            form.password
          );
          const token = await signinCred.user.getIdToken();
          await completeBackendRegistration(token);
          return;
        } catch (err2) {
          setError(err2.message);
        }
      } else {
        setError(err.message || "Failed to register");
      }
    } finally {
      setLoading(false);
    }
  };

  const validateStep = () => {
    if (step === 1) {
      if (!form.email || !form.password) {
        setError("Email and password are required");
        return false;
      }
      if (form.password.length < 6) {
        setError("Password must be at least 6 characters");
        return false;
      }
    }
    if (step === 2) {
      if (!form.name || !form.gender || !form.age || !form.height || !form.weight) {
        setError("All fields are required");
        return false;
      }
    }
    if ((step === 3 && form.gender !== "female") || step === 4) {
      if (!form.dietType || !form.goal) {
        setError("Diet type and fitness goal are required");
        return false;
      }
    }
    setError("");
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setError("");
    setStep(step - 1);
  };

  const stepTitles = ["Create your account", "Tell us about yourself", form.gender === "female" ? "Menstrual health" : "Health & Goals", "Health & Goals"];
  const stepSubs = ["Start your health journey today", "Basic info helps personalize your experience", form.gender === "female" ? "Optional but recommended for better insights" : "Set your targets and preferences", "Set your targets and preferences"];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #EEF5E0 0%, #EAF0F8 45%, #F3EEF5 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "20px 16px",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Back button */}
      <button
        onClick={() => step > 1 ? prevStep() : navigate("/")}
        style={{
          position: "fixed", top: 20, left: 20,
          width: 40, height: 40, borderRadius: "50%",
          background: "rgba(255,255,255,0.80)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(26,26,24,0.10)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", zIndex: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A1A18" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div style={{ width: "100%", maxWidth: 448, position: "relative" }}>
        {/* Progress */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(26,26,24,0.70)" }}>Step {step} of {totalSteps}</span>
            <span style={{ fontSize: 12, color: "rgba(26,26,24,0.40)" }}>{Math.round((step / totalSteps) * 100)}% Complete</span>
          </div>
          <div style={{ height: 6, background: "rgba(26,26,24,0.08)", borderRadius: 9999, overflow: "hidden" }}>
            <div style={{
              width: `${(step / totalSteps) * 100}%`, height: "100%",
              background: "#CADB00", borderRadius: 9999,
              transition: "width 0.4s ease-out",
            }} />
          </div>
        </div>

        {/* Logo + title */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: "#CADB00",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 14px",
          }}>
            <svg width="20" height="20" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="#1A1A18" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1A1A18", marginBottom: 6 }}>
            {stepTitles[step - 1]}
          </h1>
          <p style={{ fontSize: 13, color: "rgba(26,26,24,0.55)" }}>
            {stepSubs[step - 1]}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.70)",
          boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
          borderRadius: 24,
          padding: 28,
        }}>

          <form onSubmit={step === totalSteps ? handleRegister : (e) => { e.preventDefault(); nextStep(); }} style={{ display: "flex", flexDirection: "column", gap: 0 }}>


            {step === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>


                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#1A1A18", display: "block", marginBottom: 6 }}>
                    Email address *
                  </label>
                  <input
                    type="email"
                    required
                    style={{
                      width: "100%", padding: "12px 16px", borderRadius: 12, boxSizing: "border-box",
                      border: `2px solid ${focusedField === "email" ? "#CADB00" : "rgba(26,26,24,0.12)"}`,
                      background: "#FFFFFF", fontSize: 14, color: "#1A1A18", outline: "none",
                      transition: "border-color 0.15s", fontFamily: "'DM Sans', sans-serif",
                    }}
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>


                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#1A1A18", display: "block", marginBottom: 6 }}>
                    Password *
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      style={{
                        width: "100%", padding: "12px 44px 12px 16px", borderRadius: 12, boxSizing: "border-box",
                        border: `2px solid ${focusedField === "password" ? "#CADB00" : "rgba(26,26,24,0.12)"}`,
                        background: "#FFFFFF", fontSize: 14, color: "#1A1A18", outline: "none",
                        transition: "border-color 0.15s", fontFamily: "'DM Sans', sans-serif",
                      }}
                      value={form.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Minimum 6 characters"
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                        background: "none", border: "none", cursor: "pointer", color: "rgba(26,26,24,0.40)", padding: 0
                      }}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" /></svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      )}
                    </button>
                  </div>
                  <p style={{ fontSize: 12, color: "rgba(26,26,24,0.45)", marginTop: 6 }}>Use a strong password with letters and numbers</p>
                </div>

              </div>
            )}


            {step === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                <input
                  type="text"
                  required
                  placeholder="Full Name *"
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 12, boxSizing: "border-box", border: "2px solid rgba(26,26,24,0.12)", background: "#FFF", fontSize: 14, color: "#1A1A18", outline: "none", fontFamily: "'DM Sans', sans-serif" }}
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <select required
                    style={{ padding: "12px 16px", borderRadius: 12, border: "2px solid rgba(26,26,24,0.12)", background: "#FFF", fontSize: 14, color: "#1A1A18", outline: "none", fontFamily: "'DM Sans', sans-serif" }}
                    value={form.gender} onChange={(e) => updateField("gender", e.target.value)}
                  >
                    <option value="">Gender *</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <input type="number" required placeholder="Age *" min="10" max="100"
                    style={{ padding: "12px 16px", borderRadius: 12, border: "2px solid rgba(26,26,24,0.12)", background: "#FFF", fontSize: 14, color: "#1A1A18", outline: "none", fontFamily: "'DM Sans', sans-serif" }}
                    value={form.age} onChange={(e) => updateField("age", e.target.value)}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ position: "relative" }}>
                    <input type="number" placeholder="Height (cm)" min="100" max="250"
                      style={{ width: "100%", padding: "12px 16px", borderRadius: 12, boxSizing: "border-box", border: "2px solid rgba(26,26,24,0.12)", background: "#FFF", fontSize: 14, color: "#1A1A18", outline: "none", fontFamily: "'DM Sans', sans-serif" }}
                      value={form.height} onChange={(e) => updateField("height", e.target.value)}
                    />
                  </div>
                  <div style={{ position: "relative" }}>
                    <input type="number" placeholder="Weight (kg)" min="30" max="200"
                      style={{ width: "100%", padding: "12px 16px", borderRadius: 12, boxSizing: "border-box", border: "2px solid rgba(26,26,24,0.12)", background: "#FFF", fontSize: 14, color: "#1A1A18", outline: "none", fontFamily: "'DM Sans', sans-serif" }}
                      value={form.weight} onChange={(e) => updateField("weight", e.target.value)}
                    />
                  </div>
                </div>

              </div>
            )}


            {step === 3 && form.gender === "female" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                <div style={{ background: "rgba(202,219,0,0.08)", border: "1px solid rgba(202,219,0,0.20)", borderRadius: 12, padding: "12px 14px" }}>
                  <p style={{ fontSize: 12, color: "rgba(26,26,24,0.60)", lineHeight: 1.6, margin: 0 }}>
                    Track your menstrual cycle for personalized health insights and recommendations.
                  </p>
                </div>

                <input type="number" placeholder="Cycle length (days)" min="21" max="35"
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 12, boxSizing: "border-box", border: "2px solid rgba(26,26,24,0.12)", background: "#FFF", fontSize: 14, color: "#1A1A18", outline: "none", fontFamily: "'DM Sans', sans-serif" }}
                  value={form.cycleLengthDays} onChange={(e) => updateField("cycleLengthDays", e.target.value)}
                />

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#1A1A18", display: "block", marginBottom: 6 }}>Last period start date</label>
                  <input type="date" max={new Date().toISOString().split('T')[0]}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: 12, boxSizing: "border-box", border: "2px solid rgba(26,26,24,0.12)", background: "#FFF", fontSize: 14, color: "#1A1A18", outline: "none", fontFamily: "'DM Sans', sans-serif" }}
                    value={form.lastPeriodDate} onChange={(e) => updateField("lastPeriodDate", e.target.value)}
                  />
                </div>

                <select
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "2px solid rgba(26,26,24,0.12)", background: "#FFF", fontSize: 14, color: "#1A1A18", outline: "none", fontFamily: "'DM Sans', sans-serif" }}
                  value={form.menstrualPhase} onChange={(e) => updateField("menstrualPhase", e.target.value)}
                >
                  <option value="">Current cycle phase</option>
                  <option value="follicular">Follicular (Days 1-13)</option>
                  <option value="ovulatory">Ovulatory (Days 14-16)</option>
                  <option value="luteal">Luteal (Days 17-28)</option>
                </select>

                <button type="button" onClick={nextStep}
                  style={{ fontSize: 13, color: "rgba(26,26,24,0.40)", background: "none", border: "none", cursor: "pointer", padding: "8px 0" }}
                >
                  Skip for now →
                </button>

              </div>
            )}


            {((step === 3 && form.gender !== "female") || step === 4) && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                <select
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "2px solid rgba(26,26,24,0.12)", background: "#FFF", fontSize: 14, color: "#1A1A18", outline: "none", fontFamily: "'DM Sans', sans-serif" }}
                  value={form.dietType} onChange={(e) => updateField("dietType", e.target.value)}
                >
                  <option value="">Diet Type</option>
                  <option value="vegetarian">🥗 Vegetarian</option>
                  <option value="eggetarian">🥚 Eggetarian</option>
                  <option value="non_vegetarian">🍗 Non-Vegetarian</option>
                </select>

                <input type="text" placeholder="Fitness goal (e.g., lose 5kg, build muscle)"
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 12, boxSizing: "border-box", border: "2px solid rgba(26,26,24,0.12)", background: "#FFF", fontSize: 14, color: "#1A1A18", outline: "none", fontFamily: "'DM Sans', sans-serif" }}
                  value={form.goal} onChange={(e) => updateField("goal", e.target.value)}
                />


                <div style={{ background: "rgba(26,26,24,0.04)", border: "1px solid rgba(26,26,24,0.10)", borderRadius: 12, padding: "12px 16px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                    <div style={{ width: 40, height: 22, borderRadius: 11, background: form.hasMedicalCondition ? "#CADB00" : "rgba(26,26,24,0.15)", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#FFF", position: "absolute", top: 2, left: form.hasMedicalCondition ? 20 : 2, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#1A1A18" }}>I have a medical condition</span>
                    <input type="checkbox" style={{ display: "none" }} checked={form.hasMedicalCondition} onChange={(e) => updateField("hasMedicalCondition", e.target.checked)} />
                  </label>
                </div>

                {form.hasMedicalCondition && (
                  <textarea placeholder="List your medical conditions (e.g., diabetes, thyroid)" rows="3"
                    style={{ width: "100%", padding: "12px 16px", borderRadius: 12, boxSizing: "border-box", border: "2px solid rgba(26,26,24,0.12)", background: "#FFF", fontSize: 14, color: "#1A1A18", outline: "none", fontFamily: "'DM Sans', sans-serif", resize: "none" }}
                    value={form.medicalConditions} onChange={(e) => updateField("medicalConditions", e.target.value)}
                  />
                )}

              </div>
            )}


            {error && (
              <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.20)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#EF4444", marginTop: 16 }}>
                {error}
              </div>
            )}


            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              {step > 1 && (
                <button type="button" onClick={prevStep}
                  style={{ flex: 1, padding: "13px 20px", borderRadius: 12, border: "1.5px solid rgba(26,26,24,0.15)", background: "rgba(26,26,24,0.05)", fontSize: 14, fontWeight: 600, color: "rgba(26,26,24,0.70)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
                >
                  Back
                </button>
              )}
              <button type="submit" disabled={loading}
                style={{ flex: 1, padding: "13px 20px", borderRadius: 12, border: "none", background: loading ? "rgba(26,26,24,0.08)" : "#1A1A18", fontSize: 14, fontWeight: 700, color: loading ? "rgba(26,26,24,0.40)" : "#FFF", cursor: loading ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s" }}
              >
                {loading ? "Creating…" : step === totalSteps ? "Create Account" : "Continue →"}
              </button>
            </div>

          </form>


          <p style={{ textAlign: "center", fontSize: 13, color: "rgba(26,26,24,0.55)", marginTop: 20 }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#1A1A18", fontWeight: 600, textDecoration: "none" }}>Sign in →</Link>
          </p>

        </div>


        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 20 }}>
          {[...Array(totalSteps)].map((_, i) => (
            <div key={i} style={{ height: 6, borderRadius: 9999, transition: "all 0.3s", width: i + 1 <= step ? 24 : 6, background: i + 1 <= step ? "#CADB00" : "rgba(26,26,24,0.15)" }} />
          ))}
        </div>

      </div>
    </div>
  );
}


