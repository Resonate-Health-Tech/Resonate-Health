import React from "react";
import { Link } from "react-router-dom";

/**
 * Mobile bottom navigation bar.
 */
export default function BottomNav({ isActive, isActiveGroup }) {
    const bottomNavItems = [
        {
            path: "/dashboard",
            label: "Home",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                </svg>
            ),
        },
        {
            path: "/fitness",
            label: "Fitness",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                </svg>
            ),
        },
        {
            path: "/nutrition",
            label: "Food",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                </svg>
            ),
        },
        {
            path: "/biomarkers/latest",
            label: "Diagnosis",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                </svg>
            ),
        },
        {
            path: "/profile",
            label: "Profile",
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                </svg>
            ),
        },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-lg">
            <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
                {bottomNavItems.map((item) => {
                    const active =
                        isActive(item.path) ||
                        (item.path === "/biomarkers/latest" && isActiveGroup(["/biomarkers"]));

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl min-w-[4rem] transition-all ${active ? "text-primary bg-primary/10" : "text-slate-400 hover:text-slate-300"
                                }`}
                        >
                            <span className={`transition-transform ${active ? "scale-110" : ""}`}>{item.icon}</span>
                            <span className="text-xs font-semibold">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

