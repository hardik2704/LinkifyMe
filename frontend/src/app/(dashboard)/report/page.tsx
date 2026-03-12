"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Camera, Image, Type, Users, UserPlus, User, Briefcase, GraduationCap, Award, Wrench, CheckCircle, Crown, Share2, Check, Clock, RefreshCw } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { TopNav } from "@/components/layout/TopNav";
import { Container } from "@/components/layout/Container";
import { Sidebar, defaultSections } from "@/components/layout/Sidebar";
import { ExecutiveSummaryCard } from "@/components/report/ExecutiveSummaryCard";
import { SectionScoreCard } from "@/components/report/SectionScoreCard";
import { FeedbackForm } from "@/components/report/FeedbackForm";
import { FeedbackModal } from "@/components/report/FeedbackModal";
import { PasswordModal } from "@/components/report/PasswordModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export const ReportContext = React.createContext<{
    usedQuotes: Set<string>;
    markQuoteUsed: (quote: string) => void;
}>({
    usedQuotes: new Set(),
    markQuoteUsed: () => {},
});

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Icon mapping for all 12 sections
const iconMap: Record<string, React.ReactNode> = {
    "profile-photo": <Camera className="h-5 w-5" />,
    "cover-photo": <Image className="h-5 w-5" />,
    "headline": <Type className="h-5 w-5" />,
    "connections": <Users className="h-5 w-5" />,
    "followers": <UserPlus className="h-5 w-5" />,
    "about": <User className="h-5 w-5" />,
    "experience": <Briefcase className="h-5 w-5" />,
    "education": <GraduationCap className="h-5 w-5" />,
    "certifications": <Award className="h-5 w-5" />,
    "skills": <Wrench className="h-5 w-5" />,
    "verified": <CheckCircle className="h-5 w-5" />,
    "premium": <Crown className="h-5 w-5" />,
};

// Section type interface
interface Section {
    id: string;
    title: string;
    score: number;
    max_score: number;
    status: string;
    analysis?: string;
    current_status?: string;
    ai_rewrite?: string;
    tags?: string[];
}

interface ReportData {
    customer_id: string;
    profile: {
        name: string;
        initial: string;
        url: string;
    };
    overall_score: number;
    grade_label: string;
    executive_summary: string;
    sections: Section[];
    top_priorities: string[];
    profile_photo_url?: string;
    cover_photo_url?: string;
    report_generation_minutes?: number;
    connection_count?: string;
    follower_count?: string;
    phone?: string;
    attempt_id?: string;
}

// Milestone thresholds for connections/followers
const MILESTONES = [100, 250, 500, 1000, 2000, 5000, 10000, 25000, 50000];

function getMilestoneText(currentStr: string | undefined, label: string): string | undefined {
    if (!currentStr) return undefined;
    const current = parseInt(currentStr.replace(/,/g, ""), 10);
    if (isNaN(current)) return undefined;

    for (const milestone of MILESTONES) {
        if (current < milestone) {
            const remaining = milestone - current;
            return `${remaining.toLocaleString()} more ${label} to reach ${milestone.toLocaleString()}!`;
        }
    }
    return `You've crossed ${MILESTONES[MILESTONES.length - 1].toLocaleString()}+ ${label}! 🎉`;
}

