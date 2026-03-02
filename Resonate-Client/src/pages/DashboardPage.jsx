import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../App";
import { getWithCookie, putWithCookie } from "../api";
import {
  User, Mail, Scale, Ruler, Calendar, Target, Heart,
  Edit3, Check, X, ChevronRight, Dumbbell, Leaf, AlertCircle,
} from "lucide-react";

// ─── STYLE CONSTANTS ───────────────────────────────────────────────────────────
const GLASS = {
  background: "rgba(255,255,255,0.75)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.60)",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.05)",
};
const SERIF = { fontFamily: "'DM Serif Display', serif", fontWeight: 400 };
const SANS = { fontFamily: "'DM Sans', sans-serif" };

const C = {
  lime: "#CADB00",
  dark: "#1A1A18",
  muted: "rgba(26,26,24,0.45)",
  faint: "rgba(26,26,24,0.06)",
  border: "rgba(26,26,24,0.08)",
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function calculateAge(dob) {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function calculateBMI(h, w) {
  if (!h || !w) return null;
  return (w / ((h / 100) ** 2)).toFixed(1);
}

function getBMILabel(bmi) {
  if (!bmi) return null;
  if (bmi < 18.5) return { label: "Underweight", color: "#6B94E8" };
  if (bmi < 25) return { label: "Normal", color: "#34C759" };
  if (bmi < 30) return { label: "Overweight", color: "#F59E42" };
  return { label: "Obese", color: "#EF4444" };
}

// ─── SUB-COMPONENTS ────────────────────────────────────────────────────────────

function FieldRow({ icon: Icon, label, value }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "14px 0", borderBottom: `1px solid ${C.border}`,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: "rgba(202,219,0,0.10)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon size={16} strokeWidth={1.7} color={C.lime} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 2, ...SANS }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 500, color: C.dark, ...SANS, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {value || <span style={{ color: C.muted }}>Not set</span>}
        </div>
      </div>
    </div>
  );
}

function EditField({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em", ...SANS }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const INPUT_STYLE = {
  width: "100%", padding: "10px 14px",
  borderRadius: 10, border: `1px solid ${C.border}`,
  background: "rgba(255,255,255,0.80)",
  fontSize: 14, color: C.dark,
  outline: "none",
  fontFamily: "'DM Sans', sans-serif",
  boxSizing: "border-box",
};

const SELECT_STYLE = { ...INPUT_STYLE, cursor: "pointer" };

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useContext(AuthContext);

  const [profile, setProfile] = useState({
    email: user?.email || "",
    name: "",
    gender: "",
    dateOfBirth: "",
    heightCm: "",
    weightKg: "",
    dietType: "",
    goal: "",
    hasMedicalCondition: false,
    medicalConditions: "",
    cycleLengthDays: "",
    lastPeriodDate: "",
    menstrualPhase: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [editMode, setEditMode] = useState(false);

  const loadProfile = async () => {
    try {
      const data = await getWithCookie("/api/user/profile");
      const u = data.user;
      setProfile({
        email: u.email || user?.email || "",
        name: u.name ?? "",
        gender: u.gender ?? "",
        dateOfBirth: u.dateOfBirth ? u.dateOfBirth.slice(0, 10) : "",
        heightCm: u.heightCm ?? "",
        weightKg: u.weightKg ?? "",
        dietType: u.dietType ?? "",
        goal: u.goals ?? "",
        hasMedicalCondition: u.hasMedicalCondition ?? false,
        medicalConditions: (u.medicalConditions || []).join(", "),
        cycleLengthDays: u.menstrualProfile?.cycleLengthDays ?? "",
        lastPeriodDate: u.menstrualProfile?.lastPeriodDate
          ? u.menstrualProfile.lastPeriodDate.slice(0, 10) : "",
        menstrualPhase: u.menstrualProfile?.phase ?? "",
      });
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  const handleChange = (field, value) =>
    setProfile(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const payload = {
        name: profile.name || null,
        gender: profile.gender || null,
        dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth) : null,
        heightCm: profile.heightCm ? Number(profile.heightCm) : null,
        weightKg: profile.weightKg ? Number(profile.weightKg) : null,
        dietType: profile.dietType || null,
        goals: profile.goal || null,
        hasMedicalCondition: profile.hasMedicalCondition,
        medicalConditions: profile.hasMedicalCondition
          ? profile.medicalConditions.split(",").map(c => c.trim()).filter(Boolean)
          : [],
      };
      if (profile.gender === "female") {
        payload.menstrualProfile = {};
        if (profile.cycleLengthDays) payload.menstrualProfile.cycleLengthDays = Number(profile.cycleLengthDays);
        if (profile.lastPeriodDate) payload.menstrualProfile.lastPeriodDate = new Date(profile.lastPeriodDate);
        if (profile.menstrualPhase) payload.menstrualProfile.phase = profile.menstrualPhase;
      }
      await putWithCookie("/api/user/profile", payload);
      setMessage("Profile updated successfully");
      setEditMode(false);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setMessage("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const displayName = profile.name || user?.displayName || user?.email?.split("@")[0] || "User";
  const avatarChar = displayName[0]?.toUpperCase() || "U";
  const age = calculateAge(profile.dateOfBirth);
  const bmi = calculateBMI(profile.heightCm, profile.weightKg);
  const bmiMeta = getBMILabel(bmi);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          border: "3px solid rgba(202,219,0,0.20)", borderTopColor: C.lime,
          animation: "spin 0.8s linear infinite",
        }} />
        <p style={{ fontSize: 13, color: C.muted, ...SANS }}>Loading profile…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, ...SANS }}>
      <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
                .profile-card { animation: fadeIn 0.3s ease; }
                .profile-input:focus { border-color: #CADB00 !important; box-shadow: 0 0 0 3px rgba(202,219,0,0.15) !important; }
                .edit-btn:hover { background: rgba(202,219,0,0.15) !important; }
                .save-btn:hover { opacity: 0.88 !important; }
                .cancel-btn:hover { background: rgba(26,26,24,0.08) !important; }
            `}</style>

      {/* ── Header Card ── */}
      <div className="profile-card" style={{ ...GLASS, borderRadius: 24, padding: 28, marginBottom: 20, display: "flex", alignItems: "center", gap: 20 }}>
        {/* Avatar */}
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: C.lime, color: C.dark,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, fontWeight: 700, flexShrink: 0,
          boxShadow: "0 4px 16px rgba(202,219,0,0.30)",
          ...SERIF,
        }}>
          {avatarChar}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.dark, margin: "0 0 4px", ...SANS, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {displayName}
          </h1>
          <p style={{ fontSize: 13, color: C.muted, margin: "0 0 10px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {profile.email}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {age && (
              <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 9999, background: "rgba(202,219,0,0.12)", color: "#3D4000", fontWeight: 600 }}>
                {age} yrs
              </span>
            )}
            {profile.gender && (
              <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 9999, background: "rgba(124,111,205,0.10)", color: "#4A3D8F", fontWeight: 600, textTransform: "capitalize" }}>
                {profile.gender}
              </span>
            )}
            {bmi && bmiMeta && (
              <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 9999, background: `${bmiMeta.color}18`, color: bmiMeta.color, fontWeight: 600 }}>
                BMI {bmi} · {bmiMeta.label}
              </span>
            )}
          </div>
        </div>

        {/* Edit toggle */}
        {!editMode ? (
          <button className="edit-btn" onClick={() => setEditMode(true)} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 10,
            background: "rgba(202,219,0,0.10)", border: "none",
            color: "#3D4000", fontSize: 13, fontWeight: 600,
            cursor: "pointer", transition: "background 0.15s", flexShrink: 0,
            ...SANS,
          }}>
            <Edit3 size={14} strokeWidth={2} /> Edit
          </button>
        ) : (
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button className="cancel-btn" onClick={() => { setEditMode(false); loadProfile(); }} style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "8px 14px", borderRadius: 10,
              background: "transparent", border: `1px solid ${C.border}`,
              color: C.muted, fontSize: 13, fontWeight: 600,
              cursor: "pointer", transition: "background 0.15s",
              ...SANS,
            }}>
              <X size={14} strokeWidth={2} /> Cancel
            </button>
            <button className="save-btn" onClick={handleSave} disabled={saving} style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "8px 16px", borderRadius: 10,
              background: C.lime, border: "none",
              color: C.dark, fontSize: 13, fontWeight: 700,
              cursor: "pointer", transition: "opacity 0.15s",
              ...SANS,
            }}>
              <Check size={14} strokeWidth={2.5} />
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        )}
      </div>

      {/* Success/error message */}
      {message && (
        <div style={{
          ...GLASS, borderRadius: 12, padding: "12px 16px", marginBottom: 16,
          display: "flex", alignItems: "center", gap: 8,
          borderLeft: `3px solid ${message.includes("success") ? "#34C759" : "#EF4444"}`,
          fontSize: 13, color: C.dark, ...SANS,
        }}>
          {message.includes("success") ? <Check size={14} color="#34C759" /> : <AlertCircle size={14} color="#EF4444" />}
          {message}
        </div>
      )}

      {/* ── Stats Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Height", value: profile.heightCm ? `${profile.heightCm} cm` : null, color: "#6B94E8", icon: Ruler },
          { label: "Weight", value: profile.weightKg ? `${profile.weightKg} kg` : null, color: "#E07A3A", icon: Scale },
          { label: "BMI", value: bmi, color: bmiMeta?.color || C.muted, icon: Heart },
          { label: "Age", value: age ? `${age} yrs` : null, color: "#7C6FCD", icon: Calendar },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="profile-card" style={{ ...GLASS, borderRadius: 16, padding: "16px 18px", textAlign: "center" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>
              <Icon size={15} strokeWidth={1.8} color={color} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: value ? C.dark : C.muted, ...SERIF }}>
              {value || "—"}
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2, ...SANS }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── Profile Details / Edit Form ── */}
      <div className="profile-card" style={{ ...GLASS, borderRadius: 24, padding: 28, marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: C.dark, margin: "0 0 4px", ...SANS }}>Profile Details</h2>
        <p style={{ fontSize: 12, color: C.muted, margin: "0 0 20px", ...SANS }}>
          {editMode ? "Update your personal information below." : "Your health and fitness profile."}
        </p>

        {!editMode ? (
          // ── Read view ──
          <div>
            <FieldRow icon={User} label="Full Name" value={profile.name} />
            <FieldRow icon={Mail} label="Email" value={profile.email} />
            <FieldRow icon={Calendar} label="Date of Birth" value={profile.dateOfBirth} />
            <FieldRow icon={Leaf} label="Diet Type" value={profile.dietType} />
            <FieldRow icon={Target} label="Goal" value={profile.goal} />
            {profile.hasMedicalCondition && (
              <FieldRow icon={AlertCircle} label="Medical Conditions" value={profile.medicalConditions} />
            )}
            {profile.gender === "female" && profile.menstrualPhase && (
              <FieldRow icon={Heart} label="Menstrual Phase" value={profile.menstrualPhase} />
            )}
          </div>
        ) : (
          // ── Edit view ──
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
              <EditField label="Full Name">
                <input className="profile-input" style={INPUT_STYLE}
                  value={profile.name} onChange={e => handleChange("name", e.target.value)}
                  placeholder="Your full name" />
              </EditField>
              <EditField label="Date of Birth">
                <input className="profile-input" type="date" style={INPUT_STYLE}
                  value={profile.dateOfBirth} onChange={e => handleChange("dateOfBirth", e.target.value)} />
              </EditField>
              <EditField label="Gender">
                <select className="profile-input" style={SELECT_STYLE}
                  value={profile.gender} onChange={e => handleChange("gender", e.target.value)}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </EditField>
              <EditField label="Diet Type">
                <select className="profile-input" style={SELECT_STYLE}
                  value={profile.dietType} onChange={e => handleChange("dietType", e.target.value)}>
                  <option value="">Select</option>
                  {["Omnivore", "Vegetarian", "Vegan", "Keto", "Paleo", "Mediterranean", "Other"]
                    .map(d => <option key={d} value={d.toLowerCase()}>{d}</option>)}
                </select>
              </EditField>
              <EditField label="Height (cm)">
                <input className="profile-input" type="number" style={INPUT_STYLE}
                  value={profile.heightCm} onChange={e => handleChange("heightCm", e.target.value)}
                  placeholder="e.g. 175" />
              </EditField>
              <EditField label="Weight (kg)">
                <input className="profile-input" type="number" style={INPUT_STYLE}
                  value={profile.weightKg} onChange={e => handleChange("weightKg", e.target.value)}
                  placeholder="e.g. 70" />
              </EditField>
            </div>

            <EditField label="Health Goal">
              <select className="profile-input" style={SELECT_STYLE}
                value={profile.goal} onChange={e => handleChange("goal", e.target.value)}>
                <option value="">Select a goal</option>
                {["Weight Loss", "Muscle Gain", "Improve Endurance", "Stress Reduction", "Better Sleep", "General Health"]
                  .map(g => <option key={g} value={g.toLowerCase().replace(/ /g, "_")}>{g}</option>)}
              </select>
            </EditField>

            <EditField label="Medical Conditions">
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: profile.hasMedicalCondition ? 10 : 0, cursor: "pointer" }}>
                <input type="checkbox" checked={profile.hasMedicalCondition}
                  onChange={e => handleChange("hasMedicalCondition", e.target.checked)}
                  style={{ accentColor: C.lime, width: 16, height: 16 }} />
                <span style={{ fontSize: 13, color: C.dark, ...SANS }}>I have a medical condition</span>
              </label>
              {profile.hasMedicalCondition && (
                <input className="profile-input" style={INPUT_STYLE}
                  value={profile.medicalConditions}
                  onChange={e => handleChange("medicalConditions", e.target.value)}
                  placeholder="e.g. Diabetes, Hypertension (comma-separated)" />
              )}
            </EditField>

            {profile.gender === "female" && (
              <div style={{ padding: "16px", borderRadius: 12, background: "rgba(202,219,0,0.07)", border: `1px solid rgba(202,219,0,0.18)`, marginBottom: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#3D4000", margin: "0 0 14px", textTransform: "uppercase", letterSpacing: "0.06em", ...SANS }}>
                  Menstrual Profile
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                  <EditField label="Cycle Length (days)">
                    <input className="profile-input" type="number" style={INPUT_STYLE}
                      value={profile.cycleLengthDays}
                      onChange={e => handleChange("cycleLengthDays", e.target.value)}
                      placeholder="e.g. 28" />
                  </EditField>
                  <EditField label="Last Period Date">
                    <input className="profile-input" type="date" style={INPUT_STYLE}
                      value={profile.lastPeriodDate}
                      onChange={e => handleChange("lastPeriodDate", e.target.value)} />
                  </EditField>
                </div>
                <EditField label="Phase">
                  <select className="profile-input" style={SELECT_STYLE}
                    value={profile.menstrualPhase}
                    onChange={e => handleChange("menstrualPhase", e.target.value)}>
                    <option value="">Select phase</option>
                    {["Menstrual", "Follicular", "Ovulation", "Luteal"]
                      .map(p => <option key={p} value={p.toLowerCase()}>{p}</option>)}
                  </select>
                </EditField>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Quick actions ── */}
      {!editMode && (
        <div className="profile-card" style={{ ...GLASS, borderRadius: 24, overflow: "hidden", marginBottom: 20 }}>
          <div style={{ padding: "18px 24px 4px" }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: C.dark, margin: 0, ...SANS }}>Quick Actions</h2>
          </div>
          {[
            { label: "View Fitness Dashboard", desc: "Metrics, workouts & activity", href: "/fitness", icon: Dumbbell, color: "#CADB00" },
            { label: "Log a Meal", desc: "Track today's nutrition", href: "/nutrition", icon: Leaf, color: "#34C759" },
            { label: "Check Diagnostics", desc: "Review your biomarkers", href: "/diagnostics", icon: Heart, color: "#7C6FCD" },
          ].map(({ label, desc, href, icon: Icon, color }) => (
            <a key={label} href={href} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "14px 24px", textDecoration: "none",
              borderTop: `1px solid ${C.border}`, transition: "background 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = C.faint}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={16} strokeWidth={1.7} color={color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.dark, ...SANS }}>{label}</div>
                <div style={{ fontSize: 12, color: C.muted, ...SANS }}>{desc}</div>
              </div>
              <ChevronRight size={16} strokeWidth={1.7} color={C.muted} />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
