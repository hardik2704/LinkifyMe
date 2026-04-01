"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { XCircle, ArrowLeft, RotateCcw, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/layout/Container";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { confirmPayment } from "@/lib/api";

export default function PaymentFailurePage() {
    const router = useRouter();

    // Notify backend of failed payment (best-effort)
    useEffect(() => {
        const uniqueId = sessionStorage.getItem("linkify_unique_id");
        if (!uniqueId) return;

        confirmPayment({ unique_id: uniqueId, status: "failed" }).catch(() => {});
    }, []);

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
                                className="mx-auto h-24 w-24 rounded-full bg-rose-50 border-2 border-rose-200 flex items-center justify-center mb-6"
                            >
                                <XCircle className="h-12 w-12 text-rose-500" strokeWidth={1.5} />
                            </motion.div>

                            {/* Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.35 }}
                                className="flex justify-center mb-4"
                            >
                                <Badge tone="critical">Payment Failed</Badge>
                            </motion.div>

                            {/* Heading */}
                            <motion.h1
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.38, duration: 0.35 }}
                                className="font-display font-black text-4xl sm:text-5xl text-slate-900 mb-3 tracking-tight"
                            >
                                Payment not completed
                            </motion.h1>

                            {/* Sub-text */}
                            <motion.p
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.46, duration: 0.35 }}
                                className="text-slate-500 text-lg leading-relaxed mb-6"
                            >
                                Something went wrong during checkout. Don&apos;t worry — you
                                can try again or go back and update your details.
                            </motion.p>

                            {/* "No charges" pill */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.52, duration: 0.35 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold mb-8"
                            >
                                <ShieldCheck className="h-4 w-4" />
                                No charges were made to your account
                            </motion.div>

                            {/* Divider */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.58, duration: 0.3 }}
                                className="border-t border-slate-100 mb-8"
                            />

                            {/* CTA buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.62, duration: 0.35 }}
                                className="flex flex-col sm:flex-row gap-3"
                            >
                                <Button
                                    size="lg"
                                    className="flex-1"
                                    leftIcon={<RotateCcw className="h-4 w-4" />}
                                    onClick={() => router.push("/payment")}
                                >
                                    Try Again
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="flex-1"
                                    leftIcon={<ArrowLeft className="h-4 w-4" />}
                                    onClick={() => router.push("/intake")}
                                >
                                    Back to Intake
                                </Button>
                            </motion.div>

                            {/* Help text */}
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.72, duration: 0.35 }}
                                className="mt-6 text-xs text-slate-400"
                            >
                                If the issue persists, contact us at{" "}
                                <a
                                    href="mailto:support@linkifyme.com"
                                    className="text-brand hover:underline"
                                >
                                    support@linkifyme.com
                                </a>
                            </motion.p>

                        </GlassPanel>
                    </motion.div>
                </Container>
            </div>
        </PageShell>
    );
}