// Default fallback data with all 12 sections (shown while loading or if no customer_id)
const defaultReport: ReportData = {
    customer_id: "USR-00000",
    profile: {
        name: "Loading Profile...",
        initial: "?",
        url: "",
    },
    overall_score: 0,
    grade_label: "LOADING",
    executive_summary: "Analyzing your LinkedIn profile. Please wait for the complete report to load...",
    sections: [
        { id: "profile-photo", title: "Profile Photo", score: 0, max_score: 10, status: "needs_improvement", analysis: "Loading profile photo analysis..." },
        { id: "cover-photo", title: "Cover Photo", score: 0, max_score: 10, status: "needs_improvement", analysis: "Loading cover photo analysis..." },
        { id: "headline", title: "Headline", score: 0, max_score: 10, status: "needs_improvement", analysis: "Loading headline analysis..." },
        { id: "about", title: "About", score: 0, max_score: 10, status: "needs_improvement", analysis: "Loading about section analysis..." },
        { id: "experience", title: "Experience", score: 0, max_score: 10, status: "needs_improvement", analysis: "Loading experience analysis..." },
        { id: "education", title: "Education", score: 0, max_score: 10, status: "needs_improvement", analysis: "Loading education analysis..." },
        { id: "skills", title: "Skills", score: 0, max_score: 10, status: "needs_improvement", analysis: "Loading skills analysis..." },
        { id: "connections", title: "Connections", score: 0, max_score: 10, status: "needs_improvement", analysis: "Loading connections analysis..." },
        { id: "followers", title: "Followers", score: 0, max_score: 10, status: "needs_improvement", analysis: "Loading followers analysis..." },
        { id: "certifications", title: "Licenses & Certifications", score: 0, max_score: 10, status: "needs_improvement", analysis: "Loading certifications analysis..." },
        { id: "verified", title: "Is Verified", score: 0, max_score: 10, status: "needs_improvement", analysis: "Loading verification status..." },
        { id: "premium", title: "Is Premium", score: 0, max_score: 10, status: "needs_improvement", analysis: "Loading premium status..." },
    ],
    top_priorities: ["Loading...", "Please wait...", "Analyzing profile..."],
};

