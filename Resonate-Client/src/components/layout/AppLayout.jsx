import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import BottomNav from "../nav/BottomNav";
import { useLocation } from "react-router-dom";

/**
 * AppLayout — wraps all authenticated pages.
 * Desktop: fixed 240px sidebar + sticky topbar + scrollable main area.
 * Mobile/Tablet (<1024px): hidden sidebar, hamburger in topbar, bottom nav bar.
 */
export default function AppLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const isActive = (path) =>
        path === "/diagnostics"
            ? location.pathname.startsWith("/biomarkers") || location.pathname === "/diagnostics"
            : location.pathname === path ||
            (path !== "/dashboard" && location.pathname.startsWith(path));

    return (
        <div
            style={{
                background: "linear-gradient(135deg, #EEF5E0 0%, #EAF0F8 45%, #F3EEF5 100%)",
                minHeight: "100vh",
            }}
        >
            {/* Desktop sidebar — hidden on mobile */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Mobile sidebar overlay (slide-in drawer) */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                    style={{ background: "rgba(26,26,24,0.35)", backdropFilter: "blur(2px)" }}
                />
            )}

            {/* Main area: on desktop pushed right of sidebar; on mobile full width */}
            <div
                className="lg:ml-60"
                style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
            >
                {/* Sticky topbar */}
                <Topbar onMenuOpen={() => setSidebarOpen(true)} />

                {/* Page content */}
                <main
                    className="flex-1 w-full"
                    style={{
                        padding: "clamp(16px, 3vw, 28px) clamp(16px, 3vw, 32px) clamp(48px, 6vw, 80px)",
                        maxWidth: 1400,
                    }}
                >
                    {children}
                </main>

                {/* Bottom navigation — mobile only */}
                <BottomNav isActive={isActive} />
            </div>
        </div>
    );
}
