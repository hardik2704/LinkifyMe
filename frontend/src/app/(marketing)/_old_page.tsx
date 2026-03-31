"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useMotionTemplate, useSpring, useReducedMotion } from "framer-motion";
import {
    ArrowRight, Menu, X, Check, Zap, Shield, TrendingUp, Cpu, Globe,
    Twitter, Linkedin, Github, Plus, Minus, Play, Quote
} from "lucide-react";

import { MarketingButton } from "@/components/marketing/MarketingButton";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MouseSpotlight, MarketingBackground } from "@/components/marketing/MarketingBackground";

// ============================================================================
// HERO SECTION
// ============================================================================
const Hero: React.FC = () => {
    const ref = useRef<HTMLDivElement>(null);
    const shouldReduceMotion = useReducedMotion();
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"]
    });

    const yText = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? ["0%", "0%"] : ["0%", "50%"]);
    const opacityText = useTransform(scrollYProgress, [0, 0.8], shouldReduceMotion ? [1, 1] : [1, 0.3]);

    return (
        <section ref={ref} className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
            <MouseSpotlight />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div style={{ y: yText, opacity: opacityText }}>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-10">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.05, type: "spring" }}
                            className="group relative flex items-center space-x-2 bg-white/40 backdrop-blur-md border border-white/40 rounded-full px-5 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:shadow-indigo-500/10 transition-shadow duration-200 cursor-default"
                        >
                            <span className="flex h-2 w-2 rounded-full bg-brand animate-pulse"></span>
                            <span className="text-sm font-semibold text-gray-700 tracking-tight">AI-Powered Analysis v2.0</span>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.1, type: "spring" }}
                            className="group relative flex items-center space-x-2 bg-brand/10 backdrop-blur-md border border-brand/20 rounded-full px-5 py-2.5 shadow-[0_8px_32px_rgba(79,70,229,0.08)] hover:shadow-indigo-500/20 transition-shadow duration-200 cursor-default"
                        >
                            <Check className="w-4 h-4 text-brand" />
                            <span className="text-sm font-bold text-brand italic tracking-tight">Recruiter Approved Logic</span>
                        </motion.div>
                    </div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
                        className="text-7xl md:text-9xl lg:text-[10rem] font-heading font-black tracking-[-0.04em] text-rich-black mb-8 leading-[0.85]"
                    >
                        Profile <br />
                        <span className="bg-clip-text text-transparent bg-brand-gradient drop-shadow-sm">
                            Engineering.
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
                        className="max-w-3xl mx-auto text-xl md:text-2xl text-slate-500 mb-12 font-medium leading-relaxed"
                    >
                        Stop guessing what hiring managers want. We interviewed 50+ <br className="hidden md:block" />
                        Top HRs to build the only system that speaks their language.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.25, ease: [0.23, 1, 0.32, 1] }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-6"
                    >
                        <Link href="/intake">
                            <MarketingButton size="lg" className="w-full sm:w-auto h-16 px-10 text-xl font-bold group shadow-2xl shadow-indigo-500/20">
                                Start Free Audit
                                <ArrowRight className="w-6 h-6 ml-2 transition-transform group-hover:translate-x-1.5" />
                            </MarketingButton>
                        </Link>
                        <a href="#features">
                            <MarketingButton variant="outline" size="lg" className="w-full sm:w-auto h-16 px-10 text-xl font-semibold backdrop-blur-sm border-slate-200 hover:text-slate-700 hover:border-slate-300">
                                See Architecture
                            </MarketingButton>
                        </a>
                    </motion.div>

                </motion.div>
            </div>

            {/* Decorative Elements - Fade to white */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-20"
            />
        </section>
    );
};

