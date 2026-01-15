"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

interface DonutScoreProps {
    score: number;
    label?: string;
    size?: number;
    className?: string;
}

export function DonutScore({ score, label = "SCORE", size = 140, className }: DonutScoreProps) {
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (score / 100) * circumference;

    const getColor = () => {
        if (score >= 80) return "text-green-500";
        if (score >= 60) return "text-amber-500";
        return "text-rose-500";
    };

    return (
        <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-slate-100"
                />
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    className={getColor()}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-slate-900">{score}</span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
            </div>
        </div>
    );
}
