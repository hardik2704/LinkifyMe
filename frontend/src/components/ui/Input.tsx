import * as React from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    leftIcon?: React.ReactNode;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, leftIcon, error, ...props }, ref) => {
        return (
            <div className="relative">
                {leftIcon && (
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        {leftIcon}
                    </div>
                )}
                <input
                    type={type}
                    className={cn(
                        "flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200",
                        "focus:bg-white focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20",
                        "hover:border-slate-300",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        leftIcon && "pl-11",
                        error && "border-rose-300 focus:border-rose-500 focus:ring-rose-200",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {error && <p className="mt-1.5 text-xs text-rose-600">{error}</p>}
            </div>
        );
    }
);
Input.displayName = "Input";
