"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Menu } from "lucide-react";
import { MarketingButton } from "./MarketingButton";

export const MarketingNav: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4"
            >
                <motion.div
                    layout
                    className={`relative flex items-center justify-between px-6 transition-[width,height,background-color,border-color,box-shadow,backdrop-filter] duration-150 ease-out ${isScrolled
                        ? "w-[90%] md:w-[60%] lg:w-[50%] h-16 bg-white/70 backdrop-blur-xl border border-black/5 rounded-full shadow-lg"
                        : "w-full max-w-7xl h-20 bg-transparent border-transparent"
                        }`}
                >
                    {/* Logo */}
                    <Link href="/" className="flex items-center cursor-pointer">
                        <AnimatePresence mode="wait">
                            {!isScrolled ? (
                                <motion.img
                                    key="full-logo"
                                    src="/logos/linkifyme-full.png"
                                    alt="LinkifyMe"
                                    className="h-12 md:h-16 w-auto object-contain"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                />
                            ) : (
                                <motion.img
                                    key="icon-logo"
                                    src="/logos/linkifyme-icon.png"
                                    alt="Li"
                                    className="h-8 md:h-10 w-auto object-contain"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                />
                            )}
                        </AnimatePresence>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        {["Features", "HR Verdicts", "FAQ"].map((item) => (
                            <Link
                                key={item}
                                href={`/#${item.toLowerCase().replace(' ', '-')}`}
                                className="text-sm font-bold text-slate-500 hover:text-brand transition-colors tracking-tight"
                            >
                                {item}
                            </Link>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="hidden md:block">
                        <Link href="/intake">
                            <MarketingButton
                                variant={isScrolled ? "primary" : "outline"}
                                size="sm"
                                className={!isScrolled ? "text-rich-black border-black/10 hover:bg-black/5" : "shadow-lg shadow-brand/20"}
                            >
                                Get Access
                            </MarketingButton>
                        </Link>
                    </div>

                    {/* Mobile Toggle */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-rich-black p-2 hover:bg-black/5 rounded-full transition-colors"
                        >
                            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </motion.div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 bg-white/95 backdrop-blur-md pt-28 px-6 md:hidden flex flex-col items-center space-y-8 border-b border-black/5"
                    >
                        {["Features", "HR Verdicts", "FAQ"].map((item, i) => (
                            <motion.div
                                key={item}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Link
                                    href={`/#${item.toLowerCase().replace(' ', '-')}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-2xl font-medium text-rich-black hover:text-brand transition-colors block"
                                >
                                    {item}
                                </Link>
                            </motion.div>
                        ))}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="w-full max-w-xs"
                        >
                            <Link href="/intake" onClick={() => setIsMobileMenuOpen(false)}>
                                <MarketingButton className="w-full">Get Access</MarketingButton>
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
