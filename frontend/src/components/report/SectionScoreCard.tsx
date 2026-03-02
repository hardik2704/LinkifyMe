"use client";

import { cn } from "@/lib/cn";
import { IconTile } from "@/components/ui/IconTile";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { AIRewriteCard } from "./AIRewriteCard";
import { Pencil, Info, Camera, Target } from "lucide-react";

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
    imageUrl?: string;
    milestoneText?: string;
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
    imageUrl,
    milestoneText,
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

            {/* Image display for profile photo / cover photo sections */}
            {imageUrl && (
                <div className="px-6 pb-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">
                        <Camera className="h-3 w-3" />
                        CURRENT IMAGE
                    </div>
                    <div className={cn(
                        "rounded-xl border border-slate-200 overflow-hidden bg-slate-50",
                        id === "cover-photo" ? "aspect-[3/1]" : "w-24 h-24 rounded-full mx-auto"
                    )}>
                        <img
                            src={imageUrl}
                            alt={`Current ${title}`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            )}

            {/* Milestone Progress */}
            {milestoneText && (
                <div className="mx-6 mb-2 px-4 py-2.5 rounded-xl bg-indigo-50 border border-indigo-100">
                    <p className="text-xs font-medium text-indigo-700">
                        🎯 {milestoneText}
                    </p>
                </div>
            )}

            {/* Body */}
            <div className="p-6 grid md:grid-cols-2 gap-6">
                {/* Current Status */}
                {currentStatusText && (
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 uppercase tracking-wider mb-3">
                            <Pencil className="h-3 w-3" />
                            CURRENT LINKEDIN STATUS
                        </div>
                        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-700 max-h-20 overflow-y-auto whitespace-pre-wrap custom-scrollbar">
                            {currentStatusText.trim()}
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

                        {/* Actionable Items */}
                        {(statusTone === "warning" || statusTone === "critical") && (
                            (() => {
                                const segments = analysisText.split(';').map(s => s.trim()).filter(Boolean);
                                // Prioritize negative signals or insights
                                let items = segments.filter(s => s.includes('(-') || s.toLowerCase().includes('missing') || s.toLowerCase().includes('insight'));
                                if (items.length === 0 && segments.length > 0) {
                                    items = segments.slice(-2); // fallback
                                }

                                const getHRQuote = (text: string): { quote: string, company: string } | null => {
                                    if (text.includes('keyword') || text.includes('search')) {
                                        return { quote: "We actively use LinkedIn Recruiter search strings based on specific skill keywords. If they aren't explicitly on your profile, you simply don't exist to us.", company: "Google" };
                                    }
                                    if (text.includes('metric') || text.includes('number')) {
                                        return { quote: "Don't just tell me what your job description was. Show me the impact you made with hard numbers. Metrics prove competence.", company: "Amazon" };
                                    }
                                    if (text.includes('missing')) {
                                        return { quote: "Incomplete profiles often signal a lack of attention to detail or low intent in the job market. It's an easy filter for recruiters to pass on a candidate.", company: "Meta" };
                                    }
                                    if (text.includes('buzzword') || text.includes('cliche')) {
                                        return { quote: "Everyone claims to be 'passionate' and 'results-driven'. Skip the fluff and give me concrete examples of your work.", company: "Stripe" };
                                    }
                                    if (text.includes('short') || text.includes('brief') || text.includes('length')) {
                                        return { quote: "We only spend about 6-7 seconds scanning a profile initially. If there isn't enough context to hook us, we move on.", company: "Netflix" };
                                    }
                                    if (text.includes('long') || text.includes('dense')) {
                                        return { quote: "Huge walls of text are immediately skipped. Bullet points and bolded key achievements are your best friend.", company: "Microsoft" };
                                    }
                                    if (text.includes('photo') && text.includes('professional')) {
                                        return { quote: "It sounds superficial, but profiles with professional headshots receive 14x more profile views. It builds immediate trust.", company: "LinkedIn" };
                                    }
                                    if (text.includes('cover') && text.includes('photo')) {
                                        return { quote: "A custom banner is prime real estate to show your personal brand or industry alignment at a single glance.", company: "HubSpot" };
                                    }
                                    return null;
                                };

                                const generateActionableStep = (insight: string, sectionTitle: string) => {
                                    const text = insight.toLowerCase().replace(/\s*\([\+\-][0-9.]+\)/g, '').replace('hr insight:', '').trim();

                                    let instruction = `Improve this area: ${text.charAt(0).toUpperCase() + text.slice(1)}.`;

                                    if (text.includes('missing') && text.includes('keyword')) instruction = `Add relevant industry and role keywords to your ${sectionTitle} to improve searchability.`;
                                    else if (text.includes('missing') && (text.includes('metric') || text.includes('number'))) instruction = `Include quantitative metrics or numbers to highlight the impact of your achievements.`;
                                    else if (text.includes('missing')) instruction = `Add the missing ${text.replace(/.*missing /g, '').split(' ')[0]} to complete this section.`;
                                    else if (text.includes('buzzword') || text.includes('cliche')) instruction = `Replace generic buzzwords with concrete, specific examples of your work.`;
                                    else if (text.includes('short') || text.includes('brief') || text.includes('length')) instruction = `Expand your ${sectionTitle} to provide recruiters with more context about your background.`;
                                    else if (text.includes('long') || text.includes('dense')) instruction = `Condense your ${sectionTitle} to make it more scannable and impactful for readers.`;
                                    else if (text.includes('photo') && text.includes('professional')) instruction = `Upload a high-quality, professional headshot.`;
                                    else if (text.includes('cover') && text.includes('photo')) instruction = `Add a background banner image that reflects your industry or personal brand.`;
                                    else if (text.includes('contact') || text.includes('email')) instruction = `Include your professional contact information.`;
                                    else if (text.startsWith('no ')) instruction = `Add a ${text.replace('no ', '')} to your profile.`;
                                    else if (text.startsWith('lacks ')) instruction = `Include ${text.replace('lacks ', '')} to strengthen this section.`;

                                    const hrQuote = getHRQuote(text);
                                    return { instruction, hrQuote };
                                };

                                // Take max 2 and map them to action steps
                                const actionable = items.slice(0, 2).map(s => generateActionableStep(s, title));

                                if (actionable.length === 0) return null;

                                return (
                                    <div className="mt-6">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-3">
                                            <Target className="h-3 w-3" />
                                            ACTIONABLE ITEMS
                                        </div>
                                        <ul className="text-sm text-slate-600 space-y-2">
                                            {actionable.map((item, idx) => (
                                                <li key={idx} className="flex flex-col gap-2">
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-indigo-400 mt-0.5">•</span>
                                                        <span className="font-medium text-slate-700">{item.instruction}</span>
                                                    </div>
                                                    {item.hrQuote && (
                                                        <div className="ml-4 pl-3 py-1 border-l-2 border-indigo-200 bg-indigo-50/50 rounded-r-lg text-xs italic text-slate-600">
                                                            &quot;{item.hrQuote.quote}&quot; — <span className="font-semibold text-indigo-700">{item.hrQuote.company} HR</span>
                                                        </div>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })()
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
}
