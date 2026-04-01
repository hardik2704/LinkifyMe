"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/layout/Container";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { confirmPayment } from "@/lib/api";

const REDIRECT_SECONDS = 3;

export default function PaymentSuccessPage() {
    const router = useRouter();
    const [confirmStatus, setConfirmStatus] = useState<"confirming" | "confirmed" | "error">("confirming");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(REDIRECT_SECONDS);

    // Confirm payment with backend on mount
    useEffect(() => {
        const uniqueId = sessionStorage.getItem("linkify_unique_id");
        if (!uniqueId) {
            router.push("/intake");
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const razorpayPaymentId =
            params.get("razorpay_payment_id") || params.get("id") || undefined;

        confirmPayment({
            unique_id: uniqueId,
            status: "succeeded",
            razorpay_payment_id: razorpayPaymentId,
        })
            .then(() => {
                sessionStorage.setItem("linkify_payment_confirmed", "true");
                setConfirmStatus("confirmed");
            })
            .catch((err) => {
                setErrorMsg(err instanceof Error ? err.message : "Confirmation failed");
                setConfirmStatus("error");
            });
    }, [router]);

    // Start countdown once payment is confirmed
    useEffect(() => {
        if (confirmStatus !== "confirmed") return;

        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    router.push("/loader");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [confirmStatus, router]);

    // Progress ring value: 100 → 0 as countdown goes 3 → 0
    const ringProgress = (countdown / REDIRECT_SECONDS) * 100;

    // ── Error state ─────────────────────────────────────────────────────────
    if (confirmStatus === "error") {
        return (
            <PageShell variant="marketing">
                <div className="min-h-screen flex items-center justify-center py-16">
                    <Container className="max-w-lg">
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
                        >
                            <GlassPanel className="p-10 text-center">
                                <Badge tone="warning" className="mb-6">
                                    Confirmation issue
                                </Badge>
                                <h1 className="font-display font-black text-3xl text-slate-900 mb-3">
                                    Almost there…
                                </h1>
                                <p className="text-slate-500 text-base mb-6">
                                    Your payment went through, but we had trouble confirming it.
                                    Try refreshing — your analysis will still run.
                                </p>
                                <p className="text-xs text-rose-500 mb-6">{errorMsg}</p>
                                <Button
                                    size="lg"
                                    onClick={() => window.location.reload()}
                                    className="w-full"
                                >
                                    Retry Confirmation
                                </Button>
                            </GlassPanel>
                        </motion.div>
                    </Container>
                </div>
            </PageShell>
        );
    }

    // ── Success state ────────────────────────────────────────────────────────
    return (
        <PageShell variant="marketing">
            <div className="min-h-screen flex items-center justify-center py-16">
                <Container className="max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
                    >
                        <GlassPanel className="p-10 text-center">

                            {/* Icon */}
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 260,
                                    damping: 18,
                                    delay: 0.15,
                                }}
                                className="mx-auto h-24 w-24 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mb-6"
                            >
                                <CheckCircle className="h-12 w-12 text-emerald-500" strokeWidth={1.5} />
                            </motion.div>

                            {/* Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.35 }}
                                className="flex justify-center mb-4"
                            >
                                <Badge tone="success">Payment Confirmed</Badge>
                            </motion.div>

                            {/* Heading */}
                            <motion.h1
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.38, duration: 0.35 }}
                                className="font-display font-black text-4xl sm:text-5xl text-slate-900 mb-3 tracking-tight"
                            >
                                You&apos;re all set!
                            </motion.h1>

                            {/* Sub-text */}
                            <motion.p
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.46, duration: 0.35 }}
                                className="text-slate-500 text-lg leading-relaxed mb-8"
                            >
                                Your payment was successful. We&apos;re already running your
                                AI-powered LinkedIn analysis in the background.
                            </motion.p>

                            {/* Countdown ring + redirect message */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.55, duration: 0.35 }}
                                className="flex flex-col items-center gap-3 mb-8"
                            >
                                {confirmStatus === "confirming" ? (
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <span className="inline-block h-4 w-4 rounded-full border-2 border-brand/30 border-t-brand animate-spin" />
                                        Confirming payment…
                                    </div>
                                ) : (
                                    <>
                                        <div className="relative flex items-center justify-center">
                                            <ProgressRing
                                                value={ringProgress}
                                                size={72}
                                                strokeWidth={4}
                                                className="text-brand"
                                            />
                                            <span className="absolute font-display font-black text-xl text-brand">
                                                {countdown}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-400">
                                            Redirecting to your analysis in{" "}
                                            <span className="font-semibold text-slate-600">
                                                {countdown}s
                                            </span>
                                            …
                                        </p>
                                    </>
                                )}
                            </motion.div>

                            {/* CTA */}
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.62, duration: 0.35 }}
                            >
                                <Button
                                    size="lg"
                                    className="w-full"
                                    rightIcon={<ArrowRight className="h-4 w-4" />}
                                    onClick={() => router.push("/loader")}
                                    disabled={confirmStatus === "confirming"}
                                >
                                    Go to My Analysis
                                </Button>
                            </motion.div>

                            {/* Footer note */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.72, duration: 0.35 }}
                                className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400"
                            >
                                <Sparkles className="h-3.5 w-3.5 text-brand/60" />
                                <span>LinkedIn scraping has already started</span>
                            </motion.div>

                        </GlassPanel>
                    </motion.div>
                </Container>
            </div>
        </PageShell>
    );
}
