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
  TrendingUp,
  Cpu,
  Globe,
  Twitter,
  Linkedin,
  Github,
  Plus,
  Minus,
  Play,
  User,
  CreditCard,
  FileText,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────
   BUTTON
   ───────────────────────────────────────────────────────── */
interface ButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
}

function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  onClick,
  href,
}: ButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({
      x: (e.clientX - (rect.left + rect.width / 2)) * 0.35,
      y: (e.clientY - (rect.top + rect.height / 2)) * 0.35,
    });
  };

  const variantCls = {
    primary:
      "bg-gray-200 text-rich-black hover:bg-gray-300 border border-gray-300 shadow-lg hover:shadow-gray-300/50",
    secondary:
      "bg-gray-100 text-rich-black border border-gray-200 hover:bg-gray-200",
    outline:
      "bg-transparent text-rich-black border border-black/10 hover:bg-black/5 hover:border-black/30",
    ghost: "bg-transparent text-gray-500 hover:text-rich-black",
  }[variant];

  const sizeCls = { sm: "px-4 py-2 text-sm", md: "px-6 py-3 text-base", lg: "px-8 py-4 text-lg" }[size];

  const el = (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      onClick={onClick}
      className={cn(
        "relative rounded-full font-medium transition-colors duration-200 cursor-pointer overflow-hidden group",
        variantCls,
        sizeCls,
        className
      )}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
      {variant === "primary" && (
        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
      )}
    </motion.button>
  );

  if (href) {
    return <Link href={href}>{el}</Link>;
  }
  return el;
}

/* ─────────────────────────────────────────────────────────
   MOUSE SPOTLIGHT
   ───────────────────────────────────────────────────────── */
