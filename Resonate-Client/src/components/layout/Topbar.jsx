import React, { useContext } from "react";
import { Bell } from "lucide-react";
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

export default function Topbar() {
    const { user } = useContext(AuthContext);

    const firstName =
        user?.displayName?.split(" ")[0] ||
        user?.email?.split("@")[0] ||
        "there";

    return (
        <header
            className="topbar-glass sticky top-0 z-40 flex items-center justify-between"
            style={{ height: 64 }}
        >
            {/* Left: greeting */}
            <div className="px-8">
                <h1
                    style={{
                        fontSize: 20,
                        fontWeight: 600,
                        color: "#1A1A18",
                        fontFamily: "'DM Sans', sans-serif",
                        margin: 0,
                    }}
                >
                    {getGreeting()}, {firstName} 👋
                </h1>
            </div>

            {/* Right: date + bell */}
            <div className="flex items-center gap-4 pr-8">
                {/* Date pill */}
                <span
                    style={{
                        fontSize: 12,
                        padding: "6px 12px",
                        borderRadius: 9999,
                        background: "rgba(26,26,24,0.05)",
                        color: "rgba(26,26,24,0.45)",
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
