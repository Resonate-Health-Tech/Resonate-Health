import React from "react";
import FormInput from "./FormInputs";
import { FormSelect } from "./FormInputs";

/**
 * Step 1: Account credentials (email & password).
 */
export function CredentialsStep({ form, updateField, focusedField, setFocusedField, showPassword, setShowPassword }) {
    return (
        <div className="space-y-5 animate-fadeIn">
            {/* Email */}
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">
                    Email address *
                </label>
                <FormInput
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="you@example.com"
                    fieldName="email"
                    focusedField={focusedField}
                    onFocus={setFocusedField}
                    onBlur={setFocusedField}
                    autoComplete="email"
                    icon={
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                    }
                />
            </div>

            {/* Password */}
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">
                    Password *
                </label>
                <div className="relative">
                    <FormInput
                        type={showPassword ? "text" : "password"}
                        required
                        value={form.password}
                        onChange={(e) => updateField("password", e.target.value)}
                        placeholder="Minimum 6 characters"
                        fieldName="password"
                        focusedField={focusedField}
                        onFocus={setFocusedField}
                        onBlur={setFocusedField}
                        autoComplete="new-password"
                        icon={
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        }
                        className="pr-12"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 active:scale-95 transition-all"
                    >
                        {showPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        )}
                    </button>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Use a strong password with letters and numbers
                </p>
            </div>
        </div>
    );
}


/**
 * Step 2: Personal details (name, gender, age, height, weight).
 */
export function PersonalDetailsStep({ form, updateField }) {
    const genderOptions = [
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
        { value: "other", label: "Other" },
    ];

    return (
        <div className="space-y-4 animate-fadeIn">
            <input
                type="text"
                required
                placeholder="Full Name *"
                className="w-full rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 px-4 py-3.5 text-base text-slate-50
                 placeholder:text-slate-600 hover:border-slate-600 focus:border-primary focus:outline-none
                 focus:shadow-lg focus:shadow-primary/10 transition-all duration-200"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
            />

            <div className="grid grid-cols-2 gap-3">
                <FormSelect
                    required
                    value={form.gender}
                    onChange={(e) => updateField("gender", e.target.value)}
                    placeholder="Gender *"
                    options={genderOptions}
                />

                <input
                    type="number"
                    required
                    placeholder="Age *"
                    min="10"
                    max="100"
                    className="rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 px-4 py-3.5 text-base text-slate-50
                   placeholder:text-slate-600 hover:border-slate-600 focus:border-primary focus:outline-none
                   transition-all duration-200"
                    value={form.age}
                    onChange={(e) => updateField("age", e.target.value)}
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                    <input
                        type="number"
                        placeholder="Height"
                        min="100"
                        max="250"
                        className="w-full rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 pl-4 pr-12 py-3.5 text-base text-slate-50
                     placeholder:text-slate-600 hover:border-slate-600 focus:border-emerald-500 focus:outline-none
                     transition-all duration-200"
                        value={form.height}
                        onChange={(e) => updateField("height", e.target.value)}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">cm</span>
                </div>

                <div className="relative">
                    <input
                        type="number"
                        placeholder="Weight"
                        min="30"
                        max="200"
                        className="w-full rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 pl-4 pr-12 py-3.5 text-base text-slate-50
                     placeholder:text-slate-600 hover:border-slate-600 focus:border-emerald-500 focus:outline-none
                     transition-all duration-200"
                        value={form.weight}
                        onChange={(e) => updateField("weight", e.target.value)}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">kg</span>
                </div>
            </div>
        </div>
    );
}


/**
 * Step 3 (female only): Menstrual health tracking.
 */
