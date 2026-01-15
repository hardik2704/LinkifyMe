"use client";

import { cn } from "@/lib/cn";
import { ChevronDown } from "lucide-react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    options: { value: string; label: string }[];
    placeholder?: string;
}

export function Select({ options, placeholder, className, ...props }: SelectProps) {
    return (
        <div className="relative">
            <select
                className={cn(
                    "flex h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 pr-10 text-sm text-slate-900 transition-all duration-200",
                    "focus:bg-white focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20",
                    "hover:border-slate-300",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                {...props}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
    );
}
