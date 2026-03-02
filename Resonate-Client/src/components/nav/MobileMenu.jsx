import React from "react";
import { Link } from "react-router-dom";

/**
 * Mobile slide-out menu.
 */
export default function MobileMenu({
    isOpen,
    onClose,
    user,
    onConnectGoogleFit,
    onLogout,
}) {
    if (!isOpen) return null;

    const getInitials = () => {
        if (!user?.displayName) return "U";
        return user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    };

    return (
        <div className="fixed inset-0 z-50 lg:hidden">
            <div
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
                onClick={onClose}
            ></div>

            <div className="absolute top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-slate-900 border-l border-slate-800 shadow-2xl animate-slideLeft flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg">
                            {getInitials()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-bold text-slate-50 truncate w-32">{user?.displayName || "Menu"}</p>
                            <p className="text-xs text-slate-500">{user?.email || "Guest"}</p>
                        </div>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="overflow-y-auto flex-1 p-4 space-y-6">
                    {user ? (
                        <>
                            {/* Navigation */}
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">Navigation</p>
                                <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-800/50 text-slate-200">
                                    <span>🏠</span> Dashboard
                                </Link>
                                {user?.email === import.meta.env.VITE_ADMIN_EMAIL && (
                                    <Link to="/admin/memory" className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-800/50 text-red-300 border border-red-900/30">
                                        <span>🛡️</span> Admin Panel
                                    </Link>
                                )}
                            </div>

                            {/* Fitness */}
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">Fitness</p>
                                <div className="bg-slate-800/30 rounded-2xl overflow-hidden">
                                    <Link to="/get-coach" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-emerald-400 font-medium">
                                        <span>🏋️</span> Book Coach
                                    </Link>
                                </div>
                            </div>

                            {/* Diet */}
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">Diet</p>
                                <div className="bg-slate-800/30 rounded-2xl overflow-hidden">
                                    <Link to="/nutrition" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-slate-300 font-medium">
                                        <span>🥗</span> Daily Plan
                                    </Link>
                                </div>
                            </div>

                            {/* Health Data */}
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">Health Data</p>
                                <div className="bg-slate-800/30 rounded-2xl overflow-hidden">
                                    <Link to="/biomarkers/latest" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-slate-300 border-b border-slate-800/50">
                                        <span>📊</span> Latest Report
                                    </Link>
                                    <Link to="/biomarkers/upload" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-slate-300 border-b border-slate-800/50">
                                        <span>📤</span> Upload New
                                    </Link>
                                    <Link to="/memories" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-slate-300 border-b border-slate-800/50">
                                        <span>🧠</span> My Memories
                                    </Link>
                                    <Link to="/demo-report" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-800 text-purple-400">
                                        <span>🧪</span> View Demo
                                    </Link>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-3">
                            <Link to="/login" className="block w-full text-center py-3 rounded-xl border border-slate-700 text-slate-300 font-bold">
                                Login
                            </Link>
                            <Link to="/register" className="block w-full text-center py-3 rounded-xl bg-primary text-slate-950 font-bold">
                                Register
                            </Link>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {user && (
                    <div className="p-4 border-t border-slate-800 bg-slate-900 shrink-0 space-y-2">
                        <Link to="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                            <span>👤</span> Profile Settings
                        </Link>

                        {/* Fitness Sync Section */}
                        <div className="space-y-1">
                            <p className="px-4 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">Sync Fitness</p>
                            <button
                                onClick={onConnectGoogleFit}
                                className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors text-left"
                            >
                                <span>🏃</span> Google Fit
                            </button>
                            <button
                                disabled
                                className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-slate-700 cursor-not-allowed text-left"
                            >
                                <span>🍎</span> Apple Health <span className="ml-auto text-[10px] text-slate-600 border border-slate-800 px-1.5 py-0.5 rounded">iOS Only</span>
                            </button>
                        </div>

                        <div className="border-t border-slate-800 pt-2">
                            <button
                                onClick={onLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors text-left"
                            >
                                <span>🚪</span> Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