export function MenstrualHealthStep({ form, updateField, onSkip }) {
    const phaseOptions = [
        { value: "follicular", label: "Follicular (Days 1-13)" },
        { value: "ovulatory", label: "Ovulatory (Days 14-16)" },
        { value: "luteal", label: "Luteal (Days 17-28)" },
    ];

    return (
        <div className="space-y-4 animate-fadeIn">
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-4">
                <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-slate-300 leading-relaxed">
                        Track your menstrual cycle for personalized health insights and recommendations
                    </p>
                </div>
            </div>

            <input
                type="number"
                placeholder="Cycle length (days)"
                min="21"
                max="35"
                className="w-full rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 px-4 py-3.5 text-base text-slate-50
                 placeholder:text-slate-600 hover:border-slate-600 focus:border-primary focus:outline-none
                 transition-all duration-200"
                value={form.cycleLengthDays}
                onChange={(e) => updateField("cycleLengthDays", e.target.value)}
            />

            <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">
                    Last period start date
                </label>
                <input
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 px-4 py-3.5 text-base text-slate-50
                   hover:border-slate-600 focus:border-primary focus:outline-none transition-all duration-200"
                    value={form.lastPeriodDate}
                    onChange={(e) => updateField("lastPeriodDate", e.target.value)}
                />
            </div>

            <FormSelect
                value={form.menstrualPhase}
                onChange={(e) => updateField("menstrualPhase", e.target.value)}
                placeholder="Current cycle phase"
                options={phaseOptions}
                className="w-full"
            />

            <button
                type="button"
                onClick={onSkip}
                className="w-full text-sm text-slate-400 hover:text-slate-300 py-2 transition-colors"
            >
                Skip for now →
            </button>
        </div>
    );
}


/**
 * Final step: Health goals and preferences.
 */
export function GoalsStep({ form, updateField }) {
    const dietOptions = [
        { value: "vegetarian", label: "🥗 Vegetarian" },
        { value: "eggetarian", label: "🥚 Eggetarian" },
        { value: "non_vegetarian", label: "🍗 Non-Vegetarian" },
    ];

    return (
        <div className="space-y-4 animate-fadeIn">
            <FormSelect
                value={form.dietType}
                onChange={(e) => updateField("dietType", e.target.value)}
                placeholder="Diet Type"
                options={dietOptions}
                className="w-full"
            />

            <input
                type="text"
                placeholder="Fitness goal (e.g., lose 5kg, build muscle)"
                className="w-full rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 px-4 py-3.5 text-base text-slate-50
                 placeholder:text-slate-600 hover:border-slate-600 focus:border-emerald-500 focus:outline-none
                 transition-all duration-200"
                value={form.goal}
                onChange={(e) => updateField("goal", e.target.value)}
            />

            {/* Medical condition toggle */}
            <div className="bg-slate-950/50 border-2 border-slate-700/50 rounded-2xl p-4">
                <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-3">
                        <div className={`w-11 h-6 rounded-full transition-all duration-300 ${form.hasMedicalCondition ? 'bg-primary' : 'bg-slate-700'
                            }`}>
                            <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-all duration-300 ${form.hasMedicalCondition ? 'ml-5' : 'ml-0.5'
                                }`}></div>
                        </div>
                        <span className="text-sm font-semibold text-slate-300 group-hover:text-slate-100 transition-colors">
                            I have a medical condition
                        </span>
                    </div>
                    <input
                        type="checkbox"
                        className="sr-only"
                        checked={form.hasMedicalCondition}
                        onChange={(e) => updateField("hasMedicalCondition", e.target.checked)}
                    />
                </label>
            </div>

            {form.hasMedicalCondition && (
                <textarea
                    placeholder="List your medical conditions (e.g., diabetes, thyroid)"
                    rows="3"
                    className="w-full rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 px-4 py-3.5 text-base text-slate-50
                   placeholder:text-slate-600 hover:border-slate-600 focus:border-primary focus:outline-none
                   transition-all duration-200 resize-none"
                    value={form.medicalConditions}
                    onChange={(e) => updateField("medicalConditions", e.target.value)}
                />
            )}
        </div>
    );
}