function MouseSpotlight() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const fn = (e: MouseEvent) => { mouseX.set(e.clientX); mouseY.set(e.clientY); };
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
      style={{
        background: useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(37,99,235,0.07), transparent 40%)`,
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────
   NAVBAR
   ───────────────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
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
          className={cn(
            "relative flex items-center justify-between px-6 transition-all duration-300",
            scrolled
              ? "w-[90%] md:w-[60%] lg:w-[50%] h-16 bg-white/70 backdrop-blur-xl border border-black/5 rounded-full shadow-lg"
              : "w-full max-w-7xl h-20 bg-transparent border-transparent"
          )}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <AnimatePresence mode="wait">
              {!scrolled ? (
                <motion.img
                  key="full"
                  src="/logos/linkifyme-text.png"
                  alt="LinkifyMe"
                  className="h-10 md:h-12 w-auto object-contain"
                  initial={{ opacity: 0, scale: 0.8, rotateX: -90 }}
                  animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotateX: 90 }}
                  transition={{ duration: 0.4, ease: "backOut" }}
                />
              ) : (
                <motion.img
                  key="icon"
                  src="/logos/linkifyme-icon.png"
                  alt="Li"
                  className="h-10 w-auto object-contain"
                  initial={{ opacity: 0, scale: 0.8, rotateX: -90 }}
                  animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotateX: 90 }}
                  transition={{ duration: 0.4, ease: "backOut" }}
                />
              )}
            </AnimatePresence>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center space-x-8">
            {["Features", "Stories", "Pricing"].map((item) => (
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
            <Button
              variant={scrolled ? "primary" : "outline"}
              size="sm"
              className={!scrolled ? "text-rich-black border-black/10 hover:bg-black/5" : ""}
              href="/intake"
            >
              Get Started
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-rich-black p-2 hover:bg-black/5 rounded-full transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </motion.div>
      </motion.nav>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white/95 backdrop-blur-md pt-28 px-6 md:hidden flex flex-col items-center space-y-8"
          >
            {["Features", "Stories", "Pricing"].map((item, i) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setMobileOpen(false)}
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
              <Link href="/intake" onClick={() => setMobileOpen(false)}>
                <button className="w-full py-3 px-6 rounded-full bg-gray-200 text-rich-black border border-gray-300 font-medium text-lg">
                  Get Started
                </button>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─────────────────────────────────────────────────────────
   HERO
   ───────────────────────────────────────────────────────── */
function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacityText = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scaleImg = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

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
            <span className="flex h-2 w-2 rounded-full bg-brand animate-pulse" />
            <span className="text-sm font-medium text-gray-600">AI-Powered Analysis v2.0</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-6xl md:text-8xl lg:text-9xl font-heading font-bold tracking-tight text-rich-black mb-6 leading-none"
          >
            Command <br />
            <span className="bg-clip-text text-transparent bg-brand-gradient">Attention.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="max-w-2xl mx-auto text-xl md:text-2xl text-gray-600 mb-10 font-light leading-relaxed"
          >
            Your LinkedIn profile is your personal equity.{" "}
            <br className="hidden md:block" />
            Maximize it with precision engineering and AI logic.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" className="w-full sm:w-auto min-w-[200px] h-14 text-lg group" href="/intake">
              Audit Profile
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 text-lg" href="#demo">
              View Demo
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <motion.div
        style={{ scale: scaleImg }}
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-20"
      />
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   COMPARISON
   ───────────────────────────────────────────────────────── */
function Comparison() {
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
          {/* Standard */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative p-10 rounded-3xl border border-black/5 bg-gray-50 overflow-hidden grayscale opacity-70 hover:opacity-100 transition-opacity group"
          >
            <h3 className="text-2xl font-bold text-gray-400 mb-8 flex items-center">
              <span className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 mr-3">
                <X className="w-4 h-4 text-gray-400" />
              </span>
              Standard Profile
            </h3>
            <ul className="space-y-6 text-gray-400">
              {[
                'Generic "Open to work" frames',
                "Keyword-stuffed, unreadable bios",
                "Zero social proof or metrics",
                "Passive waiting for recruiters",
              ].map((item, i) => (
                <li key={i} className="flex items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-2 mr-3 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Optimised */}
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
                "Top 1% SSI Score Authority",
              ].map((item, i) => (
                <li key={i} className="flex items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand mt-2 mr-3 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   TIMELINE
   ───────────────────────────────────────────────────────── */
function Timeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start center", "end center"] });

  const steps = [
    { id: 1, icon: User, title: "Enter Profile", description: "Paste your LinkedIn URL to start the deep-dive analysis.", color: "from-blue-500 to-cyan-400" },
    { id: 2, icon: CreditCard, title: "Complete Payment", description: "Secure one-time payment for premium insights.", color: "from-indigo-500 to-purple-500" },
    { id: 3, icon: FileText, title: "Receive Report", description: "Get your personalised action plan with AI rewrites instantly.", color: "from-cyan-500 to-teal-400" },
  ];

  return (
    <section ref={containerRef} className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-rich-black tracking-tight mb-4"
          >
            How It{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-400">
              Works
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 max-w-2xl mx-auto"
          >
            Three simple steps to professional excellence.
          </motion.p>
        </div>

        <div className="relative">
          {/* Desktop line */}
          <div className="hidden md:block absolute top-8 left-0 w-full h-1 bg-gray-100 z-0 rounded-full" />
          <motion.div
            className="hidden md:block absolute top-8 left-0 h-1 bg-gradient-to-r from-brand to-brand-light z-0 rounded-full origin-left"
            style={{ scaleX: scrollYProgress, width: "100%" }}
          />
          {/* Mobile line */}
          <div className="md:hidden absolute top-0 left-8 bottom-0 w-1 bg-gray-100 z-0 rounded-full" />
          <motion.div
            className="md:hidden absolute top-0 left-8 w-1 bg-gradient-to-b from-brand to-brand-light z-0 rounded-full origin-top"
            style={{ scaleY: scrollYProgress, height: "100%" }}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                className="flex flex-col items-center md:items-start relative group"
              >
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white border border-gray-100 shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10">
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`} />
                  <step.icon className="w-8 h-8 text-gray-700 group-hover:text-brand transition-colors duration-300" />
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-rich-black text-white flex items-center justify-center font-bold text-sm border-2 border-white">
                    {step.id}
                  </div>
                </div>
                <div className="text-center md:text-left pl-0 md:pl-0">
                  <h3 className="text-xl font-bold text-rich-black mb-2">{step.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   INTEGRATIONS (ORBIT)
   ───────────────────────────────────────────────────────── */
function Integrations() {
  const logos = ["Notion", "Slack", "Gmail", "LinkedIn", "HubSpot", "Salesforce"];

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-brand font-medium mb-4 uppercase tracking-widest text-sm"
        >
          The Ecosystem
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl font-bold text-rich-black mb-20 tracking-tight"
        >
          Seamlessly <span className="text-gray-400">Connected.</span>
        </motion.h2>

        <div className="relative h-[400px] flex items-center justify-center">
          {/* Central node */}
          <div className="absolute z-10 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl border border-black/5">
            <span className="font-bold text-rich-black text-xl tracking-tighter">
              linki<span className="text-brand">.</span>
            </span>
          </div>

          {/* Orbit rings */}
          <div className="absolute border border-black/10 rounded-full w-[300px] h-[300px] animate-slow-spin opacity-50" />
          <div
            className="absolute border border-black/5 rounded-full w-[500px] h-[500px] animate-slow-spin opacity-30"
            style={{ animationDirection: "reverse", animationDuration: "20s" }}
          />

          {/* Orbiting pills */}
          {logos.map((logo, i) => {
            const angle = (i / logos.length) * 2 * Math.PI;
            const radius = 180;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            return (
              <motion.div
                key={logo}
                className="absolute text-sm font-medium text-gray-600 bg-white border border-black/10 px-4 py-2 rounded-full shadow-sm"
                style={{ x, y }}
                animate={{
                  x: [x, Math.cos(angle + Math.PI * 2) * radius],
                  y: [y, Math.sin(angle + Math.PI * 2) * radius],
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: -i * (25 / logos.length) }}
              >
                {logo}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   FEATURES BENTO
   ───────────────────────────────────────────────────────── */
const featuresList = [
  { title: "Instant Velocity", description: "Analysis results delivered fast using edge caching.", icon: Zap, colSpan: "md:col-span-2" },
  { title: "Global Reach", description: "Benchmark your profile against the top 1% globally.", icon: Globe, colSpan: "md:col-span-1" },
  { title: "AI Precision", description: "Trained on millions of profiles for exact recommendations.", icon: Cpu, colSpan: "md:col-span-1" },
  { title: "Growth Metrics", description: "Track your profile score improvements over time.", icon: TrendingUp, colSpan: "md:col-span-2" },
];

function FeatureCard({ feature, i }: { feature: typeof featuresList[0]; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.1 }}
      onMouseMove={(e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        x.set(e.clientX - rect.left);
        y.set(e.clientY - rect.top);
      }}
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
}

function Features() {
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
            Engineered for{" "}
            <span className="bg-clip-text text-transparent bg-brand-gradient">Domination</span>
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            A suite of tools designed to put you leagues ahead of the competition.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuresList.map((f, i) => (
            <FeatureCard key={i} feature={f} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   STORIES (MARQUEE)
   ───────────────────────────────────────────────────────── */
const testimonials = [
  { name: "Alex R.", role: "Senior PM at Google", text: "Recruiter messages went up 300% in 48 hours.", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80" },
  { name: "Sarah K.", role: "Founder, TechFlow", text: "Fundraising became easier when my profile looked inevitable.", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" },
  { name: "James L.", role: "VP Sales, Oracle", text: "The psychology behind the rewrite is unmatched.", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80" },
  { name: "Priya M.", role: "Engineer, Netflix", text: "I didn't apply. They came to me.", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" },
  { name: "Davide B.", role: "Director, Spotify", text: "Essential infrastructure for your career.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" },
];

function Stories() {
  return (
    <section id="stories" className="py-24 relative overflow-hidden">
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
          {[...testimonials, ...testimonials].map((s, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[380px] p-8 rounded-2xl bg-white border border-black/5 shadow-sm hover:shadow-md transition-shadow group"
            >
              <p className="text-lg text-gray-700 font-medium mb-6 leading-relaxed group-hover:text-rich-black transition-colors">
                &quot;{s.text}&quot;
              </p>
              <div className="flex items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.image} alt={s.name} className="w-12 h-12 rounded-full border-2 border-gray-100 mr-4 object-cover group-hover:border-brand/50 transition-colors" />
                <div>
                  <h4 className="text-rich-black font-bold">{s.name}</h4>
                  <p className="text-sm text-brand">{s.role}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   DEMO VIDEO
   ───────────────────────────────────────────────────────── */
function DemoVideo() {
  return (
    <section id="demo" className="py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-12">Still confused?</h2>
        <div className="relative aspect-video w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden border-4 border-white group cursor-pointer">
          <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80" alt="Dashboard preview" className="opacity-30 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
            <div className="z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform duration-300">
                <Play className="w-8 h-8 text-white fill-current ml-1" />
              </div>
              <span className="mt-4 text-white font-medium tracking-wide">Watch the 2-minute walkthrough</span>
            </div>
          </div>
          <div className="absolute top-8 left-8 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 hidden md:block">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <div className="w-3 h-3 bg-green-500 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   FAQ
   ───────────────────────────────────────────────────────── */
const faqs = [
  { question: "Is this cheating?", answer: "No. It's engineering. We use the same signals LinkedIn uses to rank profiles, but in reverse to optimize yours." },
  { question: "How long does the audit take?", answer: "Under a minute. Our system analyzes 12+ data points and generates a complete scored report with AI rewrites." },
  { question: "Will my current employer know?", answer: "We operate in stealth mode. No notifications are sent. Your optimization process is completely private." },
  { question: "What score does my profile get?", answer: "A 0–100 score across 12 sections: headline, about, experience, education, skills, profile photo, cover photo, connections, followers, certifications, verified, and premium status." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-rich-black mb-4 tracking-tight">
            Protocol <span className="text-brand">Details</span>
          </h2>
          <p className="text-gray-500">Everything you need to know about the system.</p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`bg-white rounded-2xl overflow-hidden border border-black/5 shadow-sm transition-all duration-300 ${open === i ? "border-brand/20 shadow-md ring-1 ring-brand/5" : "hover:border-black/10"}`}
            >
              <button
                className="w-full flex items-center justify-between p-6 text-left group"
                onClick={() => setOpen((p) => (p === i ? null : i))}
              >
                <span className={`text-lg font-medium transition-colors ${open === i ? "text-rich-black" : "text-gray-600 group-hover:text-rich-black"}`}>
                  {faq.question}
                </span>
                {open === i ? (
                  <Minus className="w-5 h-5 text-brand shrink-0" />
                ) : (
                  <Plus className="w-5 h-5 text-gray-400 group-hover:text-rich-black transition-colors shrink-0" />
                )}
              </button>
              <AnimatePresence>
                {open === i && (
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
}

/* ─────────────────────────────────────────────────────────
   PRE-FOOTER CTA
   ───────────────────────────────────────────────────────── */
function PreFooterCTA() {
  return (
    <section className="py-40 relative flex items-center justify-center">
      <div className="relative z-10 text-center max-w-4xl px-4">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl md:text-8xl font-bold text-rich-black mb-8 tracking-tighter"
        >
          Don&apos;t vanish. <br />
          <span className="bg-clip-text text-transparent bg-brand-gradient">Stand out.</span>
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
          <Button
            size="lg"
            className="h-16 px-10 text-xl shadow-[0_0_50px_rgba(37,99,235,0.2)] hover:shadow-[0_0_80px_rgba(37,99,235,0.4)] transition-shadow duration-500"
            href="/intake"
          >
            Start Free Audit
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   FOOTER
   ───────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="bg-rich-black pt-20 pb-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <span className="text-2xl font-bold tracking-tighter text-white mb-4 block">
              linki<span className="text-brand">.</span>me
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
                  <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">{item}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Legal</h4>
            <ul className="space-y-4">
              {["Privacy Protocol", "Terms of Service", "Cookie Policy"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">{item}</a>
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
}

/* ─────────────────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────────────────── */
export default function V3Page() {
  return (
    <div className="min-h-screen bg-white text-rich-black font-sans selection:bg-brand selection:text-white overflow-x-hidden relative">
      {/* Global atmosphere blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-15%] w-[45vw] h-[45vw] bg-brand/15 rounded-full blur-[120px] mix-blend-multiply animate-slow-spin" />
        <div
          className="absolute bottom-[-15%] right-[-15%] w-[45vw] h-[45vw] bg-blue-600/15 rounded-full blur-[120px] mix-blend-multiply animate-slow-spin"
          style={{ animationDirection: "reverse" }}
        />
        <div className="absolute top-[30%] left-[10%] w-[25vw] h-[25vw] bg-indigo-300/10 rounded-full blur-[100px] mix-blend-multiply animate-pulse" />
        {/* Noise */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className="relative z-10">
        <Navbar />
        <main>
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
    </div>
  );
}