// ============================================================================
// COMPARISON SECTION
// ============================================================================
const Comparison: React.FC = () => {
    return (
        <section className="py-32 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-rich-black tracking-tight">
                        The <span className="bg-clip-text text-transparent bg-brand-gradient">Shift</span>
                    </h2>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                        Stop competing in the noise. Ascend to the signal.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative">
                    {/* The Old Way */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative p-12 rounded-[2rem] border border-slate-200 bg-slate-50/50 backdrop-blur-sm overflow-hidden group hover:bg-slate-100/50 transition-[background-color,box-shadow,border-color] duration-300 ease-out"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <X className="w-32 h-32" />
                        </div>
                        <h3 className="text-3xl font-bold text-slate-400 mb-10 flex items-center">
                            <span className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-slate-300 mr-4">
                                <Minus className="w-5 h-5 text-slate-400" />
                            </span>
                            Standard Profile
                        </h3>
                        <ul className="space-y-6 text-slate-400 text-lg font-medium">
                            <li className="flex items-center">
                                <span className="w-2 h-2 rounded-full bg-slate-300 mr-4" />
                                Generic &quot;Open to work&quot; frames
                            </li>
                            <li className="flex items-center">
                                <span className="w-2 h-2 rounded-full bg-slate-300 mr-4" />
                                AI-detected keyword stuffing
                            </li>
                            <li className="flex items-center">
                                <span className="w-2 h-2 rounded-full bg-slate-300 mr-4" />
                                Vague &quot;Passionate&quot; descriptions
                            </li>
                            <li className="flex items-center">
                                <span className="w-2 h-2 rounded-full bg-slate-300 mr-4" />
                                Zero recruiter-intent signals
                            </li>
                        </ul>
                    </motion.div>

                    {/* The Linki Way */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative p-12 rounded-[2rem] border border-brand/30 bg-white overflow-hidden shadow-[0_32px_64px_rgba(79,70,229,0.12)] group hover:shadow-[0_32px_80px_rgba(79,70,229,0.18)] transition-[background-color,box-shadow,border-color] duration-300 ease-out"
                    >
                        <div className="absolute inset-0 bg-brand-gradient opacity-[0.03] group-hover:opacity-[0.05] transition-opacity" />
                        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-brand/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-300 ease-out" />

                        <h3 className="text-3xl font-bold text-rich-black mb-10 flex items-center relative z-10">
                            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-brand mr-4 shadow-xl shadow-brand/40 ring-4 ring-brand/10">
                                <Check className="w-5 h-5 text-white" />
                            </span>
                            Optimized Asset
                        </h3>
                        <ul className="space-y-6 text-slate-700 text-lg font-semibold relative z-10">
                            {[
                                "Psychologically engineered hooks",
                                "Metric-driven achievement stack",
                                "Optimized for 6s Mobile-Scanability",
                                "Top 1% Recruiter Search Priority"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center group/item transition-transform hover:translate-x-1">
                                    <span className="w-2 h-2 rounded-full bg-brand mr-4 shadow-sm shadow-brand" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

// ============================================================================
// FEATURES SECTION
// ============================================================================
const features = [
    {
        title: "Recruiter-Vetted Logic",
        description: "Built on direct interviews with 50+ Top HRs from FAANG. We know exactly what triggers a 'Yes'.",
        icon: Shield,
        className: "md:col-span-2 bg-slate-900 text-white shadow-2xl shadow-slate-900/20",
        iconContainer: "bg-white/10 text-white",
    },
    {
        title: "Instant Velocity",
        description: "Audit delivered in <2s with edge-powered neural analysis.",
        icon: Zap,
        className: "md:col-span-1 border-brand/20 bg-brand/5 group-hover:bg-brand group-hover:text-white transition-all duration-500",
        iconContainer: "bg-brand/10 text-brand group-hover:bg-white group-hover:text-brand",
    },
    {
        title: "6s Optimization",
        description: "Engineering your profile for the critical 6-second recruiter glance.",
        icon: Cpu,
        className: "md:col-span-1 bg-white",
        iconContainer: "bg-brand/5 text-brand",
    },
    {
        title: "Global Benchmarking",
        description: "See where you rank against the top 1% of your global industry peers.",
        icon: Globe,
        className: "md:col-span-2 bg-white flex-row items-center",
        iconContainer: "bg-brand/5 text-brand",
    }
];

const FeatureCard = ({ feature, i }: { feature: typeof features[0]; i: number }) => {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 200, damping: 25 });
    const springY = useSpring(y, { stiffness: 200, damping: 25 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        x.set(e.clientX - rect.left);
        y.set(e.clientY - rect.top);
    };

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: Math.min(i * 0.05, 0.2) }}
            onMouseMove={handleMouseMove}
            className={`group relative overflow-hidden rounded-[2rem] border border-slate-200 p-10 hover:border-brand/30 hover:shadow-2xl transition-[border-color,box-shadow] duration-200 ease-out ${feature.className}`}
        >
            <div className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100">
                <motion.div
                    className="absolute inset-0 bg-brand-gradient-subtle opacity-20"
                    style={{
                        maskImage: useMotionTemplate`radial-gradient(350px circle at ${springX}px ${springY}px, black, transparent)`,
                        WebkitMaskImage: useMotionTemplate`radial-gradient(350px circle at ${springX}px ${springY}px, black, transparent)`,
                    }}
                />
            </div>

            <div className={`relative z-10 flex h-full ${feature.className?.includes('flex-row') ? 'flex-row items-center gap-8' : 'flex-col justify-between'}`}>
                <div className={`shrink-0 mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-500 ${feature.iconContainer}`}>
                    <feature.icon size={28} />
                </div>
                <div>
                    <h3 className={`mb-3 text-2xl font-bold tracking-tight ${feature.className?.includes('text-white') ? 'text-white' : 'text-rich-black'}`}>{feature.title}</h3>
                    <p className={`text-lg leading-relaxed ${feature.className?.includes('text-white') ? 'text-slate-400' : 'text-slate-500'}`}>{feature.description}</p>
                </div>
            </div>
        </motion.div>
    );
};

const Features: React.FC = () => {
    return (
        <section id="features" className="py-32 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <h2 className="text-5xl md:text-7xl font-bold mb-8 text-rich-black tracking-tight">
                        Built for <span className="bg-clip-text text-transparent bg-brand-gradient">Domination</span>
                    </h2>
                    <p className="text-slate-500 text-xl max-w-2xl mx-auto font-medium">
                        Standard tools give you tips. We give you engineering precision developed with the world&apos;s best recruiters.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, i) => (
                        <FeatureCard key={i} feature={feature} i={i} />
                    ))}
                </div>
            </div>
        </section>
    );
};

