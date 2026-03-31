"use client";

/**
 * V4 Audit Page — exact 1:1 port of the zip file's AuditPage.tsx UI,
 * but wired to the real LinkifyMe backend via submitIntake().
 * On success → redirects to /loader (the real analysis workflow).
 */

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useMotionTemplate } from "framer-motion";
import { ArrowLeft, CheckCircle2, Menu, X, Twitter, Linkedin, Github } from "lucide-react";
import { submitIntake } from "@/lib/api";

/* ── BUTTON (same as landing) ──────────────────────────────────────── */
interface BtnProps {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}
function Btn({ variant = "primary", size = "md", children, className = "", onClick, disabled, type = "button" }: BtnProps) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const variantCls = {
    primary: "bg-gray-200 text-rich-black hover:bg-gray-300 border border-gray-300 shadow-lg",
    secondary: "bg-gray-100 text-rich-black border border-gray-200 hover:bg-gray-200",
    outline: "bg-transparent text-rich-black border border-black/10 hover:bg-black/5 hover:border-black/30",
    ghost: "bg-transparent text-gray-500 hover:text-rich-black",
  }[variant];
  const sizeCls = { sm: "px-4 py-2 text-sm", md: "px-6 py-3 text-base", lg: "px-8 py-4 text-lg" }[size];

  return (
    <motion.button
      ref={ref} type={type} disabled={disabled}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        setPos({ x: (e.clientX - (r.left + r.width / 2)) * 0.35, y: (e.clientY - (r.top + r.height / 2)) * 0.35 });
      }}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      onClick={onClick}
      className={["relative rounded-full font-medium transition-colors duration-200 cursor-pointer overflow-hidden group", variantCls, sizeCls, className, disabled ? "opacity-50 cursor-not-allowed" : ""].join(" ")}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </motion.button>
  );
}

/* ── NAVBAR (minimal, same brand) ──────────────────────────────────── */
function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4">
        <div className="relative flex items-center justify-between px-6 w-full max-w-7xl h-20 bg-transparent">
          <Link href="/v4" className="flex items-center">
            <img src="/logos/linkifyme-text.png" alt="LinkifyMe" className="h-10 md:h-12 w-auto object-contain" />
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            {["Features", "Stories", "Pricing"].map((item) => (
              <Link key={item} href={`/v4#${item.toLowerCase()}`}
                className="text-sm font-medium text-gray-600 hover:text-rich-black transition-colors">
                {item}
              </Link>
            ))}
          </div>
          <button className="md:hidden p-2 hover:bg-black/5 rounded-full transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white/95 backdrop-blur-md pt-28 px-6 md:hidden flex flex-col items-center space-y-8">
            {["Features", "Stories", "Pricing"].map((item) => (
              <Link key={item} href={`/v4#${item.toLowerCase()}`}
                onClick={() => setMobileOpen(false)}
                className="text-2xl font-medium text-rich-black hover:text-brand transition-colors">
                {item}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── FOOTER (same as landing) ──────────────────────────────────────── */
function Footer() {
  return (
    <footer className="bg-rich-black pt-20 pb-10 border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center pt-8">
          <p className="text-gray-600 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Linki Inc. All rights reserved.
          </p>
          <div className="flex space-x-6">
            {[Twitter, Linkedin, Github].map((Icon, i) => (
              <a key={i} href="#" className="text-gray-500 hover:text-white transition-colors"><Icon size={20} /></a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ── AUDIENCE OPTIONS (mapped to real backend target_group values) ─── */
const AUDIENCE_OPTIONS = [
  { label: "HR / Recruiters", value: "recruiters" },
  { label: "VCs / Investors", value: "vcs" },
  { label: "Clients & Brands", value: "clients" },
];

/* ── AUDIT PAGE ─────────────────────────────────────────────────────── */
export default function AuditPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    linkedinUrl: "",
    email: "",
    phone: "",
    audience: "recruiters",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMsg("");

    try {
      const response = await submitIntake({
        linkedin_url: formData.linkedinUrl,
        email: formData.email,
        phone: formData.phone,
        target_group: formData.audience,
      });

      // Store session data (same as existing intake flow)
      sessionStorage.setItem("linkify_unique_id", response.unique_id);
      if (response.user_id) sessionStorage.setItem("linkify_user_id", response.user_id);
      if (response.is_returning_user) sessionStorage.setItem("linkify_returning_user", "true");
      sessionStorage.setItem("linkify_previous_attempts", String(response.previous_attempts_count));
      sessionStorage.setItem("linkify_email", formData.email);

      setSubmitStatus("success");

      // Redirect to loader after brief success flash
      setTimeout(() => {
        router.push("/loader");
      }, 1200);

    } catch (err) {
      setSubmitStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-rich-black font-sans selection:bg-brand selection:text-white overflow-x-hidden relative flex flex-col">
      {/* Background atmosphere — exact from zip's AuditPage */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-brand/10 rounded-full blur-[100px] mix-blend-multiply" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-blue-600/10 rounded-full blur-[100px] mix-blend-multiply" />
        <div className="absolute inset-0 opacity-[0.15]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
      </div>

      <div className="relative z-10 flex-grow flex flex-col">
        <Navbar />

        <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-black/5 rounded-3xl shadow-2xl p-8"
          >
            <Link href="/v4"
              className="flex items-center text-sm text-gray-500 hover:text-rich-black mb-6 transition-colors w-fit">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Link>

            <div className="text-center mb-8">
              <h1 className="text-3xl font-heading font-bold text-rich-black mb-2">
                Start Your Audit
              </h1>
              <p className="text-gray-600">Let&apos;s analyze your profile potential.</p>
            </div>

            {submitStatus === "success" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-rich-black mb-2">Analysis Started!</h3>
                <p className="text-gray-600 mb-2">Redirecting to your report...</p>
                <div className="flex justify-center mt-4">
                  <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700 mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    type="url" id="linkedinUrl" required
                    placeholder="https://linkedin.com/in/you"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email" id="email" required
                    placeholder="you@company.com"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel" id="phone" required
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="audience" className="block text-sm font-medium text-gray-700 mb-1">
                    Target Audience
                  </label>
                  <div className="relative">
                    <select
                      id="audience"
                      className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all appearance-none cursor-pointer"
                      value={formData.audience}
                      onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                      disabled={isSubmitting}
                    >
                      {AUDIENCE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                {submitStatus === "error" && (
                  <p className="text-red-500 text-sm text-center">{errorMsg || "Something went wrong. Please try again."}</p>
                )}

                <Btn size="lg" type="submit" className="w-full group" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Start Free Audit"}
                  {!isSubmitting && <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                </Btn>
              </form>
            )}

            {submitStatus !== "success" && (
              <p className="mt-4 text-xs text-center text-gray-400">
                By clicking &ldquo;Start Free Audit&rdquo;, you agree to our Terms &amp; Privacy Policy.
              </p>
            )}
          </motion.div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
