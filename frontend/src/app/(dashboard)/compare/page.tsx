"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    Minus,
    BarChart3
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/layout/Container";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { compareAttempts, type ComparisonResponse, type ScoreComparison } from "@/lib/api";

export default function ComparePage() {
    const searchParams = useSearchParams();
    const currentId = searchParams.get("current");
    const previousId = searchParams.get("previous");

    const [comparison, setComparison] = useState<ComparisonResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!currentId || !previousId) {
            setError("Missing attempt IDs for comparison");
            setIsLoading(false);
            return;
        }

        const fetchComparison = async () => {
            try {
                const data = await compareAttempts(currentId, previousId);
                setComparison(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load comparison");
            } finally {
                setIsLoading(false);
            }
        };

        fetchComparison();
    }, [currentId, previousId]);

    const getDeltaIcon = (section: ScoreComparison) => {
        if (section.change_direction === "improved") {
            return <TrendingUp className="h-5 w-5 text-emerald-500" />;
        }
        if (section.change_direction === "declined") {
            return <TrendingDown className="h-5 w-5 text-red-500" />;
        }
        return <Minus className="h-5 w-5 text-slate-400" />;
    };

    const getDeltaColor = (direction: string) => {
        if (direction === "improved") return "text-emerald-500";
        if (direction === "declined") return "text-red-500";
        return "text-slate-400";
    };

    if (isLoading) {
        return (
            <PageShell variant="dashboard">
                <Container className="py-20">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
                    </div>
                </Container>
            </PageShell>
        );
    }

    if (error || !comparison) {
        return (
            <PageShell variant="dashboard">
                <Container className="py-20">
                    <GlassPanel className="max-w-md mx-auto p-8 text-center">
                        <p className="text-red-500 mb-4">{error || "Comparison not available"}</p>
                        <Link href="/intake">
                            <Button variant="primary">Start New Analysis</Button>
                        </Link>
                    </GlassPanel>
                </Container>
            </PageShell>
        );
    }

    return (
        <PageShell variant="dashboard">
            {/* Header */}
            <div className="bg-gradient-to-b from-brand to-brand-dark pt-8 pb-16 text-white">
                <Container>
                    <Link
                        href={`/profile?user_id=${searchParams.get("user_id") || ""}`}
                        className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors mb-8"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Profile
                    </Link>

                    <div className="text-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center justify-center mb-4"
                        >
                            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                                <BarChart3 className="h-6 w-6" />
                            </div>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="font-display text-3xl font-bold mb-2"
                        >
                            Score Comparison
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-white/70"
                        >
                            {comparison.summary}
                        </motion.p>
                    </div>
                </Container>
            </div>

            {/* Overall Delta Card */}
            <Container className="relative -mt-8 pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="max-w-2xl mx-auto"
                >
                    <GlassPanel className="p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="text-center">
                                    <p className="text-sm text-slate-500">Previous</p>
                                    <p className="text-3xl font-bold text-slate-400">
                                        {comparison.previous_attempt.final_score}
                                    </p>
                                </div>
                                <div className="text-2xl text-slate-300">→</div>
                                <div className="text-center">
                                    <p className="text-sm text-slate-500">Current</p>
                                    <p className="text-3xl font-bold text-brand">
                                        {comparison.current_attempt.final_score}
                                    </p>
                                </div>
                            </div>
                            <div className={`text-right ${comparison.overall_delta >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                <p className="text-sm">Change</p>
                                <p className="text-4xl font-bold">
                                    {comparison.overall_delta > 0 ? "+" : ""}{comparison.overall_delta}
                                </p>
                            </div>
                        </div>
                    </GlassPanel>

                    {/* Section Comparisons */}
                    <GlassPanel className="p-6">
                        <h2 className="font-display text-lg font-semibold mb-4">
                            Section Breakdown
                        </h2>

                        <div className="space-y-3">
                            {comparison.sections.map((section, idx) => (
                                <motion.div
                                    key={section.section}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * idx }}
                                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200"
                                >
                                    <div className="flex items-center gap-3">
                                        {getDeltaIcon(section)}
                                        <span className="font-medium text-slate-700">
                                            {section.section}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right min-w-[60px]">
                                            <span className="text-slate-400">{section.previous_score}</span>
                                            <span className="text-slate-300 mx-2">→</span>
                                            <span className="text-slate-700 font-medium">{section.current_score}</span>
                                        </div>
                                        <div className={`font-bold min-w-[50px] text-right ${getDeltaColor(section.change_direction)}`}>
                                            {section.delta > 0 ? "+" : ""}{section.delta}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </GlassPanel>
                </motion.div>
            </Container>
        </PageShell>
    );
}
