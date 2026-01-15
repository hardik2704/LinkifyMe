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

export default function IntakePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            router.push("/loader");
        }, 1000);
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
                            <div>
                                <Label htmlFor="linkedin-url" required>
                                    LinkedIn Profile URL
                                </Label>
                                <Input
                                    id="linkedin-url"
                                    placeholder="https://www.linkedin.com/in/your-username/"
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
                                    defaultValue=""
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
