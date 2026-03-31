"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { XCircle, ArrowLeft, RotateCcw } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/layout/Container";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { confirmPayment } from "@/lib/api";

export default function PaymentFailurePage() {
    const router = useRouter();

    useEffect(() => {
        const uniqueId = sessionStorage.getItem("linkify_unique_id");
        if (!uniqueId) return;

        // Notify backend of failed payment
        confirmPayment({
            unique_id: uniqueId,
            status: "failed",
        }).catch(() => {
            // Best effort — don't block the UI
        });
    }, []);

    return (
        <PageShell variant="marketing">
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-brand to-brand-dark text-white">
                <Container className="max-w-md">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <GlassPanel className="p-8 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", duration: 0.5 }}
                                className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-6"
                            >
                                <XCircle className="h-8 w-8 text-red-500" />
                            </motion.div>

                            <h1 className="font-display text-2xl font-bold text-slate-900 mb-2">
                                Payment Failed
                            </h1>
                            <p className="text-slate-600 mb-8">
                                Your payment was not completed. Don&apos;t worry — no charges were made.
                                You can try again or go back to the intake form.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Button
                                    variant="outline"
                                    onClick={() => router.push("/intake")}
                                    className="inline-flex items-center gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back to Intake
                                </Button>
                                <Button
                                    onClick={() => router.push("/payment")}
                                    className="inline-flex items-center gap-2"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    Retry Payment
                                </Button>
                            </div>
                        </GlassPanel>
                    </motion.div>
                </Container>
            </div>
        </PageShell>
    );
}
