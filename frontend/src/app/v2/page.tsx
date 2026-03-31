"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValue,
  useMotionTemplate,
} from "framer-motion";
import {
  ArrowRight,
  Menu,
  X,
  Check,
  Zap,
  Shield,
  TrendingUp,
  Cpu,
  Globe,
  Twitter,
  Linkedin,
  Github,
  Plus,
  Minus,
  Play,
  Quote,
  User,
  CreditCard,
  FileText,
} from "lucide-react";

/* ─────────────────────────────────────────────
   BUTTON COMPONENT
   ───────────────────────────────────────────── */

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-gray-200 text-rich-black hover:bg-gray-300 border border-gray-300 shadow-lg hover:shadow-gray-300/50",
  secondary:
    "bg-gray-100 text-rich-black border border-gray-200 hover:bg-gray-200",
  outline:
    "bg-transparent text-rich-black border border-black/10 hover:bg-black/5 hover:border-black/30",
  ghost: "bg-transparent text-gray-500 hover:text-rich-black",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  onClick,
  href,
}: ButtonProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const spotlight = useMotionTemplate`radial-gradient(120px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.15), transparent 60%)`;

  const inner = (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      className={`relative group inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 overflow-hidden ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      <motion.span
        className="absolute inset-0 pointer-events-none"
        style={{ background: spotlight }}
      />
      {variant === "primary" && (
        <span className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );

  if (href) {
    return <Link href={href}>{inner}</Link>;
  }
  return inner;
}

/* ─────────────────────────────────────────────
   NAVBAR
   ───────────────────────────────────────────── */

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Stories", href: "#stories" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4">
        <motion.div
          animate={{
            width: scrolled ? undefined : "100%",
            height: scrolled ? 64 : 80,
            backgroundColor: scrolled
              ? "rgba(255,255,255,0.70)"
              : "rgba(255,255,255,0)",
            borderRadius: scrolled ? 9999 : 16,
            boxShadow: scrolled
              ? "0 8px 30px rgba(0,0,0,0.08)"
              : "0 0 0 rgba(0,0,0,0)",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`flex items-center justify-between px-6 ${
            scrolled
              ? "w-[90%] md:w-[60%] lg:w-[50%] backdrop-blur-xl"
              : "max-w-7xl"
          }`}
        >
          {/* Logo */}
          <Link href="/v2" className="relative h-10 flex items-center">
            <AnimatePresence mode="wait">
              {!scrolled ? (
                <motion.img
                  key="full"
                  src="/logos/linkifyme-full.png"
                  alt="LinkifyMe"
                  className="h-8 object-contain"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                />
              ) : (
                <motion.img
                  key="icon"
                  src="/logos/linkifyme-icon.png"
                  alt="LinkifyMe"
                  className="h-8 w-8 object-contain"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                />
              )}
            </AnimatePresence>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="relative group text-sm font-medium text-gray-600 hover:text-rich-black transition-colors"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-brand transition-all group-hover:w-full" />
              </a>
            ))}
            <Link href="/intake">
              <Button variant={scrolled ? "primary" : "outline"} size="sm">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </motion.div>
      </nav>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-2xl font-heading font-semibold text-rich-black"
              >
                {link.label}
              </a>
            ))}
            <Link href="/intake" onClick={() => setMobileOpen(false)}>
              <Button variant="primary" size="lg">
                Get Started
              </Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─────────────────────────────────────────────
   MOUSE SPOTLIGHT
   ───────────────────────────────────────────── */

function MouseSpotlight() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const bg = useMotionTemplate`radial-gradient(600px circle at ${x}px ${y}px, rgba(79, 70, 229, 0.08), transparent 40%)`;

  useEffect(() => {
    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-30"
      style={{ background: bg }}
    />
  );
}

/* ─────────────────────────────────────────────
   HERO
   ───────────────────────────────────────────── */

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 text-center max-w-5xl mx-auto px-4 pt-32"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center space-x-2 bg-gray-50 border border-black/5 rounded-full px-4 py-2 mb-8 shadow-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
          </span>
          <span className="text-sm font-medium text-gray-600">
            AI-Powered Analysis v2.0
          </span>
        </motion.div>

        {/* H1 */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-6xl md:text-8xl lg:text-9xl font-heading font-bold tracking-tight"
        >
          Command
          <br />
          <span
            className="bg-clip-text text-transparent bg-gradient-to-r from-[#1e3a8a] to-[#2563eb]"
          >
            Attention.
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-xl md:text-2xl text-gray-600 font-light leading-relaxed max-w-2xl mx-auto"
        >
          Your LinkedIn profile is your personal equity. Maximize it with
          precision engineering and AI logic.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link href="/intake">
            <Button variant="primary" size="lg">
              Audit Profile <ArrowRight size={20} />
            </Button>
          </Link>
          <Button variant="outline" size="lg" href="#demo">
            View Demo
          </Button>
        </motion.div>
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent z-20" />
    </section>
  );
}

/* ─────────────────────────────────────────────
   COMPARISON
   ───────────────────────────────────────────── */

const standardItems = [
  'Generic "Open to work" frames',
  "Keyword-stuffed unreadable bios",
  "Zero social proof or metrics",
  "Passive waiting for recruiters",
];

const optimizedItems = [
  "Psychologically engineered hooks",
  "Metric-driven achievement stack",
  "Automated inbound lead generation",
  "Top 1% SSI Score Authority",
];

function Comparison() {
  return (
    <section className="relative py-32 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-heading font-bold text-center mb-16"
        >
          The{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1e3a8a] to-[#2563eb]">
            Shift
          </span>
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Standard */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-black/5 bg-gray-50 p-8 grayscale opacity-70 hover:opacity-100 transition-all duration-500"
          >
            <h3 className="text-2xl font-heading font-semibold mb-6 text-gray-500">
              Standard Profile
            </h3>
            <ul className="space-y-4">
              {standardItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-500">
                  <X size={18} className="mt-1 shrink-0 text-gray-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Optimized */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-brand/20 ring-1 ring-brand/10 bg-white p-8 shadow-2xl shadow-brand/10"
          >
            <h3 className="text-2xl font-heading font-semibold mb-6 text-rich-black">
              Optimized Asset
            </h3>
            <ul className="space-y-4">
              {optimizedItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-rich-black">
                  <Check
                    size={18}
                    className="mt-1 shrink-0 text-brand"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   TIMELINE (How It Works)
   ───────────────────────────────────────────── */

const timelineSteps = [
  {
    icon: User,
    title: "Enter Profile",
    desc: "Paste your LinkedIn URL to start the deep-dive analysis.",
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    icon: CreditCard,
    title: "Complete Payment",
    desc: "Secure one-time payment for premium insights.",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    icon: FileText,
    title: "Receive Summary",
    desc: "Get your personalized action plan instantly.",
    gradient: "from-cyan-500 to-teal-400",
  },
];

function Timeline() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.5"],
  });
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section ref={ref} className="relative py-32 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-heading font-bold text-center mb-20"
        >
          How It{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1e3a8a] to-[#2563eb]">
            Works
          </span>
        </motion.h2>

        {/* Desktop */}
        <div className="hidden md:block relative">
          {/* Progress line */}
          <div className="absolute top-8 left-0 right-0 h-[2px] bg-gray-200">
            <motion.div
              className="h-full bg-brand origin-left"
              style={{ scaleX }}
            />
          </div>

          <div className="grid grid-cols-3 gap-8">
            {timelineSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="text-center"
              >
                <div className="relative inline-flex">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white shadow-lg`}
                  >
                    <step.icon size={28} />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rich-black text-white text-xs flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-heading font-semibold">
                  {step.title}
                </h3>
                <p className="mt-2 text-gray-500 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden relative pl-12">
          {/* Vertical line */}
          <div className="absolute left-[1.35rem] top-0 bottom-0 w-[2px] bg-gray-200">
            <motion.div
              className="w-full bg-brand origin-top"
              style={{ scaleY, height: "100%" }}
            />
          </div>

          <div className="space-y-12">
            {timelineSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                <div className="absolute -left-12">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white shadow-lg`}
                  >
                    <step.icon size={22} />
                  </div>
                </div>
                <h3 className="text-lg font-heading font-semibold">
                  {step.title}
                </h3>
                <p className="mt-1 text-gray-500 text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   INTEGRATIONS
   ───────────────────────────────────────────── */

const orbitLogos = [
  { name: "Notion", emoji: "N" },
  { name: "Slack", emoji: "S" },
  { name: "Gmail", emoji: "G" },
  { name: "LinkedIn", emoji: "in" },
  { name: "HubSpot", emoji: "H" },
  { name: "Salesforce", emoji: "SF" },
];

function Integrations() {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      <div className="max-w-5xl mx-auto text-center">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs uppercase tracking-widest text-brand font-semibold"
        >
          The Ecosystem
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-4 text-4xl md:text-6xl font-heading font-bold"
        >
          Seamlessly{" "}
          <span className="text-gray-400">Connected.</span>
        </motion.h2>

        {/* Orbit diagram */}
        <div className="relative mx-auto mt-20 w-[400px] h-[400px]">
          {/* Central node */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-white border border-black/5 shadow-lg flex flex-col items-center justify-center z-10">
            <span className="relative flex h-2 w-2 mb-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
            </span>
            <span className="text-xs font-heading font-bold text-rich-black">
              LinkifyMe
            </span>
          </div>

          {/* Orbit ring 1 */}
          <div className="absolute inset-0 animate-slow-spin">
            <div className="absolute inset-[20px] rounded-full border border-black/5" />
            {orbitLogos.slice(0, 3).map((logo, i) => {
              const angle = (i * 120 * Math.PI) / 180;
              const r = 130;
              const cx = 200 + r * Math.cos(angle) - 20;
              const cy = 200 + r * Math.sin(angle) - 20;
              return (
                <div
                  key={logo.name}
                  className="absolute w-10 h-10 rounded-full bg-white border border-black/5 shadow-md flex items-center justify-center text-xs font-bold text-gray-600"
                  style={{ left: cx, top: cy }}
                >
                  {logo.emoji}
                </div>
              );
            })}
          </div>

          {/* Orbit ring 2 */}
          <div
            className="absolute inset-0 animate-slow-spin"
            style={{ animationDirection: "reverse", animationDuration: "18s" }}
          >
            <div className="absolute inset-0 rounded-full border border-black/5" />
            {orbitLogos.slice(3).map((logo, i) => {
              const angle = ((i * 120 + 60) * Math.PI) / 180;
              const r = 180;
              const cx = 200 + r * Math.cos(angle) - 20;
              const cy = 200 + r * Math.sin(angle) - 20;
              return (
                <div
                  key={logo.name}
                  className="absolute w-10 h-10 rounded-full bg-white border border-black/5 shadow-md flex items-center justify-center text-xs font-bold text-gray-600"
                  style={{ left: cx, top: cy }}
                >
                  {logo.emoji}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FEATURES
   ───────────────────────────────────────────── */

const features = [
  {
    icon: Zap,
    title: "Instant Velocity",
    desc: "Real-time profile analysis in under 200ms. No queues. No waiting. Pure speed delivered at the edge.",
    span: "md:col-span-2",
  },
  {
    icon: Globe,
    title: "Global Reach",
    desc: "Optimized for every LinkedIn market. From Silicon Valley to Singapore, your profile speaks the local language of success.",
    span: "md:col-span-1",
  },
  {
    icon: Cpu,
    title: "AI Precision",
    desc: "Machine learning models trained on 100K+ high-performing profiles. We know what works because the data tells us.",
    span: "md:col-span-1",
  },
  {
    icon: TrendingUp,
    title: "Growth Metrics",
    desc: "Track your profile's performance with real-time analytics. Watch your SSI score, search appearances, and engagement climb.",
    span: "md:col-span-2",
  },
];

function Features() {
  return (
    <section id="features" className="relative py-32 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-heading font-bold text-center mb-16"
        >
          Engineered for{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1e3a8a] to-[#2563eb]">
            Domination
          </span>
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <FeatureCard key={i} feature={feat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const maskImage = useMotionTemplate`radial-gradient(250px circle at ${mouseX}px ${mouseY}px, white, transparent)`;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      className={`relative rounded-3xl border border-black/5 bg-white p-8 group overflow-hidden ${feature.span}`}
    >
      {/* Mouse gradient mask */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background:
            "radial-gradient(250px circle, rgba(37,99,235,0.06), transparent)",
          maskImage,
          WebkitMaskImage: maskImage,
        }}
      />
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-xl bg-brand/5 text-brand flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-brand group-hover:text-white">
          <feature.icon size={24} />
        </div>
        <h3 className="text-xl font-heading font-semibold mb-3">
          {feature.title}
        </h3>
        <p className="text-gray-500 leading-relaxed text-sm">{feature.desc}</p>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   STORIES (Hall of Fame)
   ───────────────────────────────────────────── */

const testimonials = [
  {
    name: "Alex R.",
    role: "Senior PM at Google",
    quote: "Recruiter messages went up 300% in 48 hours.",
  },
  {
    name: "Sarah K.",
    role: "Founder TechFlow",
    quote:
      "Fundraising became easier when my profile looked inevitable.",
  },
  {
    name: "James L.",
    role: "VP Sales Oracle",
    quote: "The psychology behind the rewrite is unmatched.",
  },
  {
    name: "Priya M.",
    role: "Engineer Netflix",
    quote: "I didn't apply. They came to me.",
  },
  {
    name: "Davide B.",
    role: "Director Spotify",
    quote: "Essential infrastructure for your career.",
  },
];

function Stories() {
  const [isPaused, setIsPaused] = useState(false);
  const doubled = [...testimonials, ...testimonials];

  return (
    <section id="stories" className="relative py-32 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 mb-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-heading font-bold text-center"
        >
          Hall of{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1e3a8a] to-[#2563eb]">
            Fame
          </span>
        </motion.h2>
      </div>

      <div
        className="relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className="flex gap-6 animate-scroll-x"
          style={{
            width: "max-content",
            animationPlayState: isPaused ? "paused" : "running",
          }}
        >
          {doubled.map((t, i) => (
            <div
              key={i}
              className="w-[400px] shrink-0 rounded-2xl border border-black/5 bg-white p-8"
            >
              <Quote size={24} className="text-brand/30 mb-4" />
              <p className="text-lg font-medium text-rich-black mb-6 leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <User size={18} className="text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-rich-black">
                    {t.name}
                  </p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   DEMO VIDEO
   ───────────────────────────────────────────── */

function DemoVideo() {
  return (
    <section id="demo" className="relative py-32 px-4 bg-slate-50">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-heading font-bold mb-12"
        >
          See It in{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1e3a8a] to-[#2563eb]">
            Action
          </span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative aspect-video rounded-[2rem] shadow-2xl border-4 border-white overflow-hidden group cursor-pointer"
        >
          {/* Mock window decoration */}
          <div className="absolute top-0 left-0 right-0 h-10 bg-gray-900 flex items-center px-4 z-10">
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-green-400" />
            </div>
          </div>

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800" />
          <div
            className="absolute inset-0 opacity-10 grayscale"
            style={{
              backgroundImage:
                'url("https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=60")',
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          {/* Play button */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Play size={32} className="text-white ml-1" />
            </div>
            <p className="text-white/80 text-sm font-medium">
              Watch the 2-minute walkthrough
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FAQ (Protocol Details)
   ───────────────────────────────────────────── */

const faqData = [
  {
    q: "Is this cheating?",
    a: "No. It's engineering. We use the same algorithms LinkedIn uses to rank profiles, but in reverse to optimize yours.",
  },
  {
    q: "How long does the audit take?",
    a: "Less than 200 milliseconds. Our edge computing infrastructure analyzes 50+ data points instantly.",
  },
  {
    q: "Will my current employer know?",
    a: "We operate in stealth mode. No notifications are sent. Your optimization process is completely private.",
  },
  {
    q: "What is the SSI Score?",
    a: "Social Selling Index. It's the hidden metric LinkedIn uses to decide who sees your content. We help you max it out.",
  },
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="pricing" className="relative py-32 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-heading font-bold text-center mb-16"
        >
          Protocol{" "}
          <span className="text-brand">Details</span>
        </motion.h2>

        <div className="space-y-4">
          {faqData.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-black/5 bg-white overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="text-lg font-heading font-semibold text-rich-black">
                  {item.q}
                </span>
                <span className="shrink-0 ml-4">
                  {openIndex === i ? (
                    <Minus size={20} className="text-brand" />
                  ) : (
                    <Plus size={20} className="text-gray-400" />
                  )}
                </span>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-6 text-gray-500 leading-relaxed">
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   PRE-FOOTER CTA
   ───────────────────────────────────────────── */

function PreFooterCTA() {
  return (
    <section className="relative py-40 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl md:text-7xl font-heading font-bold"
        >
          Don&apos;t vanish.
          <br />
          <span className="text-brand">Stand out.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-xl text-gray-500 max-w-lg mx-auto"
        >
          Join thousands of professionals who refuse to be invisible.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-10"
        >
          <Link href="/intake">
            <Button
              variant="primary"
              size="lg"
              className="shadow-xl shadow-brand/20"
            >
              Start Your Audit <ArrowRight size={20} />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FOOTER
   ───────────────────────────────────────────── */

function Footer() {
  const footerLinks = {
    Product: ["Features", "Pricing", "Demo", "Changelog"],
    Company: ["About", "Blog", "Careers", "Contact"],
    Legal: ["Privacy", "Terms", "Security"],
  };

  return (
    <footer className="relative bg-rich-black text-white py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl font-heading font-bold">LinkifyMe</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              The advanced intelligence layer for your professional presence.
              Built for those who demand excellence.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a
                href="#"
                className="text-gray-500 hover:text-white transition-colors"
              >
                <Twitter size={18} />
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-white transition-colors"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="#"
                className="text-gray-500 hover:text-white transition-colors"
              >
                <Github size={18} />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-gray-500 hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} LinkifyMe. All rights reserved.
          </p>
          <p className="text-xs text-gray-700">
            Engineered with precision.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
   ───────────────────────────────────────────── */

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-white text-rich-black overflow-x-hidden">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Top-left blob */}
        <div
          className="absolute -top-[20%] -left-[10%] w-[45vw] h-[45vw] rounded-full animate-slow-spin opacity-100"
          style={{
            background: "rgba(37, 99, 235, 0.15)",
            filter: "blur(120px)",
          }}
        />
        {/* Bottom-right blob */}
        <div
          className="absolute -bottom-[20%] -right-[10%] w-[45vw] h-[45vw] rounded-full animate-slow-spin opacity-100"
          style={{
            background: "rgba(37, 99, 235, 0.15)",
            filter: "blur(120px)",
            animationDirection: "reverse",
          }}
        />
        {/* Floating blob */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[25vw] h-[25vw] rounded-full animate-pulse opacity-100"
          style={{
            background: "rgba(99, 102, 241, 0.10)",
            filter: "blur(80px)",
          }}
        />
      </div>

      {/* Noise overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[1] opacity-20"
        style={{
          backgroundImage:
            'url("https://grainy-gradients.vercel.app/noise.svg")',
          backgroundRepeat: "repeat",
        }}
      />

      <MouseSpotlight />
      <Navbar />

      <main className="relative z-10">
        <Hero />
        <Comparison />
        <Timeline />
        <Integrations />
        <Features />
        <Stories />
        <DemoVideo />
        <FAQ />
        <PreFooterCTA />
      </main>

      <Footer />
    </div>
  );
}
