"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CreditCard, Loader2, AlertCircle } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/layout/Container";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";
import { createPaymentLink, confirmPayment } from "@/lib/api";

export default function PaymentPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<"loading" | "redirecting" | "error">("loading");

    useEffect(() => {
        const uniqueId = sessionStorage.getItem("linkify_unique_id");
        const email = sessionStorage.getItem("linkify_email");
        const phone = sessionStorage.getItem("linkify_phone");
        const name = sessionStorage.getItem("linkify_name");

        if (!uniqueId || !email || !phone) {
            router.push("/intake");
            return;
        }

        async function initPayment() {
            try {
                const result = await createPaymentLink({
                    unique_id: uniqueId!,
                    name: name || "",
                    email: email!,
                    mobile: phone!,
                });

                // Dev bypass — payment is skipped
                if (result.bypassed) {
                    await confirmPayment({
                        unique_id: uniqueId!,
                        status: "succeeded",
                    });
                    sessionStorage.setItem("linkify_payment_confirmed", "true");
                    router.push("/loader");
                    return;
                }

                // Redirect to Razorpay payment page
                if (result.payment_link) {
                    setStatus("redirecting");
                    window.location.href = result.payment_link;
                } else {
                    throw new Error("No payment link received");
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Something went wrong");
                setStatus("error");
            }
        }

        initPayment();
    }, [router]);

    return (
        <PageShell variant="marketing">
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-brand to-brand-dark text-white">
                <Container className="max-w-md">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <GlassPanel className="p-8 text-center">
                            {status === "error" ? (
                                <>
                                    <div className="mx-auto h-16 w-16 rounded-2xl bg-red-100 flex items-center justify-center mb-6">
                                        <AlertCircle className="h-8 w-8 text-red-500" />
                                    </div>
                                    <h1 className="font-display text-2xl font-bold text-slate-900 mb-2">
                                        Payment Setup Failed
                                    </h1>
                                    <p className="text-slate-600 mb-6">{error}</p>
                                    <div className="flex gap-3 justify-center">
                                        <Button
                                            variant="outline"
                                            onClick={() => router.push("/intake")}
                                        >
                                            Back to Intake
                                        </Button>
                                        <Button
                                            onClick={() => window.location.reload()}
                                        >
                                            Retry
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="mx-auto h-16 w-16 rounded-2xl bg-brand/10 flex items-center justify-center mb-6">
                                        <CreditCard className="h-8 w-8 text-brand" />
                                    </div>
                                    <h1 className="font-display text-2xl font-bold text-slate-900 mb-2">
                                        {status === "redirecting"
                                            ? "Redirecting to Payment..."
                                            : "Preparing Your Payment..."}
                                    </h1>
                                    <p className="text-slate-600 mb-6">
                                        {status === "redirecting"
                                            ? "You'll be taken to our secure payment page."
                                            : "Setting up your secure payment. This will only take a moment."}
                                    </p>
                                    <Loader2 className="h-6 w-6 animate-spin text-brand mx-auto" />
                                </>
                            )}
                        </GlassPanel>
                    </motion.div>
                </Container>
            </div>
        </PageShell>
    );
}
