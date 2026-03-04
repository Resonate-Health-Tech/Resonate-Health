import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Activity, Utensils, FlaskConical, User } from "lucide-react";

const BOTTOM_NAV_ITEMS = [
    { path: "/dashboard", label: "Home", icon: LayoutDashboard },
    { path: "/fitness", label: "Fitness", icon: Activity },
    { path: "/nutrition", label: "Food", icon: Utensils },
    { path: "/diagnostics", label: "Diagnostics", icon: FlaskConical },
    { path: "/profile", label: "Profile", icon: User },
];

/**
 * Mobile bottom navigation bar — visible only on screens < lg (1024px).
 * Styled to match the app design system (glass, lime accent).
 */
export default function BottomNav({ isActive }) {
    const location = useLocation();

    const checkActive = isActive || ((path) => {
        if (path === "/diagnostics")
            return location.pathname.startsWith("/biomarkers") || location.pathname === "/diagnostics";
        return location.pathname === path ||
            (path !== "/dashboard" && location.pathname.startsWith(path));
    });

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-30 lg:hidden"
            style={{
                background: "rgba(255,255,255,0.88)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderTop: "1px solid rgba(0,0,0,0.07)",
                boxShadow: "0 -4px 24px rgba(0,0,0,0.06)",
                paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }}
        >
            <div className="flex items-center justify-around px-2 py-1">
                {BOTTOM_NAV_ITEMS.map((item) => {
                    const active = checkActive(item.path);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-2xl min-w-[3.5rem] transition-all duration-150"
                            style={{
                                color: active ? "#5A6000" : "rgba(26,26,24,0.40)",
                                background: active ? "rgba(202,219,0,0.12)" : "transparent",
                                textDecoration: "none",
                            }}
                        >
                            <Icon
                                size={20}
                                strokeWidth={active ? 2 : 1.7}
                                style={{ flexShrink: 0 }}
                            />
                            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, letterSpacing: "0.01em" }}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
