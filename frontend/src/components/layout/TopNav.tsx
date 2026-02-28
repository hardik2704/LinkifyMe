"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { Container } from "./Container";
import { Button } from "@/components/ui/Button";
import { Zap, Share2, Download, Check } from "lucide-react";

type TopNavMode = "marketing" | "dashboard";

interface TopNavProps {
    mode?: TopNavMode;
    onShare?: () => void;
    isShared?: boolean;
}

export function TopNav({ mode = "marketing", onShare, isShared }: TopNavProps) {
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
                        <Image
                            src="/logos/LinkifyMe_Logo_HomePage.svg"
                            alt="LinkifyMe"
                            width={240}
                            height={120}
                            className="h-20 w-auto"
                        />
                    </Link>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            leftIcon={isShared ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
                            onClick={onShare}
                            className={isShared ? "border-emerald-200 bg-emerald-50" : ""}
                        >
                            {isShared ? "Link Copied!" : "Share Link"}
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
                        <Image
                            src="/logos/LinkifyMe_Logo_HomePage.svg"
                            alt="LinkifyMe"
                            width={80}
                            height={40}
                            className="h-8 w-auto"
                        />
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
