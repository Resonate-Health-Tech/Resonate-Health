import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { AuthContext } from "../../App";
import {
    LayoutDashboard, Activity, Utensils, FlaskConical,
    Beaker, Brain, Sparkles, LogOut, ChevronRight, X,
} from "lucide-react";

const NAV_ITEMS = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/fitness", icon: Activity, label: "Fitness" },
    { path: "/nutrition", icon: Utensils, label: "Nutrition" },
    { path: "/diagnostics", icon: FlaskConical, label: "Diagnostics" },
    { path: "/interventions", icon: Beaker, label: "Experiments" },
    { path: "/memories", icon: Brain, label: "Memories" },
    { path: "/insights", icon: Sparkles, label: "Insights" },
];

export default function Sidebar({ isOpen, onClose }) {
    const { user, profile } = useContext(AuthContext);
    const location = useLocation();

    const isActive = (path) =>
        path === "/diagnostics"
            ? location.pathname.startsWith("/biomarkers") || location.pathname === "/diagnostics"
            : location.pathname === path ||
            (path !== "/dashboard" && location.pathname.startsWith(path));

    const handleLogout = async () => {
        await signOut(auth);
        sessionStorage.removeItem("verifiedUser");
    };

    const displayName = profile?.name || user?.displayName || user?.email?.split("@")[0] || "User";
    const firstName = displayName.split(" ")[0];
    const avatarChar = firstName[0]?.toUpperCase() || "U";

    const renderNavLink = ({ path, icon: Icon, label }) => {
        const active = isActive(path);
        return (
            <li key={path}>
                <Link
                    to={path}
                    onClick={onClose}
                    className="flex items-center gap-3 py-2.5 rounded-r-xl transition-all duration-150"
                    style={{
                        paddingLeft: active ? 29 : 16,
                        paddingRight: 16,
                        borderLeft: active ? "3px solid #CADB00" : "3px solid transparent",
                        background: active ? "rgba(202,219,0,0.12)" : "transparent",
                        color: active ? "#5A6000" : "rgba(26,26,24,0.45)",
                        textDecoration: "none",
                    }}
                    onMouseEnter={(e) => {
                        if (!active) {
                            e.currentTarget.style.color = "rgba(26,26,24,0.80)";
                            e.currentTarget.style.background = "rgba(26,26,24,0.05)";
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!active) {
                            e.currentTarget.style.color = "rgba(26,26,24,0.45)";
                            e.currentTarget.style.background = "transparent";
                        }
                    }}
                >
                    <Icon size={18} strokeWidth={1.7} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
                </Link>
            </li>
        );
    };

    const sidebarContent = (
        <aside
            className="sidebar-glass h-screen w-60 z-50 flex flex-col"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
            {/* ── Logo ── */}
            <div
                className="flex items-center px-5"
                style={{ height: 64, borderBottom: "1px solid rgba(26,26,24,0.08)" }}
            >
                <div
                    className="flex items-center justify-center flex-shrink-0 rounded-full"
                    style={{ width: 28, height: 28, background: "#CADB00" }}
                >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 2v10M2 7h10" stroke="#1A1A18" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </div>
                <span
                    style={{
                        marginLeft: 10,
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#1A1A18",
                        fontFamily: "'DM Sans', sans-serif",
                        flex: 1,
                    }}
                >
                    Resonate
                </span>
                {/* Close button — mobile only */}
                <button
                    onClick={onClose}
                    className="lg:hidden p-1 rounded-lg transition-colors"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(26,26,24,0.40)" }}
                    aria-label="Close menu"
                >
                    <X size={18} strokeWidth={1.7} />
                </button>
            </div>

            {/* ── Nav ── */}
            <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
                <div className="overline-label px-5 py-2">MAIN</div>
                <ul className="px-3 space-y-0.5">
                    {NAV_ITEMS.map(renderNavLink)}
                </ul>
            </nav>

            {/* ── Bottom: User + Logout ── */}
            <div className="p-5" style={{ borderTop: "1px solid rgba(26,26,24,0.08)" }}>
                <Link
                    to="/profile"
                    onClick={onClose}
                    className="flex items-center gap-2.5 mb-3 rounded-xl transition-all duration-150"
                    style={{ textDecoration: "none", padding: "6px 8px", margin: "-6px -8px 4px" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(202,219,0,0.10)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                    <div
                        className="rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                            width: 32, height: 32,
                            background: "#CADB00",
                            color: "#1A1A18",
                            fontSize: 13,
                            fontWeight: 700,
                        }}
                    >
                        {avatarChar}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p style={{ fontSize: 12, fontWeight: 600, color: "#1A1A18", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {firstName}
                        </p>
                        <p style={{ fontSize: 11, color: "rgba(26,26,24,0.45)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {user?.email}
                        </p>
                    </div>
                    <ChevronRight size={14} strokeWidth={1.7} style={{ color: "rgba(26,26,24,0.30)", flexShrink: 0 }} />
                </Link>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-xs transition-colors duration-150"
                    style={{ color: "rgba(26,26,24,0.40)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(26,26,24,0.65)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(26,26,24,0.40)"; }}
                >
                    <LogOut size={14} strokeWidth={1.7} />
                    Sign out
                </button>
            </div>
        </aside>
    );

    return (
        <>
            {/* Desktop: fixed sidebar */}
            <div className="hidden lg:block fixed left-0 top-0 h-screen">
                {sidebarContent}
            </div>

            {/* Mobile: slide-in drawer */}
            <div
                className={`fixed left-0 top-0 h-screen z-50 transition-transform duration-300 ease-in-out lg:hidden`}
                style={{ transform: isOpen ? "translateX(0)" : "translateX(-100%)" }}
            >
                {sidebarContent}
            </div>
        </>
    );
}
