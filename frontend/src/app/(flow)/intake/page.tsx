"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Sparkles } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/layout/Container";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE}/api/intake`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    linkedin_url: linkedinUrl,
                    email: email,
                    phone: phone || undefined,
                    target_group: targetGroup,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Failed to start analysis");
            }

            const data = await response.json();

            // Store the unique_id and redirect to loader
            sessionStorage.setItem("linkify_unique_id", data.unique_id);
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
