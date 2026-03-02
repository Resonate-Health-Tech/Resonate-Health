import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

// ─── ANIMATED COUNTER ──────────────────────────────────────────────────────────
function Counter({ target, suffix = "", duration = 1800 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const step = target / (duration / 16);
          let current = 0;
          const timer = setInterval(() => {
            current = Math.min(current + step, target);
            setCount(Math.floor(current));
            if (current >= target) clearInterval(timer);
          }, 16);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─── FLOATING ORB ─────────────────────────────────────────────────────────────
function Orb({ style, delay = "0s", duration = "6s" }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        animation: `float ${duration} ease-in-out infinite`,
        animationDelay: delay,
        ...style,
      }}
    />
  );
}

// ─── MARQUEE ROW ──────────────────────────────────────────────────────────────
const MARQUEE_ITEMS = [
  "HRV Tracking", "Sleep Analysis", "Blood Biomarkers", "AI Insights",
  "Workout Planning", "Nutrition IQ", "Menstrual Health", "Recovery Score",
  "Experiment Engine", "Memory AI", "Cardio Load", "Diagnostics",
];

function Marquee({ reverse = false }) {
  return (
    <div className="overflow-hidden whitespace-nowrap" style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}>
      <div
        className="inline-flex gap-4"
        style={{
          animation: `marquee${reverse ? "R" : ""} 28s linear infinite`,
          willChange: "transform",
        }}
      >
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
            style={{
              background: i % 3 === 0
                ? "rgba(202,219,0,0.14)"
                : i % 3 === 1
                  ? "rgba(124,111,205,0.10)"
                  : "rgba(255,255,255,0.65)",
              border: "1px solid rgba(26,26,24,0.08)",
              color: i % 3 === 0 ? "#3D4000" : "#1A1A18",
              backdropFilter: "blur(8px)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full inline-block"
              style={{ background: i % 3 === 0 ? "#CADB00" : i % 3 === 1 ? "#7C6FCD" : "#E07A3A" }}
            />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── FEATURE CARD ─────────────────────────────────────────────────────────────
function FeatureCard({ emoji, title, desc, accent, delay }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "rgba(255,255,255,0.90)" : "rgba(255,255,255,0.65)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: hovered ? `1.5px solid ${accent}50` : "1.5px solid rgba(255,255,255,0.80)",
        borderRadius: 24,
        padding: "28px 24px",
        transition: "all 0.3s ease",
        transform: hovered ? "translateY(-6px)" : "none",
        boxShadow: hovered
          ? `0 20px 40px rgba(0,0,0,0.10), 0 0 0 1px ${accent}20`
          : "0 4px 16px rgba(0,0,0,0.05)",
        animationFillMode: "both",
        animation: `fadeUp 0.6s ease ${delay} both`,
      }}
    >
      <div
        style={{
          width: 52, height: 52, borderRadius: 16,
          background: `${accent}18`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, marginBottom: 16,
          transition: "transform 0.3s ease",
          transform: hovered ? "scale(1.12) rotate(-4deg)" : "none",
        }}
      >
        {emoji}
      </div>
      <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1A1A18", marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>
        {title}
      </h3>
      <p style={{ fontSize: 14, lineHeight: 1.65, color: "rgba(26,26,24,0.55)", fontFamily: "'DM Sans', sans-serif" }}>
        {desc}
      </p>
    </div>
  );
}

// ─── TESTIMONIAL ──────────────────────────────────────────────────────────────
function Testimonial({ quote, name, role, avatar, color }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.70)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      border: "1.5px solid rgba(255,255,255,0.80)",
      borderRadius: 24,
      padding: "28px 24px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
    }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {[...Array(5)].map((_, i) => (
          <span key={i} style={{ fontSize: 16 }}>⭐</span>
        ))}
      </div>
      <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(26,26,24,0.65)", marginBottom: 20, fontStyle: "italic", fontFamily: "'DM Sans', sans-serif" }}>
        "{quote}"
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          background: color, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 18, fontWeight: 700,
          color: "#1A1A18", flexShrink: 0,
        }}>
          {avatar}
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#1A1A18", fontFamily: "'DM Sans', sans-serif" }}>{name}</p>
          <p style={{ fontSize: 12, color: "rgba(26,26,24,0.45)", fontFamily: "'DM Sans', sans-serif" }}>{role}</p>
        </div>
      </div>
    </div>
  );
}

