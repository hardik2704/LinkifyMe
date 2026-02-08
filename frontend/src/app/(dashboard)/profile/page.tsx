"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    User,
    History,
    TrendingUp,
    TrendingDown,
    Minus,
    ArrowLeft,
    Calendar,
    Star
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/layout/Container";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { getUserAttempts, type UserInfo, type AttemptSummary } from "@/lib/api";

export default function ProfilePage() {
    const searchParams = useSearchParams();
    const userId = searchParams.get("user_id");

    const [user, setUser] = useState<UserInfo | null>(null);
    const [attempts, setAttempts] = useState<AttemptSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setError("No user ID provided");
            setIsLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const data = await getUserAttempts(userId);
                setUser(data.user);
                setAttempts(data.attempts);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load profile");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        } catch {
            return dateStr;
        }
    };

    const getScoreDelta = (current: number, previous: number | undefined) => {
        if (previous === undefined) return null;
        const delta = current - previous;
        if (delta > 0) return { value: `+${delta}`, direction: "up" as const };
        if (delta < 0) return { value: `${delta}`, direction: "down" as const };
        return { value: "0", direction: "same" as const };
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-emerald-500";
        if (score >= 60) return "text-amber-500";
        return "text-red-500";
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

    if (error || !user) {
        return (
            <PageShell variant="dashboard">
                <Container className="py-20">
                    <GlassPanel className="max-w-md mx-auto p-8 text-center">
                        <p className="text-red-500 mb-4">{error || "User not found"}</p>
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
                        href="/intake"
                        className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors mb-8"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        New Analysis
                    </Link>

                    <div className="flex items-start gap-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="h-20 w-20 rounded-2xl bg-white/20 flex items-center justify-center"
                        >
                            <User className="h-10 w-10" />
                        </motion.div>

                        <div className="flex-1">
                            <motion.h1
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="font-display text-2xl font-bold"
                            >
                                {user.name || "Profile"}
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-white/70 text-sm mt-1"
                            >
                                {user.email}
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex items-center gap-4 mt-3 text-sm"
                            >
                                <span className="flex items-center gap-1.5">
                                    <History className="h-4 w-4 text-white/50" />
                                    {user.total_attempts} attempt{user.total_attempts !== 1 ? "s" : ""}
                                </span>
                                {user.last_attempt_at && (
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="h-4 w-4 text-white/50" />
                                        Last: {formatDate(user.last_attempt_at)}
                                    </span>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </Container>
            </div>

            {/* Attempts List */}
            <Container className="relative -mt-8 pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <GlassPanel className="p-6">
                        <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                            <History className="h-5 w-5 text-brand" />
                            Analysis History
                        </h2>

                        {attempts.length === 0 ? (
                            <p className="text-slate-500 text-center py-8">
                                No analyses yet. Start your first one!
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {attempts.map((attempt, idx) => {
                                    const prevScore = attempts[idx + 1]?.final_score;
                                    const delta = getScoreDelta(attempt.final_score, prevScore);

                                    return (
                                        <Link
                                            key={attempt.attempt_id}
                                            href={`/report?attempt_id=${attempt.attempt_id}`}
                                        >
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 * idx }}
                                                className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand/20 to-brand/10 flex items-center justify-center">
                                                        <Star className="h-5 w-5 text-brand" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-800">
                                                            Attempt #{attempts.length - idx}
                                                        </p>
                                                        <p className="text-sm text-slate-500">
                                                            {formatDate(attempt.timestamp)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    {delta && (
                                                        <span className={`flex items-center gap-1 text-sm font-medium ${delta.direction === "up"
                                                            ? "text-emerald-500"
                                                            : delta.direction === "down"
                                                                ? "text-red-500"
                                                                : "text-slate-400"
                                                            }`}>
                                                            {delta.direction === "up" && <TrendingUp className="h-4 w-4" />}
                                                            {delta.direction === "down" && <TrendingDown className="h-4 w-4" />}
                                                            {delta.direction === "same" && <Minus className="h-4 w-4" />}
                                                            {delta.value}
                                                        </span>
                                                    )}
                                                    <div className="text-right">
                                                        <p className={`text-2xl font-bold ${getScoreColor(attempt.final_score)}`}>
                                                            {attempt.final_score}
                                                        </p>
                                                        <p className="text-xs text-slate-400">/ 100</p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}

                        <div className="mt-6 pt-6 border-t border-slate-200">
                            <Link href="/intake">
                                <Button variant="primary" className="w-full">
                                    Run New Analysis
                                </Button>
                            </Link>
                        </div>
                    </GlassPanel>
                </motion.div>
            </Container>
        </PageShell>
    );
}
