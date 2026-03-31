"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { XCircle, ArrowRight, RefreshCw, ExternalLink } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/layout/Container";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Button } from "@/components/ui/Button";

function FailureContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [paymentLink, setPaymentLink] = useState<string | null>(null);
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        // Try to recover the payment link from sessionStorage
        const storedPaymentLink = sessionStorage.getItem("linkify_payment_link");
        if (storedPaymentLink) {
            setPaymentLink(storedPaymentLink);
        }
    }, []);

    const handleRetryPayment = () => {
        if (paymentLink) {
            // Retry with the same payment link (no need to create a new lead)
            setIsRedirecting(true);
            setTimeout(() => {
                window.location.href = paymentLink;
            }, 300);
        } else {
            // No payment link available — go back to intake
            handleStartOver();
        }
    };

    const handleStartOver = () => {
        // Construct the redirect URL with existing params + reattempt=true
        const params = new URLSearchParams(searchParams.toString());
        params.set("reattempt", "true");

        // Try to preserve linkedin_url and email for the retry
        const linkedinUrl = sessionStorage.getItem("linkify_linkedin_url");
        const email = sessionStorage.getItem("linkify_email");
        if (linkedinUrl) params.set("linkedin_url", linkedinUrl);
        if (email) params.set("email", email);

        router.push(`/intake?${params.toString()}`);
    };

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
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-red-500/10 blur-3xl -z-10 rounded-full" />
                        
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                            <XCircle className="w-10 h-10 text-red-600" />
                        </motion.div>
                        
                        <h1 className="text-3xl font-heading font-bold text-gray-900 mb-4">
                            Payment Failed
                        </h1>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            Don&apos;t worry! Your data is safe. We couldn&apos;t process your payment. Please try again with a different payment method.
                        </p>

                        <div className="space-y-3">
                            {/* Retry with same payment link */}
                            {paymentLink && (
                                <div onClick={handleRetryPayment}>
                                    <Button 
                                        size="lg" 
                                        className="w-full flex items-center justify-center gap-2"
                                        isLoading={isRedirecting}
                                        rightIcon={!isRedirecting && <ExternalLink className="w-4 h-4" />}
                                    >
                                        {isRedirecting ? "Redirecting..." : "Retry Payment"}
                                    </Button>
                                </div>
                            )}

                            {/* Start over */}
                            <div onClick={handleStartOver}>
                                <Button 
                                    size="lg" 
                                    variant="outline"
                                    className="w-full flex items-center justify-center gap-2"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Start Over
                                </Button>
                            </div>
                        </div>

                        <p className="text-xs text-slate-500 mt-6">
                            Having trouble? Contact us at{" "}
                            <a href="mailto:support@linkifyme.com" className="text-brand hover:underline">
                                support@linkifyme.com
                            </a>
                        </p>
                    </GlassPanel>
                </motion.div>
            </Container>
        </PageShell>
    );
}

export default function PaymentFailurePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <FailureContent />
        </Suspense>
    );
}
