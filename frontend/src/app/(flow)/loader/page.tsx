"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BrainCircuit, FileText, Lightbulb } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Container } from "@/components/layout/Container";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { StepPills, Step, StepState } from "@/components/ui/StepPills";
import { IconTile } from "@/components/ui/IconTile";

const STEPS = [
    { label: "Scraping", icon: <Search className="h-4 w-4" />, duration: 4000 },
    { label: "AI Analysis", icon: <BrainCircuit className="h-4 w-4" />, duration: 5000 },
    { label: "Report", icon: <FileText className="h-4 w-4" />, duration: 2000 },
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

    useEffect(() => {
        // Progress simulation
        const totalDuration = STEPS.reduce((acc, s) => acc + s.duration, 0);
        const startTime = Date.now();

        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const newProgress = Math.min((elapsed / totalDuration) * 100, 100);
            setProgress(newProgress);

            // Calculate current step
            let accumulated = 0;
            for (let i = 0; i < STEPS.length; i++) {
                accumulated += STEPS[i].duration;
                if (elapsed < accumulated) {
                    setCurrentStep(i);
                    break;
                }
                if (i === STEPS.length - 1) {
                    setCurrentStep(STEPS.length);
                }
            }

            if (elapsed >= totalDuration) {
                clearInterval(interval);
                setTimeout(() => router.push("/report"), 500);
            }
        }, 50);

        return () => clearInterval(interval);
    }, [router]);

    // Rotate tips
    useEffect(() => {
        const tipInterval = setInterval(() => {
            setTipIndex((prev) => (prev + 1) % TIPS.length);
        }, 5000);
        return () => clearInterval(tipInterval);
    }, []);

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
