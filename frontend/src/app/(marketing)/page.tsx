"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useMotionTemplate } from "framer-motion";
import {
    ArrowRight, Menu, X, Check, Zap, Shield, TrendingUp, Cpu, Globe,
    Twitter, Linkedin, Github, Plus, Minus, Play
} from "lucide-react";

// ============================================================================
// BUTTON COMPONENT
// ============================================================================
interface ButtonProps {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
}

const Button: React.FC<ButtonProps> = ({
    className = "",
    variant = "primary",
    size = "md",
    children,
    onClick,
    disabled,
    type = "button",
}) => {
    const ref = useRef<HTMLButtonElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current?.getBoundingClientRect() ?? { left: 0, top: 0, width: 0, height: 0 };
        const x = (clientX - (left + width / 2)) * 0.35;
        const y = (clientY - (top + height / 2)) * 0.35;
        setPosition({ x, y });
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    const variants = {
        primary: "bg-gray-200 text-rich-black hover:bg-gray-300 border border-gray-300 shadow-lg hover:shadow-gray-300/50",
        secondary: "bg-gray-100 text-rich-black border border-gray-200 hover:bg-gray-200",
        outline: "bg-transparent text-rich-black border border-black/10 hover:bg-black/5 hover:border-black/30",
        ghost: "bg-transparent text-gray-500 hover:text-rich-black",
    };

    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg",
    };

    return (
        <motion.button
            ref={ref}
            type={type}
            disabled={disabled}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            className={`relative rounded-full font-medium transition-colors duration-200 cursor-pointer overflow-hidden group ${variants[variant]} ${sizes[size]} ${className}`}
        >
            <span className="relative z-10 flex items-center justify-center gap-2">
                {children}
            </span>
            {variant === "primary" && (
                <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
            )}
        </motion.button>
    );
};

// ============================================================================
// NAVBAR COMPONENT
// ============================================================================
const Navbar: React.FC = () => {
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
                    className={`relative flex items-center justify-between px-6 transition-all duration-300 ${isScrolled
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
                                    src="/logos/LinkifyMe_Logo_HomePage.svg"
                                    alt="LinkifyMe"
                                    className="h-20 md:h-28 w-auto object-contain"
                                    initial={{ opacity: 0, scale: 0.8, rotateX: -90 }}
                                    animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                                    exit={{ opacity: 0, scale: 0.8, rotateX: 90 }}
                                    transition={{ duration: 0.4, ease: "backOut" }}
                                />
                            ) : (
                                <motion.img
                                    key="icon-logo"
                                    src="/logos/linkifyme-icon.png"
                                    alt="Li"
                                    className="h-10 md:h-12 w-auto object-contain"
                                    initial={{ opacity: 0, scale: 0.8, rotateX: -90 }}
                                    animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                                    exit={{ opacity: 0, scale: 0.8, rotateX: 90 }}
                                    transition={{ duration: 0.4, ease: "backOut" }}
                                />
                            )}
                        </AnimatePresence>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        {["Features", "Stories", "FAQ"].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className="text-sm font-medium text-gray-600 hover:text-rich-black transition-colors relative group"
                            >
                                {item}
                                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-brand transition-all group-hover:w-full" />
                            </a>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="hidden md:block">
                        <Link href="/intake">
                            <Button
                                variant={isScrolled ? "primary" : "outline"}
                                size="sm"
                                className={!isScrolled ? "text-rich-black border-black/10 hover:bg-black/5" : ""}
                            >
                                Get Access
                            </Button>
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
                        {["Features", "Stories", "FAQ"].map((item, i) => (
                            <motion.a
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="text-2xl font-medium text-rich-black hover:text-brand transition-colors"
                            >
                                {item}
                            </motion.a>
                        ))}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="w-full max-w-xs"
                        >
                            <Link href="/intake" onClick={() => setIsMobileMenuOpen(false)}>
                                <Button className="w-full">Get Access</Button>
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

// ============================================================================
// MOUSE SPOTLIGHT
// ============================================================================
const MouseSpotlight = () => {
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
                    ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, rgba(79, 70, 229, 0.08), transparent 40%)`
                ),
            }}
        />
    );
};

