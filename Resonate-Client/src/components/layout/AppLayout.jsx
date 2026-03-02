import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

/**
 * AppLayout — wraps all authenticated pages.
 * Provides the fixed sidebar (240px) + sticky topbar + scrollable main area.
 */
export default function AppLayout({ children }) {
    return (
        <div
            className="bg-app-gradient"
            style={{
                background: "linear-gradient(135deg, #EEF5E0 0%, #EAF0F8 45%, #F3EEF5 100%)",
                minHeight: "100vh",
            }}
        >
            {/* Fixed sidebar */}
            <Sidebar />

            {/* Main area pushed right of sidebar */}
            <div style={{ marginLeft: 240, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
                {/* Sticky topbar */}
                <Topbar />

                {/* Page content */}
                <main
                    style={{
                        flex: 1,
                        padding: "28px 32px 48px",
                        maxWidth: 1400,
                        width: "100%",
                    }}
                >
                    {children}
                </main>
            </div>
        </div>
    );
}
