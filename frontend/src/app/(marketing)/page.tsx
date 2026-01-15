"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Sparkles, BarChart3, Search, Zap, Star, ChevronRight } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { TopNav } from "@/components/layout/TopNav";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function LandingPage() {
    return (
        <PageShell variant="marketing">
            <TopNav mode="marketing" />

            {/* Hero Section */}
            <section className="relative pt-32 pb-24 lg:pt-44 lg:pb-32">
                <Container className="relative z-10">
                    <div className="mx-auto max-w-4xl text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="mb-6"
                        >
                            <Badge tone="brand" className="px-4 py-1">
                                <Sparkles className="h-3 w-3 mr-1" />
                                AI-Powered LinkedIn Optimization
                            </Badge>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6"
                        >
                            Turn Your LinkedIn Into a{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-light">
                                Client Magnet
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
                        >
                            Get a data-driven audit of your profile, AI-powered rewrite suggestions,
                            and a clear roadmap to rank in the top 1% of your industry.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4"
                        >
                            <Link href="/intake">
                                <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                                    Analyze My Profile Free
                                </Button>
                            </Link>
                            <Link href="#demo">
                                <Button variant="outline" size="lg">
                                    View Sample Report
                                </Button>
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className="mt-10 flex items-center justify-center gap-6 text-sm text-slate-500"
                        >
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span>No credit card required</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span>Results in 2 minutes</span>
                            </div>
                        </motion.div>
                    </div>
                </Container>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 border-t border-slate-100 bg-white/50">
                <Container>
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <Badge tone="neutral" className="mb-4">Features</Badge>
                        <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                            Everything You Need to Stand Out
                        </h2>
                        <p className="text-lg text-slate-600">
                            We analyze over 50 data points to give you the most comprehensive LinkedIn audit available.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Search className="h-6 w-6 text-brand" />}
                            title="SEO & Keywords"
                            description="Discover missing keywords recruiters search for and optimize your profile for maximum visibility."
                        />
                        <FeatureCard
                            icon={<Sparkles className="h-6 w-6 text-purple-500" />}
                            title="AI Rewrite"
                            description="Get instant, high-converting rewrite suggestions for your headline, about section, and more."
                        />
                        <FeatureCard
                            icon={<BarChart3 className="h-6 w-6 text-green-500" />}
                            title="Impact Scoring"
                            description="See exactly where you stand with a 0-100 score benchmarked against top performers."
                        />
                    </div>
                </Container>
            </section>

            {/* How It Works */}
            <section className="py-24">
                <Container>
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <Badge tone="neutral" className="mb-4">How It Works</Badge>
                        <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                            Three Simple Steps
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { step: "01", title: "Enter Your URL", desc: "Paste your LinkedIn profile URL and tell us your target audience." },
                            { step: "02", title: "AI Analysis", desc: "Our AI scans your profile against 50+ optimization criteria." },
                            { step: "03", title: "Get Results", desc: "Receive a detailed report with scores and actionable improvements." },
                        ].map((item, idx) => (
                            <div key={idx} className="relative">
                                <div className="text-6xl font-bold text-slate-100 mb-4">{item.step}</div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-2">{item.title}</h3>
                                <p className="text-slate-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* CTA Section */}
            <section className="py-24">
                <Container>
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 py-20 text-center">
                        <div className="absolute inset-0 bg-brand/10 blur-3xl" />
                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-6">
                                Ready to Optimize Your Profile?
                            </h2>
                            <p className="text-lg text-slate-300 mb-8">
                                Join 10,000+ professionals who have transformed their LinkedIn presence.
                            </p>
                            <Link href="/intake">
                                <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100" rightIcon={<ArrowRight className="h-5 w-5" />}>
                                    Get Started Free
                                </Button>
                            </Link>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-slate-100">
                <Container>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-brand" />
                            <span className="font-bold text-slate-900">LinkifyMe.</span>
                        </div>
                        <p className="text-sm text-slate-500">© 2026 LinkifyMe. All rights reserved.</p>
                    </div>
                </Container>
            </footer>
        </PageShell>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <Card variant="elevated" className="group hover:-translate-y-1 transition-transform duration-300">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 group-hover:bg-brand/10 transition-colors">
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-600 leading-relaxed">{description}</p>
        </Card>
    );
}
