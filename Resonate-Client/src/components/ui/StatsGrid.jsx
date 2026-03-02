import React from "react";

/**
 * Stat card for showing a metric with icon.
 */
function StatCard({ icon, label, value, unit, colorClass = "primary", children }) {
    return (
        <div
            className={`glass-card rounded-3xl p-5 group hover:border-${colorClass}/50 hover:bg-white/10
                  transition-all duration-300 hover:scale-[1.02] hover:shadow-premium shimmer`}
        >
            <div className="flex items-start justify-between mb-3">
                <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br from-${colorClass}/20 to-${colorClass}/10 
                    flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                    {icon}
                </div>
            </div>
            <p className="text-xs text-slate-400 font-semibold mb-1 uppercase tracking-wide">{label}</p>
            {children || (
                <p className="text-3xl font-black text-slate-50">
                    {value || "--"}
                    {value && unit && <span className="text-sm font-normal text-slate-500 ml-1">{unit}</span>}
                </p>
            )}
        </div>
    );
}

/**
 * Grid of stat cards showing age, weight, BMI, height.
 */
export default function StatsGrid({ profile, calculateAge, calculateBMI, getBMICategory }) {
    const bmi = calculateBMI();
    const bmiInfo = getBMICategory(bmi);

    return (
        <div className="grid grid-cols-2 gap-3 mb-6">
            {/* Age Card */}
            <StatCard
                label="Age"
                value={calculateAge(profile.dateOfBirth)}
                unit={calculateAge(profile.dateOfBirth) !== "--" ? "yrs" : null}
                colorClass="primary"
                icon={
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                }
            />

            {/* Weight Card */}
            <StatCard
                label="Weight"
                value={profile.weightKg}
                unit="kg"
                colorClass="emerald-500"
                icon={
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                        />
                    </svg>
                }
            />

            {/* BMI Card */}
            <StatCard
                label="BMI"
                colorClass="purple-500"
                icon={
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        />
                    </svg>
                }
            >
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black text-slate-50">{bmi || "--"}</p>
                    {bmi && (
                        <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-${bmiInfo.color}-500/10 text-${bmiInfo.color}-400`}
                        >
                            {bmiInfo.label}
                        </span>
                    )}
                </div>
            </StatCard>

            {/* Height Card */}
            <StatCard
                label="Height"
                value={profile.heightCm}
                unit="cm"
                colorClass="amber-500"
                icon={
                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                        />
                    </svg>
                }
            />
        </div>
    );
}

