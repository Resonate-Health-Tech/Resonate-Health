import React from "react";

/**
 * Styled form input with icon support.
 */
export default function FormInput({
    type = "text",
    value,
    onChange,
    placeholder,
    required = false,
    icon,
    unit,
    min,
    max,
    focusedField,
    fieldName,
    onFocus,
    onBlur,
    autoComplete,
    className = "",
}) {
    const isFocused = focusedField === fieldName;

    const baseClasses = `w-full rounded-2xl bg-slate-950/50 border-2 py-3.5 text-base text-slate-50
                       placeholder:text-slate-600 transition-all duration-200
                       focus:outline-none focus:bg-slate-950`;

    const borderClasses = isFocused
        ? 'border-primary shadow-lg shadow-primary/10'
        : 'border-slate-700/50 hover:border-slate-600';

    const paddingClasses = icon ? 'pl-12' : 'pl-4';
    const rightPaddingClasses = unit ? 'pr-12' : 'pr-4';

    return (
        <div className="relative">
            {icon && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    {React.cloneElement(icon, {
                        className: `w-5 h-5 transition-colors duration-200 ${isFocused ? 'text-primary' : 'text-slate-500'
                            }`
                    })}
                </div>
            )}
            <input
                type={type}
                required={required}
                className={`${baseClasses} ${borderClasses} ${paddingClasses} ${rightPaddingClasses} ${className}`}
                value={value}
                onChange={onChange}
                onFocus={() => onFocus?.(fieldName)}
                onBlur={() => onBlur?.(null)}
                placeholder={placeholder}
                min={min}
                max={max}
                autoComplete={autoComplete}
            />
            {unit && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                    {unit}
                </span>
            )}
        </div>
    );
}


/**
 * Styled form select dropdown.
 */
export function FormSelect({ value, onChange, options, placeholder, required = false, className = "" }) {
    return (
        <select
            required={required}
            className={`rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 px-4 py-3.5 text-base text-slate-50
                hover:border-slate-600 focus:border-primary focus:outline-none transition-all duration-200 ${className}`}
            value={value}
            onChange={onChange}
        >
            <option value="">{placeholder}</option>
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
}


/**
 * Styled textarea for longer text input.
 */
export function FormTextarea({ value, onChange, placeholder, rows = 3, className = "" }) {
    return (
        <textarea
            placeholder={placeholder}
            rows={rows}
            className={`w-full rounded-2xl bg-slate-950/50 border-2 border-slate-700/50 px-4 py-3.5 text-base text-slate-50
                placeholder:text-slate-600 hover:border-slate-600 focus:border-primary focus:outline-none
                transition-all duration-200 resize-none ${className}`}
            value={value}
            onChange={onChange}
        />
    );
}


/**
 * Toggle switch component.
 */
export function FormToggle({ checked, onChange, label }) {
    return (
        <div className="bg-slate-950/50 border-2 border-slate-700/50 rounded-2xl p-4">
            <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                    <div className={`w-11 h-6 rounded-full transition-all duration-300 ${checked ? 'bg-primary' : 'bg-slate-700'
                        }`}>
                        <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-all duration-300 ${checked ? 'ml-5' : 'ml-0.5'
                            }`}></div>
                    </div>
                    <span className="text-sm font-semibold text-slate-300 group-hover:text-slate-100 transition-colors">
                        {label}
                    </span>
                </div>
                <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={onChange}
                />
            </label>
        </div>
    );
}

