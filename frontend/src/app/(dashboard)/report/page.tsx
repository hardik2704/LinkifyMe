"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, Image, Type, Users, UserPlus, User, Briefcase, GraduationCap, Award, Wrench, CheckCircle, Crown } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { TopNav } from "@/components/layout/TopNav";
import { Container } from "@/components/layout/Container";
import { Sidebar } from "@/components/layout/Sidebar";
import { ExecutiveSummaryCard } from "@/components/report/ExecutiveSummaryCard";
import { SectionScoreCard } from "@/components/report/SectionScoreCard";

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
    const [activeSection, setActiveSection] = useState("headline");
    const [report, setReport] = useState<ReportData>(defaultReport as ReportData);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            const customerId = sessionStorage.getItem("linkify_customer_id");

            if (!customerId) {
                // Use demo data
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE}/api/report/${customerId}`);

                if (response.ok) {
                    const data = await response.json();
                    setReport(data);
                }
            } catch (err) {
                console.error("Failed to fetch report:", err);
                // Use default data on error
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, []);

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

    return (
        <PageShell variant="dashboard">
            <TopNav mode="dashboard" />

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
                            <div>
                                <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                                    Audit Results
                                </h1>
                                <p className="text-slate-600">
                                    We&apos;ve analyzed <strong>{report.sections.length} key areas</strong> of your profile. Review the insights below to optimize your personal brand.
                                </p>
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