// ─── STEP ─────────────────────────────────────────────────────────────────────
function Step({ num, title, desc, accent }) {
  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: accent, color: "#1A1A18",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, fontWeight: 800, flexShrink: 0,
        fontFamily: "'DM Serif Display', serif",
        boxShadow: `0 8px 20px ${accent}55`,
      }}>
        {num}
      </div>
      <div>
        <h4 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A18", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>
          {title}
        </h4>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(26,26,24,0.55)", fontFamily: "'DM Sans', sans-serif" }}>
          {desc}
        </p>
      </div>
    </div>
  );
}

// ─── MAIN LANDING PAGE ────────────────────────────────────────────────────────
export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setNavScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const features = [
    {
      emoji: "🧬",
      title: "Blood Biomarker AI",
      desc: "Upload your lab report and get instant AI-powered diagnostics. Understand your cholesterol, glucose, hormones — in plain English.",
      accent: "#CADB00",
    },
    {
      emoji: "💓",
      title: "HRV & Recovery Tracking",
      desc: "Know exactly how recovered you are before training. Sync with Google Fit to see real-time heart rate variability and recovery scores.",
      accent: "#D95F78",
    },
    {
      emoji: "🧠",
      title: "Memory Intelligence",
      desc: "Your AI memory layer learns your patterns over time — sleep, nutrition, mood — and surfaces actionable insights just for you.",
      accent: "#7C6FCD",
    },
    {
      emoji: "🥗",
      title: "Nutrition Intelligence",
      desc: "Log meals, track macros, and receive AI-backed meal suggestions aligned with your biomarkers and fitness goals.",
      accent: "#34C759",
    },
    {
      emoji: "🔬",
      title: "Experiment Engine",
      desc: "Run personal health experiments: try intermittent fasting, cold showers, or new supplements — and measure what actually works.",
      accent: "#E07A3A",
    },
    {
      emoji: "🏋️",
      title: "AI Workout Planner",
      desc: "Generate custom workout programs matched to your recovery level, goals, and equipment. Every plan is unique to you.",
      accent: "#6B94E8",
    },
  ];

  const testimonials = [
    {
      quote: "Finally an app that connects my blood work, workouts, and sleep into one coherent health picture. I dropped 8kg in 3 months using the AI suggestions.",
      name: "Arjun Mehta",
      role: "Software Engineer · Delhi",
      avatar: "A",
      color: "#CADB00",
    },
    {
      quote: "The biomarker analysis blew my mind. It caught my borderline iron deficiency before my doctor did. I feel like I have a personal health analyst in my pocket.",
      name: "Priya Sharma",
      role: "Fitness Enthusiast · Mumbai",
      avatar: "P",
      color: "#D95F78",
    },
    {
      quote: "I've tried 20 fitness apps. Resonate is the only one that feels like it truly understands my body. The HRV tracking alone changed how I train.",
      name: "Rahul Singh",
      role: "Marathon Runner · Bangalore",
      avatar: "R",
      color: "#7C6FCD",
    },
  ];

  return (
    <div
      style={{
        background: "linear-gradient(155deg, #F0F7E0 0%, #EBF2F8 40%, #F5EFF8 75%, #EEF5E0 100%)",
        minHeight: "100vh",
        overflowX: "hidden",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* ── Global Styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900;1,9..40,400&family=DM+Serif+Display&display=swap');

        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-24px) scale(1.04); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-16px) rotate(4deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes marqueeR {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulse-lime {
          0%, 100% { box-shadow: 0 0 0 0 rgba(202,219,0,0.5); }
          50%       { box-shadow: 0 0 0 16px rgba(202,219,0,0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes blob {
          0%,100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          25%  { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
          50%  { border-radius: 50% 60% 30% 60% / 30% 40% 70% 60%; }
          75%  { border-radius: 60% 40% 70% 30% / 40% 70% 30% 50%; }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .hero-title {
          font-family: 'DM Serif Display', serif;
          font-weight: 400;
          line-height: 1.05;
          letter-spacing: -0.02em;
        }
        .lime-shine {
          background: linear-gradient(90deg, #CADB00, #E8F200, #CADB00);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
        .cta-primary {
          background: #CADB00;
          color: #1A1A18;
          border: none;
          border-radius: 16px;
          padding: 16px 32px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 8px 24px rgba(202,219,0,0.40);
          font-family: 'DM Sans', sans-serif;
        }
        .cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(202,219,0,0.55);
        }
        .cta-secondary {
          background: rgba(255,255,255,0.65);
          color: rgba(26,26,24,0.70);
          border: 1.5px solid rgba(26,26,24,0.12);
          border-radius: 16px;
          padding: 14px 28px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          backdrop-filter: blur(8px);
          font-family: 'DM Sans', sans-serif;
        }
        .cta-secondary:hover {
          background: rgba(255,255,255,0.90);
          transform: translateY(-1px);
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          padding: "0 24px",
          height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: navScrolled ? "rgba(240,247,224,0.90)" : "transparent",
          backdropFilter: navScrolled ? "blur(16px)" : "none",
          borderBottom: navScrolled ? "1px solid rgba(26,26,24,0.08)" : "none",
          transition: "all 0.3s ease",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "#CADB00",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(202,219,0,0.40)",
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="#1A1A18" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span style={{ fontSize: 17, fontWeight: 700, color: "#1A1A18", fontFamily: "'DM Sans', sans-serif" }}>
            Resonate
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link to="/login" className="cta-secondary" style={{ padding: "8px 20px", fontSize: 14 }}>
            Sign in
          </Link>
          <Link to="/register" className="cta-primary" style={{ padding: "9px 20px", fontSize: 14 }}>
            Get started
          </Link>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 80, paddingBottom: 60, overflow: "hidden" }}>

        {/* Background animated orbs */}
        <Orb duration="8s" delay="0s" style={{
          width: 500, height: 500,
          background: "radial-gradient(circle, rgba(202,219,0,0.18) 0%, transparent 70%)",
          top: -100, left: -180,
          animation: "blob 12s ease-in-out infinite",
        }} />
        <Orb duration="10s" delay="2s" style={{
          width: 400, height: 400,
          background: "radial-gradient(circle, rgba(124,111,205,0.12) 0%, transparent 70%)",
          bottom: 50, right: -120,
          animation: "blob 14s ease-in-out infinite reverse",
        }} />
        <Orb duration="7s" delay="1s" style={{
          width: 300, height: 300,
          background: "radial-gradient(circle, rgba(217,95,120,0.10) 0%, transparent 70%)",
          top: "40%", right: "5%",
          animation: "float 9s ease-in-out infinite",
        }} />

        {/* Floating pill badge */}
        <div
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "8px 18px", borderRadius: 9999,
            background: "rgba(202,219,0,0.12)",
            border: "1.5px solid rgba(202,219,0,0.35)",
            marginBottom: 28,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "none" : "translateY(12px)",
            transition: "all 0.7s ease",
          }}
        >
          <span style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#CADB00",
            display: "inline-block",
            animation: "pulse-lime 2s ease infinite",
          }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#3D4000", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            AI-Powered Health Intelligence
          </span>
        </div>

        {/* Hero headline */}
        <h1
          className="hero-title"
          style={{
            fontSize: "clamp(52px, 10vw, 96px)",
            textAlign: "center",
            maxWidth: 900,
            padding: "0 24px",
            color: "#1A1A18",
            marginBottom: 0,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "none" : "translateY(24px)",
            transition: "all 0.8s ease 0.1s",
          }}
        >
          Your body speaks.{" "}
          <span className="lime-shine">We translate.</span>
        </h1>

        {/* Sub headline */}
        <p
          style={{
            fontSize: "clamp(16px, 2.5vw, 20px)",
            textAlign: "center",
            maxWidth: 560,
            color: "rgba(26,26,24,0.55)",
            lineHeight: 1.65,
            padding: "0 24px",
            marginTop: 24,
            marginBottom: 44,
            opacity: mounted ? 1 : 0,
            transition: "all 0.8s ease 0.2s",
          }}
        >
          Resonate connects your blood work, workouts, sleep, and nutrition into one intelligent health OS — powered by AI that learns you.
        </p>

        {/* CTAs */}
        <div
          style={{
            display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center",
            padding: "0 24px",
            opacity: mounted ? 1 : 0,
            transform: mounted ? "none" : "translateY(16px)",
            transition: "all 0.8s ease 0.3s",
          }}
        >
          <Link to="/register" className="cta-primary" style={{ fontSize: 17, padding: "17px 36px" }}>
            Start for free
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link to="/demo-report" className="cta-secondary" style={{ fontSize: 16, padding: "15px 28px" }}>
            <span style={{ fontSize: 18 }}>🔬</span>
            See a demo report
          </Link>
        </div>

        {/* Social proof mini bar */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: 0,
            marginTop: 56,
            opacity: mounted ? 1 : 0,
            transition: "all 0.8s ease 0.4s",
          }}
        >
          {[
            { val: 10000, suffix: "+", label: "Active users" },
            { val: 50000, suffix: "+", label: "Reports analyzed" },
            { val: 4.8, suffix: "★", label: "App rating", static: true },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <div style={{ width: 1, height: 48, background: "rgba(26,26,24,0.10)", margin: "0 28px" }} />}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#1A1A18", lineHeight: 1, fontFamily: "'DM Serif Display', serif" }}>
                  {s.static ? s.val + s.suffix : <><Counter target={s.val} />{s.suffix}</>}
                </div>
                <div style={{ fontSize: 12, color: "rgba(26,26,24,0.45)", marginTop: 4 }}>{s.label}</div>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Scroll indicator */}
        <div style={{ position: "absolute", bottom: 30, left: "50%", transform: "translateX(-50%)", animation: "float 2.5s ease-in-out infinite" }}>
          <svg width="24" height="24" fill="none" stroke="rgba(26,26,24,0.30)" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── MARQUEE BAND ── */}
      <section style={{ padding: "28px 0", background: "rgba(255,255,255,0.30)", borderTop: "1px solid rgba(26,26,24,0.05)", borderBottom: "1px solid rgba(26,26,24,0.05)" }}>
        <div style={{ marginBottom: 12 }}><Marquee /></div>
        <Marquee reverse />
      </section>

      {/* ── FEATURES GRID ── */}
      <section style={{ padding: "100px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ display: "inline-block", padding: "6px 16px", borderRadius: 9999, background: "rgba(124,111,205,0.10)", color: "#4A3D8F", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>
            Everything you need
          </div>
          <h2 className="hero-title" style={{ fontSize: "clamp(36px, 6vw, 56px)", color: "#1A1A18", marginBottom: 16 }}>
            Built for the{" "}
            <span className="lime-shine">obsessively healthy</span>
          </h2>
          <p style={{ fontSize: 17, color: "rgba(26,26,24,0.55)", maxWidth: 560, margin: "0 auto", lineHeight: 1.65 }}>
            Every feature is designed around one idea: understanding your body deeply and acting on it intelligently.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={`${i * 0.08}s`} />
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{
        borderRadius: 32,
        background: "rgba(255,255,255,0.65)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1.5px solid rgba(255,255,255,0.80)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
        padding: "64px 48px",
        maxWidth: 1200,
        margin: "0 auto 100px",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          {/* Left: visual */}
          <div style={{ position: "relative" }}>
            {/* Big lime circle */}
            <div style={{
              width: 300, height: 300, borderRadius: "50%",
              background: "rgba(202,219,0,0.10)",
              position: "absolute", top: -40, left: -40,
              animation: "blob 10s ease-in-out infinite",
            }} />
            {/* Dashboard mockup card */}
            <div style={{
              position: "relative", zIndex: 1,
              background: "rgba(255,255,255,0.90)",
              borderRadius: 24, padding: 24,
              boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
              border: "1px solid rgba(255,255,255,0.90)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#CADB00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>A</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1A1A18" }}>Arjun's Health OS</div>
                  <div style={{ fontSize: 11, color: "rgba(26,26,24,0.45)" }}>Updated 2 min ago</div>
                </div>
                <div style={{ marginLeft: "auto", padding: "4px 10px", background: "rgba(202,219,0,0.15)", borderRadius: 9999, fontSize: 11, fontWeight: 700, color: "#3D4000" }}>
                  Score: 82
                </div>
              </div>
              {/* Mini metric rows */}
              {[
                { label: "HRV", val: "58 ms", color: "#CADB00", pct: 72 },
                { label: "Sleep", val: "7.4 hrs", color: "#7C6FCD", pct: 87 },
                { label: "Recovery", val: "91%", color: "#34C759", pct: 91 },
              ].map(m => (
                <div key={m.label} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: "rgba(26,26,24,0.55)" }}>{m.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#1A1A18" }}>{m.val}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 9999, background: "rgba(26,26,24,0.06)" }}>
                    <div style={{ height: "100%", width: `${m.pct}%`, borderRadius: 9999, background: m.color, transition: "width 1s ease" }} />
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 20, padding: "12px 14px", borderRadius: 14, background: "rgba(202,219,0,0.08)", border: "1px solid rgba(202,219,0,0.20)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#3D4000", marginBottom: 4 }}>💡 AI Insight</div>
                <div style={{ fontSize: 12, color: "rgba(26,26,24,0.60)", lineHeight: 1.5 }}>Your HRV is 12% above your 30-day average — great day to push a hard workout.</div>
              </div>
            </div>
          </div>

          {/* Right: steps */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#3D4000", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>How it works</div>
            <h2 className="hero-title" style={{ fontSize: "clamp(30px, 4vw, 44px)", color: "#1A1A18", marginBottom: 40 }}>
              From data to{" "}
              <span className="lime-shine">decisions</span>
              {" "}in seconds
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              <Step num="1" title="Connect your data" desc="Sync Google Fit, upload lab reports, or log meals manually. Resonate ingests everything." accent="#CADB00" />
              <Step num="2" title="AI processes everything" desc="Our intelligence layer correlates your sleep, biomarkers, nutrition, and activity into a coherent story." accent="#7C6FCD" />
              <Step num="3" title="Act on smart insights" desc="Get personalized recommendations, anomaly alerts, and experiment ideas — not generic advice." accent="#E07A3A" />
            </div>
            <div style={{ marginTop: 40 }}>
              <Link to="/register" className="cta-primary">
                Start your journey →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: "100px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <h2 className="hero-title" style={{ fontSize: "clamp(32px, 5vw, 50px)", color: "#1A1A18", marginBottom: 14 }}>
            Real results. Real people.
          </h2>
          <p style={{ fontSize: 16, color: "rgba(26,26,24,0.50)" }}>
            Join thousands who've transformed their health with Resonate.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {testimonials.map(t => <Testimonial key={t.name} {...t} />)}
        </div>
      </section>

      {/* ── BIG CTA BANNER ── */}
      <section style={{ padding: "0 24px 100px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{
          borderRadius: 36,
          background: "#1A1A18",
          padding: "72px 48px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Lime orb accents */}
          <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(202,219,0,0.15)", filter: "blur(60px)" }} />
          <div style={{ position: "absolute", bottom: -60, left: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(124,111,205,0.12)", filter: "blur(50px)" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 9999, background: "rgba(202,219,0,0.15)", border: "1px solid rgba(202,219,0,0.30)", marginBottom: 24 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#CADB00", display: "inline-block", animation: "pulse-lime 2s ease infinite" }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#CADB00", letterSpacing: "0.08em", textTransform: "uppercase" }}>Free forever for early users</span>
            </div>

            <h2 className="hero-title" style={{ fontSize: "clamp(36px, 6vw, 64px)", color: "#fff", marginBottom: 16, lineHeight: 1.05 }}>
              Ready to understand<br />
              <span style={{ color: "#CADB00" }}>your body?</span>
            </h2>
            <p style={{ fontSize: 18, color: "rgba(255,255,255,0.55)", maxWidth: 480, margin: "0 auto 40px", lineHeight: 1.6 }}>
              No credit card required. Set up in 2 minutes. Start seeing insights from day one.
            </p>

            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/register" className="cta-primary" style={{ fontSize: 17, padding: "17px 40px" }}>
                Create free account
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link to="/login" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "15px 28px", fontSize: 16, fontWeight: 600,
                color: "rgba(255,255,255,0.60)", textDecoration: "none",
                borderRadius: 16, border: "1.5px solid rgba(255,255,255,0.15)",
                transition: "all 0.2s ease",
                fontFamily: "'DM Sans', sans-serif",
              }}
                onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.40)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.60)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
              >
                Already have an account
              </Link>
            </div>

            {/* Trust badges */}
            <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 48, flexWrap: "wrap" }}>
              {["🔒 Private by design", "⚡ No ads, ever", "🤖 Real AI, no gimmicks", "❤️ Made with love"].map(b => (
                <span key={b} style={{ fontSize: 13, color: "rgba(255,255,255,0.40)", fontFamily: "'DM Sans', sans-serif" }}>{b}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: "32px 24px 48px", textAlign: "center", borderTop: "1px solid rgba(26,26,24,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#CADB00", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="#1A1A18" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#1A1A18", fontFamily: "'DM Sans', sans-serif" }}>Resonate</span>
        </div>
        <p style={{ fontSize: 13, color: "rgba(26,26,24,0.35)", fontFamily: "'DM Sans', sans-serif" }}>
          © 2026 Resonate Health. Built for the relentlessly curious.
        </p>
      </footer>
    </div>
  );
}
