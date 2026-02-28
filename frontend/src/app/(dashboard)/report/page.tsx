"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Camera, Image, Type, Users, UserPlus, User, Briefcase, GraduationCap, Award, Wrench, CheckCircle, Crown, Share2, Check } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { TopNav } from "@/components/layout/TopNav";
import { Container } from "@/components/layout/Container";
import { Sidebar } from "@/components/layout/Sidebar";
import { ExecutiveSummaryCard } from "@/components/report/ExecutiveSummaryCard";
import { SectionScoreCard } from "@/components/report/SectionScoreCard";
import { Button } from "@/components/ui/Button";

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
}

// Default fallback data with all 12 sections (shown while loading or if no customer_id)
const defaultReport = {
    customer_id: "LM-00000",
    profile: {
        name: "Loading Profile...",
        initial: "?",
        url: "",
    },
    overall_score: 0,
    grade_label: "LOADING",
    executive_summary: "Analyzing your LinkedIn profile. Please wait for the complete report to load...",
    sections: [
        { id: "headline", title: "Headline", score: 0, max_score: 10, status: "needs_improvement", analysis: "Loading headline analysis..." },
        { id: "connections", title: "Connections", score: 0, max_score: 10, status: "needs_improvement", analysis: "Loading connections analysis..." },
        { id: "followers", title: "Followers", score: 0, max_score: 10, status: "needs_improvement", analysis: "Loading followers analysis..." },
        { id: "about", title: "About", score: 0, max_score: 10, status: "needs_improvement", analysis: "Loading about section analysis..." },
        { id: "profile-photo", title: "Profile Photo", score: 0, max_score: 10, status: "needs_improvement", analysis: "Loading profile photo analysis..." },
        { id: "cover-photo", title: "Cover Photo", score: 0, max_score: 10, status: "needs_improvement", analysis: "Loading cover photo analysis..." },
        { id: "experience", title: "Experience", score: 0, max_score: 10, status: "needs_improvement", analysis: "Loading experience analysis..." },
        { id: "education", title: "Education", score: 0, max_score: 10, status: "needs_improvement", analysis: "Loading education analysis..." },
        { id: "skills", title: "Skills", score: 0, max_score: 10, status: "needs_improvement", analysis: "Loading skills analysis..." },
        { id: "certifications", title: "Licenses & Certifications", score: 0, max_score: 10, status: "needs_improvement", analysis: "Loading certifications analysis..." },
        { id: "verified", title: "Is Verified", score: 0, max_score: 10, status: "needs_improvement", analysis: "Loading verification status..." },
        { id: "premium", title: "Is Premium", score: 0, max_score: 10, status: "needs_improvement", analysis: "Loading premium status..." },
    ],
    top_priorities: ["Loading...", "Please wait...", "Analyzing profile..."],
};

export default function ReportPage() {
    const searchParams = useSearchParams();
    const [activeSection, setActiveSection] = useState("headline");
    const [report, setReport] = useState<ReportData>(defaultReport as ReportData);
    const [loading, setLoading] = useState(true);
    const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleShareReport = async () => {
        if (!currentAttemptId) return;

        const shareUrl = `${window.location.origin}/report?attempt_id=${currentAttemptId}`;

        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement("textarea");
            textArea.value = shareUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("copy");
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    useEffect(() => {
        const fetchReport = async () => {
            // Try URL param first (shareable links), then sessionStorage
            // attempt_id is primary, customer_id is fallback for backward compatibility
            const attemptId = searchParams.get("attempt_id") || sessionStorage.getItem("linkify_attempt_id");
            const customerId = searchParams.get("customer_id") || sessionStorage.getItem("linkify_customer_id");

            // Use attempt_id if available, otherwise fall back to customer_id
            const reportId = attemptId || customerId;

            if (!reportId) {
                // Use demo data
                setLoading(false);
                return;
            }

            // Store attempt ID for sharing
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

                        // If overall_score is 0 but we have a profile name, it might be mid-write
                        // Retry up to 3 times with a short delay
                        if (data.overall_score === 0 && data.profile?.name && attempts < maxAttempts) {
                            attempts++;
                            console.log(`[Report] Got 0 score, retrying attempt ${attempts}/${maxAttempts}...`);
                            setTimeout(fetchWithRetry, 2000); // 2s delay
                            return;
                        }

                        setReport(data);
                        if (data.attempt_id) {
                            setCurrentAttemptId(data.attempt_id);
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

    const sidebarSections = report.sections.map((s) => ({
        id: s.id,
        label: s.title,
        icon: iconMap[s.id] ? () => iconMap[s.id] : Camera,
        hasIssue: s.status === "critical" || s.status === "needs_improvement",
    }));

    const sidebarProfile = {
        name: report.profile.name,
        initial: report.profile.initial,
        url: report.profile.url,
        gradeLabel: report.grade_label,
        score: report.overall_score,
    };

    if (loading) {
        return (
            <PageShell variant="dashboard">
                <TopNav mode="dashboard" />
                <Container className="flex items-center justify-center min-h-[60vh]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-600 font-medium">Generating your profile report...</p>
                    </div>
                </Container>
            </PageShell>
        );
    }

    return (
        <PageShell variant="dashboard">
            <TopNav
                mode="dashboard"
                onShare={handleShareReport}
                isShared={copied}
            />

            <Container className="py-8">
                <div className="flex gap-8">
                    {/* Sidebar */}
                    <Sidebar
                        profile={sidebarProfile}
                        sections={sidebarSections.map(s => ({
                            ...s,
                            icon: iconMap[s.id] ? (() => {
                                const icons: Record<string, any> = { Camera, Image, Type, Users, UserPlus, User, Briefcase, GraduationCap, Award, Wrench };
                                return icons[Object.keys(iconMap).find(k => k === s.id) || "Camera"] || Camera;
                            })() : Camera
                        }))}
                        activeSection={activeSection}
                        onSectionClick={setActiveSection}
                        className="hidden lg:block"
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
                                </div>
                                {currentAttemptId && (
                                    <Button
                                        variant="outline"
                                        size="md"
                                        onClick={handleShareReport}
                                        leftIcon={copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
                                        className={copied ? "border-emerald-200 bg-emerald-50" : ""}
                                    >
                                        {copied ? "Link Copied!" : "Share Link"}
                                    </Button>
                                )}
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
                                {report.sections.map((section) => (
                                    <SectionScoreCard
                                        key={section.id}
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
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </main>
                </div>
            </Container>
        </PageShell>
    );
}
