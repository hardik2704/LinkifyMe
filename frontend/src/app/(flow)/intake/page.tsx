"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Sparkles, User, History } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/layout/Container";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { lookupUser, submitIntake, type UserInfo } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function IntakePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [linkedinUrl, setLinkedinUrl] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [targetGroup, setTargetGroup] = useState("");

    // Returning user state
    const [returningUser, setReturningUser] = useState<UserInfo | null>(null);
    const [isCheckingUser, setIsCheckingUser] = useState(false);

    // Debounced user lookup when LinkedIn URL changes
    const checkForReturningUser = useCallback(async (url: string) => {
        if (!url || url.length < 20) {
            setReturningUser(null);
            return;
        }

        setIsCheckingUser(true);
        try {
            const result = await lookupUser(url);
            if (result.found && result.user) {
                setReturningUser(result.user);
                // Pre-fill email if available
                if (result.user.email && !email) {
                    setEmail(result.user.email);
                }
                if (result.user.phone && !phone) {
                    setPhone(result.user.phone);
                }
            } else {
                setReturningUser(null);
            }
        } catch {
            // Silently fail - user lookup is optional
            setReturningUser(null);
        } finally {
            setIsCheckingUser(false);
        }
    }, [email, phone]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (linkedinUrl.includes("linkedin.com/in/")) {
                checkForReturningUser(linkedinUrl);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [linkedinUrl, checkForReturningUser]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const data = await submitIntake({
                linkedin_url: linkedinUrl,
                email: email,
                phone: phone || undefined,
                target_group: targetGroup,
            });

            // Store user info for loader page
            sessionStorage.setItem("linkify_unique_id", data.unique_id);
            if (data.user_id) {
                sessionStorage.setItem("linkify_user_id", data.user_id);
            }
            if (data.is_returning_user) {
                sessionStorage.setItem("linkify_returning_user", "true");
                sessionStorage.setItem("linkify_previous_attempts", String(data.previous_attempts_count));
            }

            router.push("/loader");

        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
            setIsLoading(false);
        }
    };

    return (
        <PageShell variant="marketing">
            {/* Header */}
            <div className="bg-gradient-to-b from-brand to-brand-dark pt-8 pb-16 text-white">
                <Container>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors mb-8"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to home
                    </Link>

                    <div className="text-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center justify-center mb-4"
                        >
                            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                                <Search className="h-6 w-6" />
                            </div>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="font-display text-3xl sm:text-4xl font-bold mb-2"
                        >
                            Analyze Your LinkedIn
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-white/70"
                        >
                            Get AI-powered insights to boost your profile
                        </motion.p>
                    </div>
                </Container>
            </div>

            {/* Form */}
            <Container className="relative -mt-8 pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="max-w-xl mx-auto"
                >
                    <GlassPanel className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Returning User Banner */}
                            {returningUser && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                            <User className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-emerald-800">
                                                Welcome back{returningUser.name ? `, ${returningUser.name.split(" ")[0]}` : ""}! 👋
                                            </p>
                                            <p className="text-sm text-emerald-600 mt-0.5">
                                                You&apos;ve completed {returningUser.total_attempts} analysis{returningUser.total_attempts !== 1 ? "es" : ""} before.
                                            </p>
                                            <Link
                                                href={`/profile?user_id=${returningUser.user_id}`}
                                                className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:text-emerald-800 mt-2"
                                            >
                                                <History className="h-4 w-4" />
                                                View your history →
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {error && (
                                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                                    {error}
                                </div>
                            )}

                            <div>
                                <Label htmlFor="linkedin-url" required>
                                    LinkedIn Profile URL
                                </Label>
                                <Input
                                    id="linkedin-url"
                                    placeholder="https://www.linkedin.com/in/your-username/"
                                    value={linkedinUrl}
                                    onChange={(e) => setLinkedinUrl(e.target.value)}
                                    required
                                />
                                <p className="mt-1.5 text-xs text-slate-500">
                                    Personal profiles only (not company pages)
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="email" required>
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <p className="mt-1.5 text-xs text-slate-500">
                                    We&apos;ll send your detailed report here
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="phone">Phone Number (Optional)</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="+91 98765 43210"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="target" required>
                                    Who do you want to attract?
                                </Label>
                                <Select
                                    id="target"
                                    placeholder="Select your target audience..."
                                    options={[
                                        { value: "recruiters", label: "Recruiters & Hiring Managers" },
                                        { value: "clients", label: "Clients & Brands" },
                                        { value: "vcs", label: "Investors & VCs" },
                                    ]}
                                    value={targetGroup}
                                    onChange={(e) => setTargetGroup(e.target.value)}
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full"
                                isLoading={isLoading}
                                rightIcon={!isLoading && <Sparkles className="h-4 w-4" />}
                            >
                                {isLoading ? "Analyzing..." : "Analyze My Profile"}
                            </Button>
                        </form>

                        <p className="text-center text-xs text-slate-500 mt-6">
                            By submitting, you agree to our{" "}
                            <Link href="#" className="text-brand hover:underline">
                                Privacy Policy
                            </Link>
                        </p>
                    </GlassPanel>
                </motion.div>
            </Container>
        </PageShell>
    );
}
