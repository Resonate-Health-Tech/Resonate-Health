import React from "react";

/**
 * Read-only profile display when not in edit mode.
 */
export default function ProfileDisplay({ profile }) {
    return (
        <div className="space-y-3">
            <div className="glass-card rounded-2xl p-5 hover:border-primary/30 transition-all duration-300">
                <h3 className="text-sm font-bold text-primary mb-4 uppercase tracking-wide">
                    Personal Information
                </h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-slate-400">Gender</span>
                        <span className="text-sm font-semibold text-slate-50 capitalize">
                            {profile.gender || "Not set"}
                        </span>
                    </div>
                    <div className="h-px bg-slate-800"></div>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-slate-400">Date of Birth</span>
                        <span className="text-sm font-semibold text-slate-50">
                            {profile.dateOfBirth || "Not set"}
                        </span>
                    </div>
                    <div className="h-px bg-slate-800"></div>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-slate-400">Diet Type</span>
                        <span className="text-sm font-semibold text-slate-50 capitalize">
                            {profile.dietType?.replace("_", " ") || "Not set"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Medical Conditions Card */}
            {profile.hasMedicalCondition && profile.medicalConditions && (
                <div className="glass-card border-red-500/30 rounded-2xl p-5 hover:border-red-500/50 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                        <h3 className="text-sm font-bold text-red-400">Medical Conditions</h3>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{profile.medicalConditions}</p>
                </div>
            )}
        </div>
    );
}

