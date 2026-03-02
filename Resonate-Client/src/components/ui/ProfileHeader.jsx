import React from "react";

/**
 * Profile header with welcome message and user avatar.
 */
export default function ProfileHeader({ name, email }) {
    const initial = (name || "U").charAt(0).toUpperCase();

    return (
        <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
                <p className="text-sm font-semibold text-primary mb-1 shimmer">Welcome back,</p>
                <h1 className="text-4xl font-black mb-1">
                    <span className="gradient-text">{name || "User"}</span>
                </h1>
                <p className="text-sm text-slate-400">{email}</p>
            </div>

            <div className="relative float">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-emerald-500 rounded-2xl blur-xl opacity-50 pulse-glow"></div>
                <div
                    className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 
                    flex items-center justify-center text-2xl font-black text-slate-950 shadow-premium
                    hover:scale-110 transition-transform duration-300"
                >
                    {initial}
                </div>
            </div>
        </div>
    );
}

