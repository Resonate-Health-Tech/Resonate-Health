import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, Link } from "react-router-dom";
import { postAuth } from "../api.js";

const SANS = { fontFamily: "'DM Sans', sans-serif" };

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { setIsVisible(true); }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const token = await cred.user.getIdToken();
      const res = await postAuth("/api/auth/login", token, {});
      if (res.message === "Login Success") {
        sessionStorage.setItem("verifiedUser", "true");
        navigate("/dashboard");
      } else {
        await auth.signOut();
        setError(res.message);
      }
    } catch (err) {
      await auth.signOut();
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #EEF5E0 0%, #EAF0F8 45%, #F3EEF5 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        ...SANS,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 448,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        {/* Logo + Title */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52,
            borderRadius: "50%",
            background: "#CADB00",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <svg width="22" height="22" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="#1A1A18" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 700, color: "#1A1A18", marginBottom: 6 }}>
            Resonate
          </h1>
          <p style={{ fontSize: 14, color: "rgba(26,26,24,0.55)" }}>
            Your personal health operating system
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
          padding: 32,
        }}>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Email */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#1A1A18", display: "block", marginBottom: 6 }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                required
                placeholder="you@example.com"
                autoComplete="email"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: `2px solid ${focusedField === "email" ? "#CADB00" : "rgba(26,26,24,0.12)"}`,
                  background: "#FFFFFF",
                  fontSize: 14,
                  color: "#1A1A18",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.15s",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#1A1A18", display: "block", marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{
                    width: "100%",
                    padding: "12px 44px 12px 16px",
                    borderRadius: 12,
                    border: `2px solid ${focusedField === "password" ? "#CADB00" : "rgba(26,26,24,0.12)"}`,
                    background: "#FFFFFF",
                    fontSize: 14,
                    color: "#1A1A18",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.15s",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "rgba(26,26,24,0.40)", padding: 0,
                  }}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.20)",
                borderRadius: 10, padding: "10px 14px",
                fontSize: 13, color: "#EF4444",
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 12,
                background: loading ? "rgba(26,26,24,0.08)" : "#1A1A18",
                color: loading ? "rgba(26,26,24,0.40)" : "#FFFFFF",
                fontSize: 14, fontWeight: 600,
                border: "none", cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.15s",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(26,26,24,0.08)" }} />
            <span style={{ fontSize: 12, color: "rgba(26,26,24,0.35)" }}>Or continue with</span>
            <div style={{ flex: 1, height: 1, background: "rgba(26,26,24,0.08)" }} />
          </div>

          {/* Google button */}
          <button
            type="button"
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 12,
              background: "#FFFFFF",
              border: "1.5px solid rgba(26,26,24,0.12)",
              color: "#1A1A18",
              fontSize: 14, fontWeight: 500,
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              transition: "border-color 0.15s, background 0.15s",
              fontFamily: "'DM Sans', sans-serif",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(26,26,24,0.03)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#FFFFFF"; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          {/* Register link */}
          <p style={{ textAlign: "center", fontSize: 13, color: "rgba(26,26,24,0.55)", marginTop: 20 }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#1A1A18", fontWeight: 600, textDecoration: "none" }}
              onMouseEnter={(e) => { e.target.style.textDecoration = "underline"; }}
              onMouseLeave={(e) => { e.target.style.textDecoration = "none"; }}
            >
              Sign up →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
