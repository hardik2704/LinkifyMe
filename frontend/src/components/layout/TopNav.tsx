"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Container } from "./Container";
import { Button } from "@/components/ui/Button";
import { Zap, Share2, Download } from "lucide-react";

type TopNavMode = "marketing" | "dashboard";

interface TopNavProps {
    mode?: TopNavMode;
}

export function TopNav({ mode = "marketing" }: TopNavProps) {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (mode === "dashboard") {
        return (
            <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
                <Container className="flex h-16 items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
                            <Zap className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-lg font-bold text-slate-900">LinkifyMe</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" leftIcon={<Share2 className="h-4 w-4" />}>
                            Share
                        </Button>
                        <Button variant="gradient" size="sm" leftIcon={<Download className="h-4 w-4" />}>
                            Export Report
                        </Button>
                    </div>
                </Container>
            </header>
        );
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            <div
                className={cn(
                    "transition-all duration-300",
                    isScrolled
                        ? "mx-auto mt-4 max-w-3xl rounded-full bg-white/80 backdrop-blur-xl border border-black/5 shadow-soft px-6"
                        : "bg-transparent"
                )}
            >
                <Container
                    className={cn(
                        "flex h-16 items-center justify-between",
                        isScrolled && "px-0"
                    )}
                >
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
                            <Zap className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-lg font-bold text-slate-900">LinkifyMe.</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                            Features
                        </Link>
                        <Link href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                            Pricing
                        </Link>
                        <Link href="/intake">
                            <Button size="sm">Get Started</Button>
                        </Link>
                    </div>
                </Container>
            </div>
        </header>
    );
}
