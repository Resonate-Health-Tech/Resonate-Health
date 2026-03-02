import React, { useState } from "react";

/**
 * Profile edit form with all profile fields.
 */
export default function ProfileForm({ profile, onSave, saving, message, onChange }) {
    const [focusedField, setFocusedField] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave();
    };

    return (
        <div className="glass-card rounded-3xl p-6 border-primary/20">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Field */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-300">Full Name</label>
                    <input
                        type="text"
                        className={`w-full rounded-2xl bg-slate-950/50 border-2 px-4 py-3.5 text-base text-slate-50
                      placeholder:text-slate-600 transition-all duration-200 focus:outline-none
                      ${focusedField === "name"
                                ? "border-primary shadow-lg shadow-primary/10"
                                : "border-slate-700/50 hover:border-slate-600"
                            }`}
                        value={profile.name}
                        onChange={(e) => onChange("name", e.target.value)}
                        onFocus={() => setFocusedField("name")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Enter your full name"
                    />
                </div>

                {/* Gender and Birth Date Row */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-300">Gender</label>
                        <select
                            className="w-full rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 px-4 py-3.5 
                       text-base text-slate-50 hover:border-slate-600 focus:border-primary focus:outline-none 
                       transition-all duration-200"
                            value={profile.gender}
                            onChange={(e) => onChange("gender", e.target.value)}
                        >
                            <option value="">Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-300">Birth Date</label>
                        <input
                            type="date"
                            max={new Date().toISOString().split("T")[0]}
                            className="w-full rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 px-4 py-3.5 
                       text-base text-slate-50 hover:border-slate-600 focus:border-primary focus:outline-none 
                       transition-all duration-200"
                            value={profile.dateOfBirth}
                            onChange={(e) => onChange("dateOfBirth", e.target.value)}
                        />
                    </div>
                </div>

                {/* Menstrual Tracking (Female Only) */}
                {profile.gender === "female" && (
                    <div className="bg-gradient-to-br from-primary/5 to-emerald-500/5 border border-primary/20 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center gap-2 mb-3">
                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm font-bold text-slate-300">Menstrual Cycle Tracking</p>
                        </div>

                        <input
                            type="number"
                            placeholder="Cycle length (days)"
                            min="21"
                            max="35"
                            className="w-full rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 px-4 py-3.5 
                       text-base text-slate-50 placeholder:text-slate-600 hover:border-slate-600 
                       focus:border-primary focus:outline-none transition-all duration-200"
                            value={profile.cycleLengthDays}
                            onChange={(e) => onChange("cycleLengthDays", e.target.value)}
                        />

                        <input
                            type="date"
                            max={new Date().toISOString().split("T")[0]}
                            className="w-full rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 px-4 py-3.5 
                       text-base text-slate-50 hover:border-slate-600 focus:border-primary focus:outline-none 
                       transition-all duration-200"
                            value={profile.lastPeriodDate}
                            onChange={(e) => onChange("lastPeriodDate", e.target.value)}
                        />

                        <select
                            className="w-full rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 px-4 py-3.5 
                       text-base text-slate-50 hover:border-slate-600 focus:border-primary focus:outline-none 
                       transition-all duration-200"
                            value={profile.menstrualPhase}
                            onChange={(e) => onChange("menstrualPhase", e.target.value)}
                        >
                            <option value="">Current phase</option>
                            <option value="follicular">Follicular</option>
                            <option value="ovulatory">Ovulatory</option>
                            <option value="luteal">Luteal</option>
                        </select>
                    </div>
                )}

                {/* Height and Weight Row */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-300">Height</label>
                        <div className="relative">
                            <input
                                type="number"
                                placeholder="Height"
                                min="100"
                                max="250"
                                className="w-full rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 pl-4 pr-12 py-3.5 
                         text-base text-slate-50 placeholder:text-slate-600 hover:border-slate-600 
                         focus:border-emerald-500 focus:outline-none transition-all duration-200"
                                value={profile.heightCm}
                                onChange={(e) => onChange("heightCm", e.target.value)}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">cm</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-300">Weight</label>
                        <div className="relative">
                            <input
                                type="number"
                                placeholder="Weight"
                                min="30"
                                max="200"
                                className="w-full rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 pl-4 pr-12 py-3.5 
                         text-base text-slate-50 placeholder:text-slate-600 hover:border-slate-600 
                         focus:border-emerald-500 focus:outline-none transition-all duration-200"
                                value={profile.weightKg}
                                onChange={(e) => onChange("weightKg", e.target.value)}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">kg</span>
                        </div>
                    </div>
                </div>

                {/* Diet Type */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-300">Diet Preference</label>
                    <select
                        className="w-full rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 px-4 py-3.5 
                     text-base text-slate-50 hover:border-slate-600 focus:border-emerald-500 
                     focus:outline-none transition-all duration-200"
                        value={profile.dietType}
                        onChange={(e) => onChange("dietType", e.target.value)}
                    >
                        <option value="">Select diet type</option>
                        <option value="vegetarian">🥗 Vegetarian</option>
                        <option value="eggetarian">🥚 Eggetarian</option>
                        <option value="non_vegetarian">🍗 Non-Vegetarian</option>
                    </select>
                </div>

                {/* Fitness Goal */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-300">Fitness Goal</label>
                    <textarea
                        placeholder="e.g., Lose 5kg in 3 months, Build muscle mass"
                        rows="3"
                        className="w-full rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 px-4 py-3.5 
                     text-base text-slate-50 placeholder:text-slate-600 hover:border-slate-600 
                     focus:border-primary focus:outline-none transition-all duration-200 resize-none"
                        value={profile.goal}
                        onChange={(e) => onChange("goal", e.target.value)}
                    />
                </div>

                {/* Medical Conditions Toggle */}
                <div className="bg-slate-950/50 border-2 border-slate-700/50 rounded-2xl p-4">
                    <label className="flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center gap-3">
                            <div className={`w-11 h-6 rounded-full transition-all duration-300 ${profile.hasMedicalCondition ? "bg-primary" : "bg-slate-700"}`}>
                                <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-all duration-300 ${profile.hasMedicalCondition ? "ml-5" : "ml-0.5"}`}></div>
                            </div>
                            <span className="text-sm font-semibold text-slate-300 group-hover:text-slate-100 transition-colors">
                                I have medical conditions
                            </span>
                        </div>
                        <input
                            type="checkbox"
                            className="sr-only"
                            checked={profile.hasMedicalCondition}
                            onChange={(e) => onChange("hasMedicalCondition", e.target.checked)}
                        />
                    </label>
                </div>

                {profile.hasMedicalCondition && (
                    <textarea
                        placeholder="List your medical conditions (e.g., diabetes, thyroid, hypertension)"
                        rows="3"
                        className="w-full rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 px-4 py-3.5 
                     text-base text-slate-50 placeholder:text-slate-600 hover:border-slate-600 
                     focus:border-red-400 focus:outline-none transition-all duration-200 resize-none"
                        value={profile.medicalConditions}
                        onChange={(e) => onChange("medicalConditions", e.target.value)}
                    />
                )}

                {/* Status Message */}
                {message && (
                    <div
                        className={`flex items-start gap-3 text-sm rounded-2xl px-4 py-3 border ${message.includes("successfully")
                            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                            : "text-red-400 bg-red-500/10 border-red-500/20"
                            }`}
                    >
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            {message.includes("successfully") ? (
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            ) : (
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            )}
                        </svg>
                        <span className="leading-relaxed">{message}</span>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={saving}
                    className="w-full relative py-4 px-6 rounded-2xl bg-gradient-to-r from-primary to-emerald-500 
                   text-slate-950 font-bold overflow-hidden shadow-lg shadow-primary/25
                   hover:shadow-xl hover:shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed
                   active:scale-[0.98] transition-all duration-200 group"
                >
                    {!saving && (
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent 
                           translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></span>
                    )}

                    <span className="relative flex items-center justify-center gap-2">
                        {saving ? (
                            <>
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving Changes...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                                Save Changes
                            </>
                        )}
                    </span>
                </button>
            </form>
        </div>
    );
}

