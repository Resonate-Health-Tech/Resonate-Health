import React from "react";

/**
 * Current goal display card.
 */
export default function GoalCard({ goal }) {
    if (!goal) return null;

    return (
        <div
            className="relative glass-card rounded-2xl p-5 mb-6 overflow-hidden group
                hover:border-primary/50 transition-all duration-300 hover:shadow-premium"
        >
            {/* Animated gradient background */}
            <div
                className="absolute inset-0 bg-gradient-to-r from-primary/5 via-emerald-500/5 to-primary/5 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient"
            ></div>

            <div className="relative flex items-start gap-4">
                <div
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-emerald-500/20 
                    flex items-center justify-center flex-shrink-0 group-hover:scale-110 
                    transition-transform duration-300"
                >
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                        />
                    </svg>
                </div>
                <div className="flex-1">
                    <p className="text-xs font-bold text-primary mb-1.5 uppercase tracking-wide">Current Goal</p>
                    <p className="text-sm text-slate-200 leading-relaxed font-medium">{goal}</p>
                </div>
            </div>
        </div>
    );
}

