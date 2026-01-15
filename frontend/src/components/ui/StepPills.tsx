"use client";

import { cn } from "@/lib/cn";
import { Check } from "lucide-react";

export type StepState = "inactive" | "active" | "done";

export interface Step {
    label: string;
    state: StepState;
    icon?: React.ReactNode;
}

interface StepPillsProps {
    steps: Step[];
    compact?: boolean;
    className?: string;
}

export function StepPills({ steps, compact, className }: StepPillsProps) {
    return (
        <div className={cn("flex items-center gap-2 flex-wrap justify-center", className)}>
            {steps.map((step, idx) => (
                <div
                    key={idx}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300",
                        step.state === "inactive" && "bg-slate-100 text-slate-500 border-slate-200",
                        step.state === "active" && "bg-brand/10 text-brand-dark border-brand/20 shadow-sm",
                        step.state === "done" && "bg-green-50 text-green-700 border-green-200"
                    )}
                >
                    {step.state === "done" ? (
                        <Check className="h-4 w-4" />
                    ) : (
                        step.icon
                    )}
                    {!compact && <span>{step.label}</span>}
                </div>
            ))}
        </div>
    );
}
