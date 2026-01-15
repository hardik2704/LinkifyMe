"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Image, Type, Users, UserPlus, User, Briefcase, GraduationCap, Award, Wrench } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { TopNav } from "@/components/layout/TopNav";
import { Container } from "@/components/layout/Container";
import { Sidebar, defaultSections } from "@/components/layout/Sidebar";
import { ExecutiveSummaryCard } from "@/components/report/ExecutiveSummaryCard";
import { SectionScoreCard } from "@/components/report/SectionScoreCard";

// Mock data
const mockProfile = {
    name: "Hardik Mahendru",
    initial: "H",
    url: "https://www.linkedin.com/in/hardik-mah...",
    gradeLabel: "AVERAGE",
    score: 52,
};

const mockSections = [
    { id: "profile-photo", label: "Profile Photo", icon: Camera, hasIssue: false },
    { id: "cover-photo", label: "Cover Photo", icon: Image, hasIssue: true },
    { id: "headline", label: "Headline", icon: Type, hasIssue: true },
    { id: "connections", label: "Connections", icon: Users, hasIssue: false },
    { id: "followers", label: "Followers", icon: UserPlus, hasIssue: false },
    { id: "about", label: "About", icon: User, hasIssue: true },
    { id: "experience", label: "Experience", icon: Briefcase, hasIssue: false },
];

export default function ReportPage() {
    const [activeSection, setActiveSection] = useState("headline");

    return (
        <PageShell variant="dashboard">
            <TopNav mode="dashboard" />

            <Container className="py-8">
                <div className="flex gap-8">
                    {/* Sidebar */}
                    <Sidebar
                        profile={mockProfile}
                        sections={mockSections}
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
                                    We&apos;ve analyzed <strong>12 key areas</strong> of your profile. Review the insights below to optimize your personal brand.
                                </p>
                            </div>

                            {/* Executive Summary */}
                            <ExecutiveSummaryCard
                                summaryText="Overall, your profile has a solid foundation but requires significant improvements in the About, Experience, and Skills sections to make a stronger impact. Focus on enhancing these areas to better showcase your qualifications and attract opportunities in your field."
                                score={52}
                                stats={[
                                    { label: "Overall Score", value: "52/100" },
                                    { label: "Optimized", value: "5" },
                                    { label: "Needs Work", value: "4" },
                                    { label: "Critical", value: "3" },
                                ]}
                                priorities={["Improve Certifications", "Improve About", "Improve Experience"]}
                            />

                            {/* Section Cards */}
                            <div className="space-y-6">
                                <SectionScoreCard
                                    id="profile-photo"
                                    title="Profile Photo"
                                    icon={<Camera className="h-5 w-5" />}
                                    statusTone="success"
                                    scoreText="6/6"
                                    analysisText="Great job! Your profile photo meets all professional standards. It's clear, well-lit, and presents you in a professional manner."
                                />

                                <SectionScoreCard
                                    id="headline"
                                    title="Headline"
                                    icon={<Type className="h-5 w-5" />}
                                    statusTone="warning"
                                    scoreText="9/15"
                                    currentStatusText='"Student @ IIT Delhi | Co-Founder — RentBasket | Agentix"'
                                    analysisText="Your headline effectively communicates your current role as a student and your entrepreneurial ventures. However, it could benefit from additional keywords related to your skills and aspirations to attract the right opportunities."
                                    showAIRewrite
                                    aiRewriteText="Include role, specialization, and unique value with searchable keywords."
                                    aiRewriteTags={["Keywords", "Value Proposition", "Clarity"]}
                                />

                                <SectionScoreCard
                                    id="connections"
                                    title="Connections"
                                    icon={<Users className="h-5 w-5" />}
                                    statusTone="success"
                                    scoreText="5/5"
                                    currentStatusText="500 connections"
                                    analysisText="Having 500 connections and followers is great! This shows you are engaged with your professional community. However, consider connecting with more industry leaders."
                                />

                                <SectionScoreCard
                                    id="about"
                                    title="About"
                                    icon={<User className="h-5 w-5" />}
                                    statusTone="critical"
                                    scoreText="4/15"
                                    currentStatusText="Your about section is currently empty or too brief."
                                    analysisText="Your About section is crucial for telling your professional story. Consider adding a compelling narrative that highlights your journey, achievements, and aspirations."
                                    showAIRewrite
                                    aiRewriteText="Start with a hook that captures attention, then describe your expertise and unique value proposition."
                                    aiRewriteTags={["Storytelling", "Keywords", "Call to Action"]}
                                />
                            </div>
                        </motion.div>
                    </main>
                </div>
            </Container>
        </PageShell>
    );
}
