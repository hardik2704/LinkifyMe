"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    Shield,
    Lock,
    CreditCard,
    Sparkles,
    CheckCircle2,
    Zap,
    FileText,
    ExternalLink,
    Loader2,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/layout/Container";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";

const FEATURES = [
    { icon: Sparkles, text: "AI-powered 12-section analysis" },
    { icon: FileText, text: "Personalized improvement roadmap" },
    { icon: Zap, text: "Actionable recommendations" },
];

export default function PaymentPage() {
    const router = useRouter();
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [paymentLink, setPaymentLink] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [linkedinUrl, setLinkedinUrl] = useState("");
    const [uniqueId, setUniqueId] = useState("");
    const [scrapingStarted, setScrapingStarted] = useState(false);

    // Scramble animation for the "preparing" text
    const [dotCount, setDotCount] = useState(1);

    useEffect(() => {
        // Load data from sessionStorage
        const storedPaymentLink = sessionStorage.getItem("linkify_payment_link");
        const storedEmail = sessionStorage.getItem("linkify_email");
        const storedLinkedinUrl = sessionStorage.getItem("linkify_linkedin_url");
        const storedUniqueId = sessionStorage.getItem("linkify_unique_id");

        if (!storedPaymentLink || !storedUniqueId) {
            // No payment data — redirect back to intake
            router.push("/intake");
            return;
        }

        setPaymentLink(storedPaymentLink);
        setEmail(storedEmail || "");
        setLinkedinUrl(storedLinkedinUrl || "");
        setUniqueId(storedUniqueId);
        setScrapingStarted(true);
    }, [router]);

    // Animate the dots
    useEffect(() => {
        const interval = setInterval(() => {
            setDotCount((prev) => (prev % 3) + 1);
        }, 600);
        return () => clearInterval(interval);
    }, []);

    const handleProceedToPayment = () => {
        if (!paymentLink) return;
        setIsRedirecting(true);

        // Small delay for the button animation to complete
        setTimeout(() => {
            window.location.href = paymentLink;
        }, 300);
    };

    // Extract username from LinkedIn URL for display
    const linkedinUsername = linkedinUrl
        ? linkedinUrl
              .replace(/https?:\/\/(www\.)?linkedin\.com\/in\//i, "")
              .replace(/\/$/, "")
        : "";

    return (
        <PageShell variant="marketing">
            {/* Header */}
            <div className="bg-gradient-to-b from-brand to-brand-dark pt-8 pb-16 text-white">
                <Container>
                    <Link
                        href="/intake"
                        className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors mb-8"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to form
                    </Link>

                    <div className="text-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center justify-center mb-4"
                        >
                            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                                <CreditCard className="h-6 w-6" />
                            </div>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="font-display text-3xl sm:text-4xl font-bold mb-2"
                        >
                            Complete Your Analysis
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-white/70"
                        >
                            One-time payment to unlock your personalized report
                        </motion.p>
                    </div>
                </Container>
            </div>

            {/* Payment Card */}
            <Container className="relative -mt-8 pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="max-w-xl mx-auto"
                >
                    <GlassPanel className="p-8 relative overflow-hidden">
                        {/* Background pulse */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-brand/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                        {/* Scraping in progress banner */}
                        {scrapingStarted && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                        <Loader2 className="h-4 w-4 text-emerald-600 animate-spin" />
                                    </div>
                                    <p className="text-sm text-emerald-700 font-medium">
                                        We&apos;re already preparing your data
                                        {".".repeat(dotCount)}
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* Order Summary */}
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4">
                                Order Summary
                            </h2>

                            {/* Profile info */}
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 mb-4">
                                <div className="h-10 w-10 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
                                    <Sparkles className="h-5 w-5 text-brand" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-slate-900 text-sm">
                                        LinkedIn Profile Analysis
                                    </p>
                                    {linkedinUsername && (
                                        <p className="text-xs text-slate-500 truncate mt-0.5">
                                            linkedin.com/in/{linkedinUsername}
                                        </p>
                                    )}
                                    {email && (
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Report sent to: {email}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* What's included */}
                            <div className="space-y-3 mb-6">
                                {FEATURES.map((feat, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + i * 0.1 }}
                                        className="flex items-center gap-3"
                                    >
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                        <span className="text-sm text-slate-600">
                                            {feat.text}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Price */}
                            <div className="flex items-center justify-between py-4 border-t border-dashed border-slate-200">
                                <span className="text-slate-600 font-medium">
                                    Total
                                </span>
                                <div className="text-right">
                                    <span className="text-3xl font-bold text-slate-900">
                                        ₹199
                                    </span>
                                    <span className="text-sm text-slate-500 ml-1">
                                        one-time
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Pay Button */}
                        <Button
                            type="button"
                            size="lg"
                            className="w-full"
                            isLoading={isRedirecting}
                            onClick={handleProceedToPayment}
                            rightIcon={
                                !isRedirecting && (
                                    <ExternalLink className="h-4 w-4" />
                                )
                            }
                        >
                            {isRedirecting
                                ? "Redirecting to Razorpay..."
                                : "Pay ₹199 — Unlock Report"}
                        </Button>

                        {/* Trust signals */}
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
                            <div className="flex items-center gap-1.5">
                                <Shield className="h-3.5 w-3.5" />
                                <span>Secure Payment</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Lock className="h-3.5 w-3.5" />
                                <span>256-bit SSL</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <CreditCard className="h-3.5 w-3.5" />
                                <span>Powered by Razorpay</span>
                            </div>
                        </div>

                        <p className="text-center text-xs text-slate-500 mt-4">
                            By proceeding, you agree to our{" "}
                            <Link
                                href="#"
                                className="text-brand hover:underline"
                            >
                                Terms of Service
                            </Link>{" "}
                            &{" "}
                            <Link
                                href="#"
                                className="text-brand hover:underline"
                            >
                                Refund Policy
                            </Link>
                        </p>
                    </GlassPanel>
                </motion.div>
            </Container>
        </PageShell>
    );
}