export default function ReportPage() {
    const searchParams = useSearchParams();
    const [activeSection, setActiveSection] = useState("headline");
    const [report, setReport] = useState<ReportData>(defaultReport);
    const [loading, setLoading] = useState(true);
    const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

    // Password protection state
    const [isSharedView, setIsSharedView] = useState(false);
    const [passwordVerified, setPasswordVerified] = useState(false);
    const [reportPhone, setReportPhone] = useState<string>("");

    // HR Quote Tracking Context
    const usedQuotesRef = useRef(new Set<string>());
    const markQuoteUsed = useCallback((quoteGroup: string) => {
        usedQuotesRef.current.add(quoteGroup);
    }, []);

    const handleShareReport = useCallback(async () => {
        if (!currentAttemptId) return;

        const shareUrl = `${window.location.origin}/report?attempt_id=${currentAttemptId}`;

        // Try native share first (mobile)
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "My LinkifyMe Report",
                    text: "Check out my LinkedIn profile analysis!",
                    url: shareUrl,
                });
                return;
            } catch {
                // User cancelled or share failed, fall through to clipboard
            }
        }

        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            const textArea = document.createElement("textarea");
            textArea.value = shareUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [currentAttemptId]);

    useEffect(() => {
        const fetchReport = async () => {
            const attemptId = searchParams.get("attempt_id") || sessionStorage.getItem("linkify_attempt_id");
            const customerId = searchParams.get("customer_id") || sessionStorage.getItem("linkify_customer_id");

            // Check if this is a shared view (no session data, only URL param)
            const isFromUrl = searchParams.has("attempt_id") && !sessionStorage.getItem("linkify_attempt_id");
            if (isFromUrl) {
                setIsSharedView(true);
                // Check if already authenticated
                const auth = sessionStorage.getItem("linkify_report_auth");
                if (auth) {
                    setPasswordVerified(true);
                }
            } else {
                setPasswordVerified(true); // Owner - no password needed
            }

            const reportId = attemptId || customerId;

            if (!reportId) {
                setLoading(false);
                return;
            }

            if (attemptId) {
                setCurrentAttemptId(attemptId);
                sessionStorage.setItem("linkify_attempt_id", attemptId);
            }

            let attempts = 0;
            const maxAttempts = 3;

            const fetchWithRetry = async () => {
                try {
                    const response = await fetch(`${API_BASE}/api/report/${reportId}`);
                    if (response.ok) {
                        const data = await response.json();

                        if (data.overall_score === 0 && data.profile?.name && attempts < maxAttempts) {
                            attempts++;
                            console.log(`[Report] Got 0 score, retrying attempt ${attempts}/${maxAttempts}...`);
                            setTimeout(fetchWithRetry, 2000);
                            return;
                        }

                        setReport(data);
                        if (data.attempt_id) {
                            setCurrentAttemptId(data.attempt_id);
                        }
                        if (data.phone) {
                            setReportPhone(data.phone);
                        }
                    }
                } catch (err) {
                    console.error("Failed to fetch report:", err);
                } finally {
                    if (attempts === 0 || attempts >= maxAttempts) {
                        setLoading(false);
                    }
                }
            };

            fetchWithRetry();
        };

        fetchReport();
    }, [searchParams]);

    // Feedback popup timer — 60 seconds after page is ready
    useEffect(() => {
        if (loading || feedbackSubmitted) return;

        const timer = setTimeout(() => {
            if (!feedbackSubmitted) {
                setFeedbackModalOpen(true);
            }
        }, 60000);

        return () => clearTimeout(timer);
    }, [loading, feedbackSubmitted]);

    // Scroll to section on click
    const handleSectionClick = useCallback((sectionId: string) => {
        setActiveSection(sectionId);
        const el = document.getElementById(`section-${sectionId}`);
        if (el) {
            const headerOffset = 80; // Height of TopNav + some padding
            const elementPosition = el.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    }, []);

    // Get user email from sessionStorage
    const userEmail = typeof window !== "undefined" ? sessionStorage.getItem("linkify_email") || "" : "";

    const sidebarSections = report.sections.map((s) => ({
        id: s.id,
        label: s.title,
        icon: Camera as any,
        hasIssue: s.status === "critical" || s.status === "needs_improvement",
    }));

    const sidebarProfile = {
        name: report.profile.name,
        initial: report.profile.initial,
        url: report.profile.url,
        gradeLabel: report.grade_label,
        score: report.overall_score,
        profilePhotoUrl: report.profile_photo_url,
    };

    // Password protection check
    if (isSharedView && !passwordVerified && reportPhone && !loading) {
        return (
            <PageShell variant="dashboard">
                <TopNav mode="dashboard" />
                <PasswordModal
                    isOpen={true}
                    phone={reportPhone}
                    onSuccess={() => setPasswordVerified(true)}
                />
            </PageShell>
        );
    }

    if (loading) {
        return (
            <PageShell variant="dashboard">
                <TopNav mode="dashboard" />
                <Container className="flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-600 font-medium">Loading your profile report...</p>
                    </div>
                </Container>
            </PageShell>
        );
    }

    return (
        <ReportContext.Provider value={{ usedQuotes: usedQuotesRef.current, markQuoteUsed }}>
        <PageShell variant="dashboard">
            <TopNav
                mode="dashboard"
                onShare={handleShareReport}
                isShared={copied}
                onMenuToggle={() => setMobileMenuOpen((v) => !v)}
            />

            <Container className="py-8">
                <div className="flex gap-8">
                    {/* Sidebar */}
                    <Sidebar
                        profile={sidebarProfile}
                        sections={sidebarSections}
                        activeSection={activeSection}
                        onSectionClick={handleSectionClick}
                        mobileOpen={mobileMenuOpen}
                        onMobileClose={() => setMobileMenuOpen(false)}
                    />

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                                        Audit Results
                                    </h1>
                                    <p className="text-slate-600">
                                        We&apos;ve analyzed <strong>{report.sections.length} key areas</strong> of your profile. Review the insights below to optimize your personal brand.
                                    </p>
                                    {searchParams.get("time") ? (
                                        <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                                            <div className="flex items-center justify-center w-4 h-4 rounded bg-green-500">
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span>
                                                Completed in <strong className="text-brand">
                                                    {Math.floor(parseInt(searchParams.get("time") || "0") / 60)}:{(parseInt(searchParams.get("time") || "0") % 60).toString().padStart(2, '0')}
                                                </strong>
                                            </span>
                                        </div>
                                    ) : report.report_generation_minutes !== undefined && report.report_generation_minutes !== null && (
                                        <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span>
                                                Report created in <strong>
                                                    {report.report_generation_minutes < 1.0
                                                        ? `${Math.round(report.report_generation_minutes * 60)} Seconds`
                                                        : `${report.report_generation_minutes} min`}
                                                </strong>
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {/* Reattempt button */}
                                    <Button
                                        variant="outline"
                                        size="md"
                                        onClick={() => {
                                            const url = `/intake?reattempt=true&linkedin_url=${encodeURIComponent(report.profile.url || "")}&email=${encodeURIComponent(userEmail)}&phone=${encodeURIComponent(reportPhone || report.phone || "")}`;
                                            window.location.href = url;
                                        }}
                                        leftIcon={<RefreshCw className="h-4 w-4" />}
                                    >
                                        Reattempt
                                    </Button>
                                    {/* Share button */}
                                    {currentAttemptId && (
                                        <Button
                                            variant="outline"
                                            size="md"
                                            onClick={handleShareReport}
                                            leftIcon={copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
                                            className={copied ? "border-emerald-200 bg-emerald-50" : ""}
                                        >
                                            {copied ? "Link Copied!" : "Share Report"}
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Executive Summary */}
                            <ExecutiveSummaryCard
                                summaryText={report.executive_summary}
                                score={report.overall_score}
                                stats={[
                                    { label: "Overall Score", value: `${report.overall_score}/100` },
                                    { label: "Optimized", value: report.sections.filter(s => s.status === "optimized").length.toString() },
                                    { label: "Needs Work", value: report.sections.filter(s => s.status === "needs_improvement").length.toString() },
                                    { label: "Critical", value: report.sections.filter(s => s.status === "critical").length.toString() },
                                ]}
                                priorities={report.top_priorities}
                            />

                            {/* Section Cards */}
                            <div className="space-y-6">
                                {report.sections.map((section) => {
                                    // Determine image URL for profile photo and cover photo sections
                                    let imageUrl: string | undefined;
                                    if (section.id === "profile-photo") imageUrl = report.profile_photo_url;
                                    if (section.id === "cover-photo") imageUrl = report.cover_photo_url;

                                    // Determine milestone text for connections/followers
                                    let milestoneText: string | undefined;
                                    if (section.id === "connections") milestoneText = getMilestoneText(report.connection_count, "connections");
                                    if (section.id === "followers") milestoneText = getMilestoneText(report.follower_count, "followers");

                                    return (
                                        <div key={section.id} id={`section-${section.id}`}>
                                            <SectionScoreCard
                                                id={section.id}
                                                title={section.title}
                                                icon={iconMap[section.id] || <Camera className="h-5 w-5" />}
                                                statusTone={section.status === "optimized" ? "success" : section.status === "needs_improvement" ? "warning" : "critical"}
                                                scoreText={`${section.score}/${section.max_score}`}
                                                currentStatusText={section.current_status}
                                                analysisText={section.analysis}
                                                showAIRewrite={!!section.ai_rewrite}
                                                aiRewriteText={section.ai_rewrite}
                                                aiRewriteTags={section.tags}
                                                imageUrl={imageUrl}
                                                milestoneText={milestoneText}
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Inline Feedback Form */}
                            {!feedbackSubmitted && (
                                <Card variant="elevated" className="p-6">
                                    <FeedbackForm
                                        email={userEmail}
                                        customerId={report.customer_id}
                                        onSubmitSuccess={() => setFeedbackSubmitted(true)}
                                    />
                                </Card>
                            )}
                        </motion.div>
                    </main>
                </div>
            </Container>

            {/* Feedback Popup Modal */}
            <FeedbackModal
                isOpen={feedbackModalOpen && !feedbackSubmitted}
                onClose={() => setFeedbackModalOpen(false)}
                email={userEmail}
                customerId={report.customer_id}
            />
        </PageShell>
        </ReportContext.Provider>
    );
}