// ============================================================================
// STORIES / TESTIMONIALS SECTION
// ============================================================================
const recruiterInsights = [
    {
        name: "Marcus T.",
        role: "Senior Recruiter @ Google",
        text: "We scan 100+ profiles a day. If your Headline doesn't solve my problem in 6 seconds, I've already moved on.",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"
    },
    {
        name: "Sarah J.",
        role: "Engineering Manager @ Meta",
        text: "I look for percentages and dollar signs. If you aren't quantifying your impact, you aren't qualifying for the role.",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
    },
    {
        name: "David K.",
        role: "Talent Lead @ Amazon",
        text: "Dense walls of text are a red flag. I prioritize scan-ability and high-impact bullets over long-winded bios.",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
    },
    {
        name: "Elena R.",
        role: "HR Director @ Stripe",
        text: "I want to see the application of your degree. Details about honors and thesis work matter more than just the school name.",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
    },
    {
        name: "Jason P.",
        role: "Tech Recruiter @ LinkedIn",
        text: "SSI score determines your search rank. We prioritize profiles that show high authority and engagement metrics.",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
    },
];

const RecruiterInsights: React.FC = () => {
    const [isPaused, setIsPaused] = useState(false);
    const shouldReduceMotion = useReducedMotion();

    return (
        <section id="stories" className="py-24 relative">
            <div className="mb-16 text-center relative z-20">
                <h2 className="text-3xl md:text-4xl font-bold text-rich-black tracking-tight">
                    Recruiter <span className="text-gray-400">Verdicts</span>
                </h2>
                <p className="text-gray-500 mt-4 max-w-xl mx-auto">
                    We built our logic by interviewing 50+ Top HRs. Here is what they actually look for.
                </p>
            </div>

            <div
                className="flex overflow-hidden"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <div
                    className={`flex gap-8 px-4 ${shouldReduceMotion ? '' : 'animate-scroll-x'}`}
                    style={{ animationPlayState: isPaused ? "paused" : "running" }}
                >
                    {[...recruiterInsights, ...recruiterInsights].map((insight, i) => (
                        <div
                            key={i}
                            className="flex-shrink-0 w-[500px] p-10 rounded-[2.5rem] bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(79,70,229,0.08)] transition-[box-shadow,background-color] duration-200 ease-out group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Quote className="w-24 h-24 text-brand" />
                            </div>

                            <p className="text-xl text-slate-700 font-semibold mb-10 leading-relaxed group-hover:text-rich-black transition-colors italic relative z-10">
                                &quot;{insight.text}&quot;
                            </p>
                            <div className="flex items-center relative z-10">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-brand/20 rounded-full blur-sm animate-pulse group-hover:bg-brand/40 transition-colors" />
                                    <img
                                        src={insight.image}
                                        alt={insight.name}
                                        className="w-14 h-14 rounded-full border-2 border-white relative z-10 object-cover"
                                    />
                                    <div className="absolute -bottom-1 -right-1 bg-brand text-white p-1 rounded-full border-2 border-white z-20">
                                        <Check className="w-3 h-3" />
                                    </div>
                                </div>
                                <div className="ml-5">
                                    <h4 className="text-rich-black font-bold text-lg">{insight.name}</h4>
                                    <p className="text-sm text-brand font-bold tracking-tight uppercase">{insight.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// ============================================================================
// FAQ SECTION
// ============================================================================
const faqs = [
    {
        question: "What does LinkifyMe analyze?",
        answer: "We review your headline, summary, experience, skills, positioning, and overall profile strength to generate actionable recommendations."
    },
    {
        question: "How long does the audit take?",
        answer: "Most reports are ready within a few minutes, though deeper analysis may take slightly longer."
    },
    {
        question: "Do I need to log in with LinkedIn?",
        answer: "No. You do not need to share your LinkedIn password to use LinkifyMe. You simply submit your profile URL and receive your analysis report."
    },
    {
        question: "Is my data safe?",
        answer: "We take privacy seriously. Your profile URL and related analysis data are used only to generate your report and support the service, according to our Privacy Policy."
    },
    {
        question: "Will my employer or network know?",
        answer: "No. Your analysis is private and is not shared with your employer, network, or LinkedIn contacts."
    },
    {
        question: "Is this cheating?",
        answer: "No. LinkifyMe helps you improve how your real experience is presented. It is about better positioning, not manipulation."
    },
    {
        question: "What is the SSI Score?",
        answer: "SSI stands for Social Selling Index, a LinkedIn measure of professional brand strength and engagement. LinkifyMe helps you improve many of the profile elements that contribute to a stronger presence."
    },
    {
        question: "Will this guarantee results?",
        answer: "No tool can guarantee outcomes. LinkifyMe helps you improve the quality, clarity, and discoverability of your profile so you can put your best professional version forward."
    }
];

const FAQ: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section id="faq" className="py-32 relative overflow-hidden">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-rich-black mb-6 tracking-tight">
                        Frequently Asked <span className="text-brand">Questions</span>
                    </h2>
                    <p className="text-slate-500 text-lg font-medium">Everything you need to know before analyzing your profile.</p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: Math.min(index * 0.05, 0.2) }}
                            className={`group bg-white/40 backdrop-blur-md rounded-3xl overflow-hidden border transition-[border-color,box-shadow,background-color] duration-200 ease-out ${openIndex === index ? "border-brand/30 shadow-2xl shadow-brand/5 ring-1 ring-brand/10 bg-white" : "border-slate-200 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50"}`}
                        >
                            <button
                                className="w-full flex items-center justify-between p-6 text-left group"
                                onClick={() => setOpenIndex(prev => prev === index ? null : index)}
                            >
                                <span className={`text-lg font-medium transition-colors ${openIndex === index ? "text-rich-black" : "text-gray-600 group-hover:text-rich-black"}`}>
                                    {faq.question}
                                </span>
                                {openIndex === index ? (
                                    <Minus className="w-5 h-5 text-brand" />
                                ) : (
                                    <Plus className="w-5 h-5 text-gray-400 group-hover:text-rich-black transition-colors" />
                                )}
                            </button>
                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                                    >
                                        <div className="px-6 pb-6 text-gray-500 leading-relaxed border-t border-dashed border-black/5 pt-4">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// ============================================================================
// PRE-FOOTER CTA SECTION
// ============================================================================
const PreFooterCTA: React.FC = () => {
    return (
        <section className="py-40 relative flex items-center justify-center">
            <div className="relative z-10 text-center max-w-4xl px-4">
                <motion.h2
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-5xl md:text-7xl lg:text-8xl font-bold text-rich-black mb-8 tracking-tighter"
                >
                    Don&apos;t vanish. <br />
                    <span className="text-brand">
                        Stand out.
                    </span>
                </motion.h2>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="relative inline-block"
                >
                    <div className="absolute -inset-4 bg-brand/20 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="relative text-slate-500 text-2xl mb-14 max-w-2xl mx-auto font-medium leading-relaxed">
                        Join 10,000+ professionals engineering their serendipity. <br />
                        <span className="text-brand/60 italic text-lg">Built for the Top 1%. Approved by recruiters.</span>
                    </p>
                    <Link href="/intake">
                        <MarketingButton size="lg" className="h-20 px-14 text-2xl font-black shadow-[0_20px_80px_rgba(79,70,229,0.3)] hover:shadow-[0_20px_100px_rgba(79,70,229,0.5)] transition-[box-shadow] duration-200 ease-out rounded-2xl group active:scale-95">
                            Start Free Audit
                            <ArrowRight className="w-8 h-8 ml-4 transition-transform group-hover:translate-x-3" />
                        </MarketingButton>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
};

// ============================================================================
// FOOTER SECTION
// ============================================================================
const Footer: React.FC = () => {
    return (
        <footer className="bg-rich-black pt-20 pb-10 border-t border-white/5">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-2">
                        <span className="text-2xl font-bold tracking-tighter text-white mb-4 block">
                            LinkifyMe<span className="text-brand">.</span>
                        </span>
                        <p className="text-gray-500 max-w-sm">
                            The recruiter-vetted intelligence layer for your professional presence. Engineered for the 6-second scan.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Platform</h4>
                        <ul className="space-y-4">
                            {["Analysis Engine", "Market Intelligence", "Pricing", "API"].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Legal</h4>
                        <ul className="space-y-4">
                            {["Privacy Protocol", "Terms of Service", "Cookie Policy"].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5">
                    <p className="text-gray-600 text-sm mb-4 md:mb-0">
                        © {new Date().getFullYear()} LinkifyMe Inc. All rights reserved.
                    </p>
                    <div className="flex space-x-6">
                        {[Twitter, Linkedin, Github].map((Icon, i) => (
                            <a key={i} href="#" className="text-gray-500 hover:text-white transition-colors">
                                <Icon size={20} />
                            </a>
                        ))}
                    </div>
                </div>
            </motion.div>
        </footer>
    );
};

// ============================================================================
// MAIN LANDING PAGE
// ============================================================================
export default function HomePage() {
    const shouldReduceMotion = useReducedMotion();

    return (
        <div className="min-h-screen bg-white text-rich-black font-sans selection:bg-brand selection:text-white overflow-x-hidden relative">
            <MarketingBackground />

            <div className="relative z-10">
                <MarketingNav />
                <main>
                    <Hero />
                    <Comparison />
                    <Features />
                    <RecruiterInsights />
                    <FAQ />
                    <PreFooterCTA />
                </main>
                <Footer />
            </div>
        </div>
    );
}
