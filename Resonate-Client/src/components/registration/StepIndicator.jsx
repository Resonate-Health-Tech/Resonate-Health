import React from "react";

/**
 * Progress bar showing registration step progress.
 */
export default function StepIndicator({ step, totalSteps }) {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-300">
                    Step {step} of {totalSteps}
                </span>
                <span className="text-xs text-slate-500">
                    {Math.round((step / totalSteps) * 100)}% Complete
                </span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${(step / totalSteps) * 100}%` }}
                ></div>
            </div>
        </div>
    );
}


/**
 * Step dots indicator at bottom of form.
 */
export function StepDots({ step, totalSteps }) {
    return (
        <div className="flex justify-center gap-2 mt-6">
            {[...Array(totalSteps)].map((_, index) => (
                <div
                    key={index}
                    className={`h-2 rounded-full transition-all duration-300 ${index + 1 <= step
                            ? 'w-8 bg-primary'
                            : 'w-2 bg-slate-700'
                        }`}
                ></div>
            ))}
        </div>
    );
}

