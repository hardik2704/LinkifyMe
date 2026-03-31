"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Loader2 } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/layout/Container";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { confirmPayment } from "@/lib/api";

export default function PaymentSuccessPage() {
    const router = useRouter();
    const [status, setStatus] = useState<"confirming" | "confirmed" | "error">("confirming");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const uniqueId = sessionStorage.getItem("linkify_unique_id");

        if (!uniqueId) {
            router.push("/intake");
            return;
        }

        // Extract Razorpay params from URL if present
        const params = new URLSearchParams(window.location.search);
        const razorpayPaymentId = params.get("razorpay_payment_id") || params.get("id") || undefined;

        async function confirm() {
            try {
                await confirmPayment({
                    unique_id: uniqueId!,
                    status: "succeeded",
                    razorpay_payment_id: razorpayPaymentId,
                });

                sessionStorage.setItem("linkify_payment_confirmed", "true");
                setStatus("confirmed");

                // Redirect to loader after brief success message
                setTimeout(() => {
                    router.push("/loader");
                }, 1500);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to confirm payment");
                setStatus("error");
            }
        }

        confirm();
    }, [router]);

    return (
        <PageShell variant="marketing">
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-brand to-brand-dark text-white">
                <Container className="max-w-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <GlassPanel className="p-8 text-center">
                            {status === "error" ? (
                                <>
                                    <h1 className="font-display text-2xl font-bold text-slate-900 mb-2">
                                        Confirmation Error
                                    </h1>
                                    <p className="text-slate-600 mb-4">{error}</p>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="text-brand font-medium hover:underline"
                                    >
                                        Retry
                                    </button>
                                </>
                            ) : (
                                <>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", duration: 0.5 }}
                                        className="mx-auto h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mb-6"
                                    >
                                        <CheckCircle className="h-8 w-8 text-emerald-500" />
                                    </motion.div>
                                    <h1 className="font-display text-2xl font-bold text-slate-900 mb-2">
                                        Payment Successful!
                                    </h1>
                                    <p className="text-slate-600 mb-6">
                                        {status === "confirming"
                                            ? "Confirming your payment..."
                                            : "Redirecting to your analysis..."}
                                    </p>
                                    <Loader2 className="h-5 w-5 animate-spin text-brand mx-auto" />
                                </>
                            )}
                        </GlassPanel>
                    </motion.div>
                </Container>
            </div>
        </PageShell>
    );
}
