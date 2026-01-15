"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BrainCircuit, FileText, Lightbulb, AlertCircle } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/layout/Container";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { StepPills, Step, StepState } from "@/components/ui/StepPills";
import { IconTile } from "@/components/ui/IconTile";
import { Button } from "@/components/ui/Button";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const STEPS = [
    { label: "Scraping", icon: <Search className="h-4 w-4" /> },
    { label: "AI Analysis", icon: <BrainCircuit className="h-4 w-4" /> },
    { label: "Report", icon: <FileText className="h-4 w-4" /> },
];

const TIPS = [
    "Profiles with professional headshots get 14x more views!",
    "Adding 5+ skills increases your profile views by 17x.",
    "A customized LinkedIn URL looks more professional.",
    "Profiles with a summary are 10x more likely to be viewed.",
];

export default function LoaderPage() {
    const router = useRouter();
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [tipIndex, setTipIndex] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState("Initializing...");

    const pollStatus = useCallback(async () => {
        const uniqueId = sessionStorage.getItem("linkify_unique_id");

        if (!uniqueId) {
            setError("No analysis ID found. Please start a new analysis.");
            return null;
        }

        try {
            const response = await fetch(`${API_BASE}/api/status/${uniqueId}`);

            if (!response.ok) {
                throw new Error("Failed to fetch status");
            }

            const data = await response.json();
            return data;
        } catch (err) {
            console.error("Polling error:", err);
            return null;
        }
    }, []);

    useEffect(() => {
        let pollInterval: NodeJS.Timeout;

        const poll = async () => {
            const status = await pollStatus();

            if (!status) return;

            // Update progress
            setProgress(status.progress_percent);

            // Update current step based on status
            if (status.current_step === "complete" || status.scrape_status === "completed") {
                setCurrentStep(3);
                setStatusMessage("Analysis Complete!");

                // Redirect to report
                if (status.customer_id) {
                    sessionStorage.setItem("linkify_customer_id", status.customer_id);
                    setTimeout(() => router.push("/report"), 1000);
                }
                return;
            }

            if (status.current_step === "scoring" || status.current_step === "scoring") {
                setCurrentStep(2);
                setStatusMessage("Running AI Analysis...");
            } else if (status.current_step === "scraping" || status.scrape_status === "scraping") {
                setCurrentStep(1);
                setStatusMessage("Scraping Your LinkedIn...");
            } else if (status.current_step === "payment" || status.payment_status === "succeeded") {
                setCurrentStep(0);
                setStatusMessage("Starting Scrape...");
            } else {
                setCurrentStep(0);
                setStatusMessage("Preparing Analysis...");
            }

            // Check for errors
            if (status.error_message) {
                // Don't show Google Sheets errors to user, just use demo mode
                if (status.error_message.includes("Service account") ||
                    status.error_message.includes("Google")) {
                    // Demo mode - simulate progress
                    setProgress((prev) => Math.min(prev + 10, 95));
                } else {
                    setError(status.error_message);
                }
            }
        };

        // Initial poll
        poll();

        // Poll every 2 seconds
        pollInterval = setInterval(poll, 2000);

        return () => {
            if (pollInterval) {
                clearInterval(pollInterval);
            }
        };
    }, [pollStatus, router]);

    // Rotate tips
    useEffect(() => {
        const tipInterval = setInterval(() => {
            setTipIndex((prev) => (prev + 1) % TIPS.length);
        }, 5000);
        return () => clearInterval(tipInterval);
    }, []);

    // Demo mode: simulate progress if backend is not fully configured
    useEffect(() => {
        if (!error) {
            const demoInterval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(demoInterval);
                        // In demo mode, redirect to report with demo data
                        setTimeout(() => router.push("/report"), 500);
                        return 100;
                    }
                    // Calculate step
                    if (prev < 30) setCurrentStep(0);
                    else if (prev < 70) setCurrentStep(1);
                    else if (prev < 95) setCurrentStep(2);
                    else setCurrentStep(3);

                    return prev + 2;
                });
            }, 500);

            return () => clearInterval(demoInterval);
        }
    }, [error, router]);

    const steps: Step[] = STEPS.map((s, idx) => ({
        label: s.label,
        icon: s.icon,
        state: (idx < currentStep ? "done" : idx === currentStep ? "active" : "inactive") as StepState,
    }));

    const stepLabels = [
        { title: "Scraping Your LinkedIn...", subtitle: "Gathering profile information" },
        { title: "Running AI Analysis...", subtitle: "Evaluating against 50+ criteria" },
        { title: "Generating Report...", subtitle: "Preparing your insights" },
        { title: "Analysis Complete!", subtitle: "Redirecting to your report" },
    ];

    if (error) {
        return (
            <PageShell variant="loader">
                <Container className="flex items-center justify-center min-h-screen py-12">
                    <GlassPanel className="p-10 text-center max-w-md">
                        <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertCircle className="h-8 w-8 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Analysis Error</h2>
                        <p className="text-slate-600 mb-6">{error}</p>
                        <Button onClick={() => router.push("/intake")}>Try Again</Button>
                    </GlassPanel>
                </Container>
            </PageShell>
        );
    }

    return (
        <PageShell variant="loader">
            <Container className="flex items-center justify-center min-h-screen py-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-lg"
                >
                    <GlassPanel className="p-10 text-center">
                        {/* Progress Ring with Icon */}
                        <div className="relative mx-auto mb-8 w-fit">
                            <ProgressRing value={progress} size={140} strokeWidth={8} />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentStep}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                    >
                                        <IconTile
                                            icon={currentStep < STEPS.length ? STEPS[currentStep].icon : <FileText className="h-5 w-5" />}
                                            tone="brand"
                                            size="lg"
                                        />
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                            {/* Glow effect */}
                            <div className="absolute inset-0 -z-10 bg-brand/20 blur-3xl rounded-full scale-150" />
                        </div>

                        {/* Step Pills */}
                        <StepPills steps={steps} className="mb-8" />

                        {/* Status Text */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-8"
                            >
                                <h2 className="text-2xl font-bold text-slate-900 mb-1">
                                    {stepLabels[Math.min(currentStep, stepLabels.length - 1)].title}
                                </h2>
                                <p className="text-slate-500">
                                    {stepLabels[Math.min(currentStep, stepLabels.length - 1)].subtitle}
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        {/* Tip Card */}
                        <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                            <div className="flex items-start gap-3">
                                <Lightbulb className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <div className="text-left">
                                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">
                                        DID YOU KNOW?
                                    </p>
                                    <AnimatePresence mode="wait">
                                        <motion.p
                                            key={tipIndex}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="text-sm text-slate-600"
                                        >
                                            {TIPS[tipIndex]}
                                        </motion.p>
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </GlassPanel>
                </motion.div>
            </Container>
        </PageShell>
    );
}
