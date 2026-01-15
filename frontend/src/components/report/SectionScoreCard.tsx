"use client";

import { cn } from "@/lib/cn";
import { IconTile } from "@/components/ui/IconTile";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { AIRewriteCard } from "./AIRewriteCard";
import { Pencil, Info } from "lucide-react";

type StatusTone = "success" | "warning" | "critical";

interface SectionScoreCardProps {
    id: string;
    title: string;
    icon: React.ReactNode;
    statusTone: StatusTone;
    statusLabel?: string;
    scoreText: string;
    currentStatusText?: string;
    analysisText?: string;
    showAIRewrite?: boolean;
    aiRewriteText?: string;
    aiRewriteTags?: string[];
    className?: string;
}

const statusLabels: Record<StatusTone, string> = {
    success: "OPTIMIZED",
    warning: "NEEDS IMPROVEMENT",
    critical: "CRITICAL",
};

export function SectionScoreCard({
    id,
    title,
    icon,
    statusTone,
    statusLabel,
    scoreText,
    currentStatusText,
    analysisText,
    showAIRewrite,
    aiRewriteText,
    aiRewriteTags,
    className,
}: SectionScoreCardProps) {
    return (
        <Card variant="elevated" className={cn("p-0 overflow-hidden", className)}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                    <IconTile
                        icon={icon}
                        tone={statusTone === "success" ? "success" : statusTone === "warning" ? "warning" : "critical"}
                        size="lg"
                    />
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                        <Badge tone={statusTone}>{statusLabel || statusLabels[statusTone]}</Badge>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-4xl font-bold text-slate-900">{scoreText.split("/")[0]}</span>
                    <span className="text-lg text-slate-400">/{scoreText.split("/")[1]}</span>
                </div>
            </div>

            {/* Body */}
            <div className="p-6 grid md:grid-cols-2 gap-6">
                {/* Current Status */}
                {currentStatusText && (
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 uppercase tracking-wider mb-3">
                            <Pencil className="h-3 w-3" />
                            CURRENT LINKEDIN STATUS
                        </div>
                        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-700">
                            {currentStatusText}
                        </div>

                        {showAIRewrite && (
                            <div className="mt-4">
                                <AIRewriteCard
                                    text={aiRewriteText}
                                    tags={aiRewriteTags}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Analysis */}
                {analysisText && (
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                            <Info className="h-3 w-3" />
                            YOUR ANALYSIS
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            {analysisText}
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );
}
