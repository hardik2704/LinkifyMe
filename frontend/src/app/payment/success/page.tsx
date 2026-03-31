"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/layout/Container";
import { GlassPanel } from "@/components/ui/GlassPanel";

function SuccessContent() {
    const router = useRouter();

    useEffect(() => {
        // Automatically redirect to the loader page after 3 seconds
        const timer = setTimeout(() => {
            router.push("/loader");
        }, 3000);

        return () => clearTimeout(timer);
    }, [router]);

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
                            Your transaction has been securely processed. We're now generating your detailed profile analysis.
                        </p>

                        <div className="flex items-center justify-center gap-3 text-emerald-600 font-medium bg-emerald-50 py-3 px-4 rounded-xl">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Redirecting to your results...
                        </div>
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