// ============================================================================
// HERO SECTION
// ============================================================================
const Hero: React.FC = () => {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"]
    });

    const yText = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacityText = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    return (
        <section ref={ref} className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
            <MouseSpotlight />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div style={{ y: yText, opacity: opacityText }}>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="inline-flex items-center space-x-2 bg-gray-50 border border-black/5 rounded-full px-4 py-2 mb-8 shadow-sm"
                    >
                        <span className="flex h-2 w-2 rounded-full bg-brand animate-pulse"></span>
                        <span className="text-sm font-medium text-gray-600">AI-Powered Analysis v2.0</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="text-6xl md:text-8xl lg:text-9xl font-heading font-bold tracking-tight text-rich-black mb-6 leading-none"
                    >
                        Command <br />
                        <span className="bg-clip-text text-transparent bg-brand-gradient">
                            Attention.
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="max-w-2xl mx-auto text-xl md:text-2xl text-gray-600 mb-10 font-light leading-relaxed"
                    >
                        Your LinkedIn profile is your personal equity. <br className="hidden md:block" />
                        Maximize it with precision engineering and AI logic.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.7 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link href="/intake">
                            <Button size="lg" className="w-full sm:w-auto min-w-[200px] h-14 text-lg group">
                                Get Access
                                <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                        <a href="#demo">
                            <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 text-lg">
                                View Demo
                            </Button>
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
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-rich-black tracking-tight">
                        The <span className="bg-clip-text text-transparent bg-brand-gradient">Shift</span>
                    </h2>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                        Stop competing in the noise. Ascend to the signal.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                    {/* The Old Way */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative p-10 rounded-3xl border border-black/5 bg-gray-50 overflow-hidden group grayscale opacity-70 hover:opacity-100 transition-opacity"
                    >
                        <div className="absolute inset-0 bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <h3 className="text-2xl font-bold text-gray-400 mb-8 flex items-center">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 mr-3">
                                <X className="w-4 h-4 text-gray-400" />
                            </span>
                            Standard Profile
                        </h3>
                        <ul className="space-y-6 text-gray-400">
                            <li className="flex items-start">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-2 mr-3" />
                                Generic &quot;Open to work&quot; frames
                            </li>
                            <li className="flex items-start">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-2 mr-3" />
                                Keyword-stuffed, unreadable bios
                            </li>
                            <li className="flex items-start">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-2 mr-3" />
                                Zero social proof or metrics
                            </li>
                            <li className="flex items-start">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-2 mr-3" />
                                Passive waiting for recruiters
                            </li>
                        </ul>
                    </motion.div>

                    {/* The Linki Way */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="relative p-10 rounded-3xl border border-brand/20 bg-white overflow-hidden ring-1 ring-brand/10 shadow-2xl shadow-brand/10"
                    >
                        <div className="absolute inset-0 bg-brand-gradient opacity-[0.03]" />

                        <h3 className="text-2xl font-bold text-rich-black mb-8 flex items-center relative z-10">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand mr-3 shadow-lg shadow-brand/30">
                                <Check className="w-4 h-4 text-white" />
                            </span>
                            Optimized Asset
                        </h3>
                        <ul className="space-y-6 text-gray-700 relative z-10">
                            {[
                                "Psychologically engineered hooks",
                                "Metric-driven achievement stack",
                                "Automated inbound lead generation",
                                "Top 1% SSI Score Authority"
                            ].map((item, i) => (
                                <li key={i} className="flex items-start">
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand mt-2 mr-3" />
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
        title: "Instant Velocity",
        description: "Analysis results delivered in under 200ms using edge caching.",
        icon: Zap,
        colSpan: "md:col-span-2",
    },
    {
        title: "Global Reach",
        description: "Benchmark your profile against top 1% globally.",
        icon: Globe,
        colSpan: "md:col-span-1",
    },
    {
        title: "AI Precision",
        description: "Neural networks trained on 10M+ profiles for exact recommendations.",
        icon: Cpu,
        colSpan: "md:col-span-1",
    },
    {
        title: "Growth Metrics",
        description: "Track your SSI score improvements over time.",
        icon: TrendingUp,
        colSpan: "md:col-span-2",
    },
];

const FeatureCard = ({ feature, i }: { feature: typeof features[0]; i: number }) => {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

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
            transition={{ delay: i * 0.1 }}
            onMouseMove={handleMouseMove}
            className={`group relative overflow-hidden rounded-3xl border border-black/5 bg-white p-8 ${feature.colSpan} hover:border-brand/30 transition-shadow duration-300 shadow-sm hover:shadow-lg`}
        >
            <div className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100">
                <motion.div
                    className="absolute inset-0 bg-brand-gradient-subtle opacity-30"
                    style={{
                        maskImage: useMotionTemplate`radial-gradient(350px circle at ${x}px ${y}px, black, transparent)`,
                        WebkitMaskImage: useMotionTemplate`radial-gradient(350px circle at ${x}px ${y}px, black, transparent)`,
                    }}
                />
            </div>

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/5 text-brand group-hover:bg-brand group-hover:text-white transition-colors">
                    <feature.icon size={24} />
                </div>
                <div>
                    <h3 className="mb-2 text-xl font-bold text-rich-black">{feature.title}</h3>
                    <p className="text-gray-500 leading-relaxed">{feature.description}</p>
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
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-rich-black tracking-tight">
                        Engineered for <span className="bg-clip-text text-transparent bg-brand-gradient">Domination</span>
                    </h2>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                        A suite of tools designed to put you leagues ahead of the competition.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
const testimonials = [
    {
        name: "Alex R.",
        role: "Senior PM at Google",
        text: "Recruiter messages went up 300% in 48 hours.",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"
    },
    {
        name: "Sarah K.",
        role: "Founder, TechFlow",
        text: "Fundraising became easier when my profile looked inevitable.",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
    },
    {
        name: "James L.",
        role: "VP Sales, Oracle",
        text: "The psychology behind the rewrite is unmatched.",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
    },
    {
        name: "Priya M.",
        role: "Engineer, Netflix",
        text: "I didn't apply. They came to me.",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
    },
    {
        name: "Davide B.",
        role: "Director, Spotify",
        text: "Essential infrastructure for your career.",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
    },
];

const Stories: React.FC = () => {
    return (
        <section id="stories" className="py-24 relative">
            <div className="mb-16 text-center relative z-20">
                <h2 className="text-3xl md:text-4xl font-bold text-rich-black tracking-tight">
                    Hall of <span className="text-gray-400">Fame</span>
                </h2>
            </div>

            <div className="flex overflow-hidden">
                <motion.div
                    className="flex gap-8 px-4"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
                >
                    {[...testimonials, ...testimonials].map((story, i) => (
                        <div
                            key={i}
                            className="flex-shrink-0 w-[400px] p-8 rounded-2xl bg-white border border-black/5 shadow-sm hover:shadow-md transition-shadow group"
                        >
                            <p className="text-lg text-gray-700 font-medium mb-6 leading-relaxed group-hover:text-rich-black transition-colors">
                                &quot;{story.text}&quot;
                            </p>
                            <div className="flex items-center">
                                <img
                                    src={story.image}
                                    alt={story.name}
                                    className="w-12 h-12 rounded-full border-2 border-gray-100 mr-4 object-cover group-hover:border-brand/50 transition-colors"
                                />
                                <div>
                                    <h4 className="text-rich-black font-bold">{story.name}</h4>
                                    <p className="text-sm text-brand">{story.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

// ============================================================================
// FAQ SECTION
// ============================================================================
const faqs = [
    {
        question: "Is this cheating?",
        answer: "No. It's engineering. We use the same algorithms LinkedIn uses to rank profiles, but in reverse to optimize yours."
    },
    {
        question: "How long does the audit take?",
        answer: "Less than 2 minutes. Our AI infrastructure analyzes 50+ data points and generates a comprehensive report."
    },
    {
        question: "Will my current employer know?",
        answer: "We operate in stealth mode. No notifications are sent. Your optimization process is completely private."
    },
    {
        question: "What is the SSI Score?",
        answer: "Social Selling Index. It's the hidden metric LinkedIn uses to decide who sees your content. We help you max it out."
    }
];

const FAQ: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section id="faq" className="py-32 relative overflow-hidden">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-rich-black mb-4 tracking-tight">
                        Protocol <span className="text-brand">Details</span>
                    </h2>
                    <p className="text-gray-500">Everything you need to know about the system.</p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`bg-white rounded-2xl overflow-hidden border border-black/5 shadow-sm transition-all duration-300 ${openIndex === index ? "border-brand/20 shadow-md ring-1 ring-brand/5" : "hover:border-black/10"}`}
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
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
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
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                >
                    <p className="text-gray-500 text-xl mb-12 max-w-xl mx-auto">
                        Join 10,000+ professionals engineering their serendipity.
                    </p>
                    <Link href="/intake">
                        <Button size="lg" className="h-16 px-10 text-xl shadow-[0_0_50px_rgba(79,70,229,0.2)] hover:shadow-[0_0_80px_rgba(79,70,229,0.4)] transition-shadow duration-500">
                            Get Access
                        </Button>
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-2">
                        <span className="text-2xl font-bold tracking-tighter text-white mb-4 block">
                            LinkifyMe<span className="text-brand">.</span>
                        </span>
                        <p className="text-gray-500 max-w-sm">
                            The advanced intelligence layer for your professional presence. Built for those who demand excellence.
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
            </div>
        </footer>
    );
};

// ============================================================================
// MAIN LANDING PAGE
// ============================================================================
export default function HomePage() {
    return (
        <div className="min-h-screen bg-white text-rich-black font-sans selection:bg-brand selection:text-white overflow-x-hidden relative">
            {/* Global Atmosphere - Subtle Clouds */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                {/* Top Left Cloud */}
                <div className="absolute top-[-15%] left-[-15%] w-[45vw] h-[45vw] bg-brand/15 rounded-full blur-[120px] mix-blend-multiply animate-slow-spin" />

                {/* Bottom Right Cloud */}
                <div className="absolute bottom-[-15%] right-[-15%] w-[45vw] h-[45vw] bg-blue-600/15 rounded-full blur-[120px] mix-blend-multiply animate-slow-spin" style={{ animationDirection: "reverse" }} />

                {/* Random Floating Cloud */}
                <div className="absolute top-[30%] left-[10%] w-[25vw] h-[25vw] bg-indigo-300/10 rounded-full blur-[100px] mix-blend-multiply animate-pulse" />

                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
            </div>

            <div className="relative z-10">
                <Navbar />
                <main>
                    <Hero />
                    <Comparison />
                    <Features />
                    <Stories />
                    <FAQ />
                    <PreFooterCTA />
                </main>
                <Footer />
            </div>
        </div>
    );
}
