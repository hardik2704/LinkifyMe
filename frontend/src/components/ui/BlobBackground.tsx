"use client";

import { cn } from "@/lib/cn";
import { motion } from "framer-motion";

type BlobVariant = "marketing" | "dashboard" | "loaderLight";

interface BlobBackgroundProps {
    variant?: BlobVariant;
    className?: string;
}

export function BlobBackground({ variant = "marketing", className }: BlobBackgroundProps) {
    return (
        <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
            {/* Top-left blob */}
            <motion.div
                className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full blur-3xl"
                style={{
                    background: variant === "dashboard"
                        ? "rgba(241, 245, 249, 0.8)"
                        : "rgba(37, 99, 235, 0.08)",
                }}
                animate={{
                    x: [0, 30, 0],
                    y: [0, 20, 0],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Bottom-right blob */}
            <motion.div
                className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full blur-3xl"
                style={{
                    background: variant === "dashboard"
                        ? "rgba(241, 245, 249, 0.8)"
                        : "rgba(99, 102, 241, 0.06)",
                }}
                animate={{
                    x: [0, -20, 0],
                    y: [0, -30, 0],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Center-right blob */}
            <motion.div
                className="absolute top-1/3 right-0 w-1/3 h-1/3 rounded-full blur-3xl"
                style={{
                    background: variant === "dashboard"
                        ? "rgba(241, 245, 249, 0.5)"
                        : "rgba(56, 189, 248, 0.05)",
                }}
                animate={{
                    x: [0, -15, 0],
                    y: [0, 25, 0],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
        </div>
    );
}
