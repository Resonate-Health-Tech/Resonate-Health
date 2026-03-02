import React from "react";
import { Link } from "react-router-dom";
import UserDropdown from "./UserDropdown";

/**
 * Desktop navigation with dropdown menus.
 */
export default function DesktopNav({
    user,
    isActive,
    isActiveGroup,
    userMenuOpen,
    setUserMenuOpen,
    onConnectGoogleFit,
    onLogout,
}) {
    return (
        <div className="hidden lg:flex items-center gap-8 text-sm">
            {user ? (
                <>
                    <Link
                        to="/dashboard"
                        className={`font-medium transition-colors flex items-center gap-2 ${isActive("/dashboard") ? "text-primary" : "text-slate-300 hover:text-slate-50"
                            }`}
                    >
                        Dashboard
                    </Link>


                    {/* Interventions Dropdown */}
                    <div className="relative group">
                        <button
                            className={`flex items-center gap-1.5 font-medium transition-colors ${isActiveGroup(["/interventions"]) ? "text-primary" : "text-slate-300 hover:text-slate-50"
                                }`}
                        >
                            Interventions
                            <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        <div className="absolute left-0 mt-4 w-48 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-20 transform translate-y-2 group-hover:translate-y-0">
                            <div className="p-2 space-y-1">
                                <Link to="/interventions" className="block px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition-colors">
                                    📋 My Plans
                                </Link>
                                <Link to="/interventions/suggest" className="block px-3 py-2 text-sm text-purple-400 hover:bg-slate-800 rounded-xl transition-colors">
                                    ✨ Get Suggestions
                                </Link>
                            </div>
                        </div>
                    </div>




                    {/* Nutrition Dropdown */}
                    <div className="relative group">
                        <button
                            className={`flex items-center gap-1.5 font-medium transition-colors ${isActiveGroup(["/nutrition"]) ? "text-primary" : "text-slate-300 hover:text-slate-50"
                                }`}
                        >
                            Nutrition
                            <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        <div className="absolute left-0 mt-4 w-48 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-20 transform translate-y-2 group-hover:translate-y-0">
                            <div className="p-2 space-y-1">
                                <Link to="/nutrition" className="block px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition-colors">
                                    🥗 Daily Plan
                                </Link>
                                <Link to="/meal-history" className="block px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition-colors">
                                    📜 Meal History
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Diagnosis Dropdown */}
                    <div className="relative group">
                        <button
                            className={`flex items-center gap-1.5 font-medium transition-colors ${isActiveGroup(["/biomarkers", "/demo-report"]) ? "text-primary" : "text-slate-300 hover:text-slate-50"
                                }`}
                        >
                            Diagnosis
                            <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        <div className="absolute left-0 mt-4 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-20 transform translate-y-2 group-hover:translate-y-0">
                            <div className="p-2 space-y-1">
                                <Link to="/biomarkers/latest" className="block px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition-colors">
                                    📊 Latest Diagnosis
                                </Link>
                                <Link to="/biomarkers/history" className="block px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition-colors">
                                    📂 Diagnosis History
                                </Link>
                                <div className="border-t border-slate-800 my-1"></div>
                                <Link to="/biomarkers/upload" className="block px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition-colors">
                                    📤 Upload PDF
                                </Link>
                                <Link to="/biomarkers/api" className="block px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition-colors">
                                    🔗 Fetch via API
                                </Link>

                                <div className="border-t border-slate-800 my-1"></div>
                                <Link to="/memories" className="block px-3 py-2 text-sm text-cyan-400 hover:bg-slate-800 rounded-xl transition-colors">
                                    🧠 My Memories
                                </Link>
                                <Link to="/demo-report" className="block px-3 py-2 text-sm text-emerald-400 hover:bg-slate-800 rounded-xl transition-colors">
                                    🧪 View Demo Report
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Coach Button */}
                    <Link
                        to="/get-coach"
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary/10 to-emerald-500/10 
                     border border-primary/30 text-primary font-semibold text-xs uppercase tracking-wide
                     hover:from-primary/20 hover:to-emerald-500/20 hover:border-primary/50 
                     active:scale-95 transition-all flex items-center gap-2"
                    >
                        <span className="text-base">🏋️</span>
                        Coach
                    </Link>

                    {/* Admin Link */}
                    {user?.email === import.meta.env.VITE_ADMIN_EMAIL && (
                        <Link
                            to="/admin/memory"
                            className={`font-medium transition-colors flex items-center gap-2 ${isActive("/admin/memory") ? "text-red-400" : "text-slate-300 hover:text-red-400"
                                }`}
                        >
                            🛡️ Admin
                        </Link>
                    )}

                    <div className="h-6 w-px bg-slate-800 mx-2"></div>

                    <UserDropdown
                        user={user}
                        isOpen={userMenuOpen}
                        onToggle={() => setUserMenuOpen(!userMenuOpen)}
                        onClose={() => setUserMenuOpen(false)}
                        onConnectGoogleFit={onConnectGoogleFit}
                        onLogout={onLogout}
                    />
                </>
            ) : (
                <div className="flex items-center gap-4">
                    <Link to="/login" className="px-5 py-2 rounded-xl text-slate-300 font-medium hover:text-white transition-colors">
                        Login
                    </Link>
                    <Link to="/register" className="px-5 py-2 rounded-xl bg-white text-slate-950 font-bold hover:bg-slate-200 transition-all active:scale-95">
                        Get Started
                    </Link>
                </div>
            )}
        </div>
    );
}

