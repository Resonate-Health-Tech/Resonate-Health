import React, { useContext } from "react";
import { Bell, Menu } from "lucide-react";
import { AuthContext } from "../../App";

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
}

function formatDate() {
    return new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
    });
}

export default function Topbar({ onMenuOpen }) {
    const { user, profile } = useContext(AuthContext);

    const firstName =
        profile?.name?.split(" ")[0] ||
        user?.displayName?.split(" ")[0] ||
        user?.email?.split("@")[0] ||
        "there";

    return (
        <header
            className="topbar-glass sticky top-0 z-40 flex items-center justify-between"
            style={{ height: 64 }}
        >
            {/* Left: hamburger (mobile only) + greeting */}
            <div className="flex items-center gap-3 px-4 lg:px-8">
                {/* Hamburger — visible only on mobile/tablet */}
                <button
                    onClick={onMenuOpen}
                    className="lg:hidden p-2 rounded-xl transition-colors"
                    style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(26,26,24,0.55)" }}
                    aria-label="Open menu"
                >
                    <Menu size={22} strokeWidth={1.7} />
                </button>

                <h1
                    style={{
                        fontSize: "clamp(15px, 2.2vw, 20px)",
                        fontWeight: 600,
                        color: "#1A1A18",
                        fontFamily: "'DM Sans', sans-serif",
                        margin: 0,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {getGreeting()}, {firstName} 👋
                </h1>
            </div>

            {/* Right: date pill + bell */}
            <div className="flex items-center gap-2 lg:gap-4 pr-4 lg:pr-8">
                {/* Date pill — hidden on small phones to save space */}
                <span
                    className="hidden sm:inline-block"
                    style={{
                        fontSize: 12,
                        padding: "6px 12px",
                        borderRadius: 9999,
                        background: "rgba(26,26,24,0.05)",
                        color: "rgba(26,26,24,0.45)",
                        whiteSpace: "nowrap",
                    }}
                >
                    {formatDate()}
                </span>

                {/* Bell */}
                <button
                    style={{
                        padding: 8,
                        borderRadius: 8,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        flexShrink: 0,
                    }}
                >
                    <Bell
                        size={18}
                        strokeWidth={1.7}
                        style={{ color: "rgba(26,26,24,0.40)" }}
                    />
                </button>
            </div>
        </header>
    );
}
