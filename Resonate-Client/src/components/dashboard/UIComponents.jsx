import React from "react";

const SANS = { fontFamily: "'DM Sans', sans-serif" };

export function SectionHeader({ title, children }) {
    return (
        <div className="flex items-center justify-between mb-5">
            <h3 style={SANS} className="text-[15px] font-semibold text-[#1A1A18] m-0">{title}</h3>
            {children}
        </div>
    );
}

export function FilterButtons({ active, setActive, options }) {
    return (
        <div className="flex gap-1">
            {options.map(opt => (
                <button key={opt} onClick={() => setActive(opt)}
                    className={active === opt ? "filter-btn-active" : "filter-btn-inactive"}>
                    {opt}
                </button>
            ))}
        </div>
    );
}
