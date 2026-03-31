"use client";

import React, { useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

export const MouseSpotlight = () => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <motion.div
            className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
            style={{
                background: useTransform(
                    [mouseX, mouseY],
                    ([x, y]) => `radial-gradient(500px circle at ${x}px ${y}px, rgba(99, 102, 241, 0.07), transparent 40%)`
                ),
            }}
        />
    );
};

export const GridPattern = () => {
    return (
        <div className="absolute inset-0 z-0 opacity-[0.03] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]">
            <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
        </div>
    );
};

export const MarketingBackground: React.FC = () => {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <GridPattern />
            {/* Indigo Glow Top Left */}
            <div className="absolute top-[-20%] left-[-10%] w-[40vw] h-[40vw] bg-indigo-500/[0.06] rounded-full blur-[140px] animate-slow-spin" />
            {/* Purple Glow Bottom Right */}
            <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] bg-purple-500/[0.06] rounded-full blur-[140px] animate-slow-spin" style={{ animationDirection: "reverse" }} />
            {/* Soft Blue Center */}
            <div className="absolute top-[20%] right-[10%] w-[40vw] h-[40vw] bg-blue-400/[0.03] rounded-full blur-[120px] animate-pulse-slow" />

            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] brightness-110 contrast-125 mix-blend-soft-light" />
        </div>
    );
};
