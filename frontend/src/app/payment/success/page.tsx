"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, BrainCircuit } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/layout/Container";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { confirmPayment } from "@/lib/api";

function SuccessContent() {
    const router = useRouter();
    const [confirmed, setConfirmed] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const notifyBackend = async () => {
            const uniqueId = sessionStorage.getItem("linkify_unique_id");
            const rbUniqueId = sessionStorage.getItem("linkify_rb_unique_id");

            if (!uniqueId) {
                // No unique ID — skip confirmation and go to loader
                setConfirmed(true);
                return;
            }

            try {
                await confirmPayment({
                    unique_id: uniqueId,
                    rb_unique_id: rbUniqueId || undefined,
                    payment_status: "succeeded",
                });
                setConfirmed(true);
            } catch (err) {
                console.error("Payment confirm failed:", err);
                // Still redirect — the backend may have started scoring anyway
                setConfirmed(true);
            }
        };

        notifyBackend();
    }, []);

    // Redirect to loader after confirmation
    useEffect(() => {
        if (!confirmed) return;

        const timer = setTimeout(() => {
            router.push("/loader");
        }, 2500);

        return () => clearTimeout(timer);
    }, [confirmed, router]);

    return (
        <PageShell variant="marketing">
            <Container className="min-h-screen flex items-center justify-center py-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-lg"
                >
                    <GlassPanel className="p-10 text-center relative overflow-hidden">
                        {/* Background glowing effect */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-emerald-500/10 blur-3xl -z-10 rounded-full" />
                        
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                        </motion.div>
                        
                        <h1 className="text-3xl font-heading font-bold text-gray-900 mb-4">
                            Payment Successful!
                        </h1>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            Your transaction has been securely processed. We&apos;re now generating your detailed profile analysis.
                        </p>

                        {/* Status indicator */}
                        <div className="flex items-center justify-center gap-3 text-emerald-600 font-medium bg-emerald-50 py-3 px-4 rounded-xl mb-4">
                            {confirmed ? (
                                <>
                                    <BrainCircuit className="w-5 h-5 animate-pulse" />
                                    AI Analysis starting...
                                </>
                            ) : (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Confirming payment...
                                </>
                            )}
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="flex items-center justify-center gap-3 text-slate-500 font-medium"
                        >
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Redirecting to your results...</span>
                        </motion.div>
                    </GlassPanel>
                </motion.div>
            </Container>
        </PageShell>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
