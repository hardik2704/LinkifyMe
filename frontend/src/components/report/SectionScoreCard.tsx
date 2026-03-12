"use client";

import { cn } from "@/lib/cn";
import { IconTile } from "@/components/ui/IconTile";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { AIRewriteCard } from "./AIRewriteCard";
import { useContext } from "react";
import { ReportContext } from "@/app/(dashboard)/report/page";
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
                                const { usedQuotes, markQuoteUsed } = useContext(ReportContext);
                                const segments = analysisText.split(';').map(s => s.trim()).filter(Boolean);
                                // Prioritize negative signals or insights
                                let items = segments.filter(s => s.includes('(-') || s.toLowerCase().includes('missing') || s.toLowerCase().includes('insight') || s.toLowerCase().includes('lacks') || s.toLowerCase().includes('no '));
                                if (items.length === 0 && segments.length > 0) {
                                    items = segments.slice(-2); // fallback
                                }

                                const getHRQuote = (text: string): { quote: string, company: string } | null => {
                                    const availableQuotes = [
                                        { key: "keyword", match: (t: string) => t.includes('keyword') || t.includes('search'), quote: "We actively use LinkedIn Recruiter search strings based on specific skill keywords. If they aren't explicitly on your profile, you simply don't exist to us.", company: "Google" },
                                        { key: "metric", match: (t: string) => t.includes('metric') || t.includes('number') || t.includes('quantif'), quote: "Don't just tell me what your job description was. Show me the impact you made with hard numbers. Metrics prove competence.", company: "Amazon" },
                                        { key: "missing", match: (t: string) => t.includes('missing') || t.includes('lacks'), quote: "Incomplete profiles often signal a lack of attention to detail or low intent in the job market. It's an easy filter for recruiters to pass on a candidate.", company: "Meta" },
                                        { key: "buzzword", match: (t: string) => t.includes('buzzword') || t.includes('cliche'), quote: "Everyone claims to be 'passionate' and 'results-driven'. Skip the fluff and give me concrete examples of your work.", company: "Stripe" },
                                        { key: "short", match: (t: string) => t.includes('short') || t.includes('brief') || t.includes('length'), quote: "We only spend about 6-7 seconds scanning a profile initially. If there isn't enough context to hook us, we move on.", company: "Netflix" },
                                        { key: "long", match: (t: string) => t.includes('long') || t.includes('dense'), quote: "Huge walls of text are immediately skipped. Bullet points and bolded key achievements are your best friend.", company: "Microsoft" },
                                        { key: "photo", match: (t: string) => t.includes('photo') || t.includes('picture'), quote: "It sounds superficial, but profiles with professional headshots receive 14x more profile views. It builds immediate trust.", company: "LinkedIn" },
                                        { key: "cover", match: (t: string) => t.includes('cover') || t.includes('background'), quote: "A custom banner is prime real estate to show your personal brand or industry alignment at a single glance.", company: "HubSpot" }
                                    ];

                                    for (const q of availableQuotes) {
                                        if (q.match(text) && (!usedQuotes || !usedQuotes.has(q.key))) {
                                            if (markQuoteUsed) markQuoteUsed(q.key);
                                            return { quote: q.quote, company: q.company };
                                        }
                                    }
                                    return null;
                                };

                                const generateActionableStep = (insight: string, sectionTitle: string) => {
                                    const text = insight.toLowerCase().replace(/\s*\([\+\-][0-9.]+\)/g, '').replace('hr insight:', '').trim();

                                    let instruction = `Refine this area by addressing: ${text}.`;

                                    // Contextual mapping for high-value actions
                                    if (text.includes('keyword')) instruction = `Inject relevant industry tools and role-specific keywords directly into your ${sectionTitle} to trigger Recruiter search algorithms.`;
                                    else if ((text.includes('metric') || text.includes('number')) && sectionTitle.toLowerCase() === 'experience') instruction = `Quantify your professional impact. Replace generic duties with strict numbers (e.g., 'Grew revenue by X%', 'Managed team of Y').`;
                                    else if (text.includes('metric') || text.includes('number')) instruction = `Quantify your achievements. Add precise metrics instead of vague statements to prove your competence.`;
                                    else if (text.includes('missing')) instruction = `Your profile is omitting ${text.replace(/.*missing /g, '').split(' ')[0]}. Add this immediately to pass standard Recruiter completeness checks!`;
                                    else if (text.includes('buzzword') || text.includes('cliche')) instruction = `Remove generic buzzwords. Frame your narrative around concrete methodologies instead of claiming you are 'passionate' or 'motivated'.`;
                                    else if (text.includes('short') || text.includes('brief')) instruction = `Elaborate on your ${sectionTitle}. You need to provide sufficient context to hook a reader during their 6-second initial scan.`;
                                    else if (text.includes('long') || text.includes('dense')) instruction = `Break down your dense ${sectionTitle} into punchy, scannable bullet points. Recruiters skip walls of text!`;
                                    else if (text.includes('photo') || text.includes('picture')) instruction = `Upload a high-quality, professional headshot. Visually complete profiles get vastly more traction.`;
                                    else if (text.includes('contact') || text.includes('email')) instruction = `Surface your professional contact information so interested parties can actually reach you.`;
                                    else if (text.startsWith('no ')) instruction = `You have 0 ${text.replace('no ', '')}. Build this out to strengthen your credibility in the field.`;
                                    else if (text.startsWith('lacks ')) instruction = `Incorporate ${text.replace('lacks ', '')} to meet the baseline expectations for this section.`;
                                    else if (text.includes('seniority')) instruction = `Ensure your exact seniority level is instantly discernible so recruiters don't miscategorize your tier.`;
                                    else if (text.includes('education') || text.includes('degree')) instruction = `Expand your academic credentials. Add details about your college life, honors, or thesis so employers understand your foundational knowledge.`;
                                    else if (text.includes('value')) instruction = `Show what value you directly add! Shift focus from 'what my duties were' to 'what measurable impact I delivered'.`;

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
