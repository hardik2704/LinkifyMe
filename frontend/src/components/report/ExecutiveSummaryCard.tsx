"use client";

import { cn } from "@/lib/cn";
import { Sparkles, Target } from "lucide-react";

interface Stat {
    label: string;
    value: string | number;
    tone?: "neutral" | "success" | "warning" | "critical";
}

interface ExecutiveSummaryCardProps {
    summaryText: string;
    score: number;
    stats: Stat[];
    priorities: string[];
    className?: string;
}

export function ExecutiveSummaryCard({
    summaryText,
    score,
    stats,
    priorities,
    className,
}: ExecutiveSummaryCardProps) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-xl",
                className
            )}
        >
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-brand/20 blur-3xl rounded-full" />

            <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-xl bg-amber-500/20">
                        <Sparkles className="h-5 w-5 text-amber-400" />
                    </div>
                    <h2 className="text-lg font-semibold">Executive Summary</h2>
                </div>

                <p className="text-slate-300 leading-relaxed mb-8 max-w-3xl">
                    {summaryText}
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, idx) => (
                        <div
                            key={idx}
                            className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
                        >
                            <div className="text-3xl font-bold mb-1">{stat.value}</div>
                            <div className="text-xs text-slate-400 uppercase tracking-wider">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Priorities */}
                <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Target className="h-4 w-4" />
                        <span className="font-medium">TOP PRIORITIES</span>
                    </div>
                    {priorities.map((priority, idx) => (
                        <span
                            key={idx}
                            className="px-4 py-2 rounded-full bg-white/10 text-sm font-medium border border-white/10 hover:bg-white/15 transition-colors cursor-pointer"
                        >
                            {idx + 1}. {priority}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
