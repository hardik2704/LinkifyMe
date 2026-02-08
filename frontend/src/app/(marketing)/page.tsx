"use client";

import Link from "next/link";
import { CheckCircle2, Star, ArrowRight, ShieldCheck, Sparkles, BarChart3, Users, Zap } from "lucide-react";

export default function HomePage() {
    return (
        <div className="min-h-screen flex flex-col font-sans text-gray-800 bg-[#F8F9FA]">
            {/* Navbar */}
            <nav className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-1 select-none cursor-pointer" aria-label="LinkifyMe Logo">
                        <span className="text-[#0B3B6F] font-bold text-4xl leading-none">Link</span>
                        <div className="bg-[#0B3B6F] rounded-lg h-10 w-12 flex items-center justify-center">
                            <span className="text-white font-bold text-2xl leading-none">ify</span>
                        </div>
                        <span className="text-[#0B3B6F] font-bold text-4xl leading-none">Me</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <ShieldCheck size={16} className="text-green-600" />
                        <span className="hidden sm:inline">AI-Powered Analysis</span>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* LEFT COLUMN: Hero Content */}
                    <div className="lg:col-span-7 space-y-8">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-blue-50 text-[#0B3B6F] px-4 py-2 rounded-full text-sm font-medium mb-6">
                                <Sparkles size={16} />
                                AI-Powered LinkedIn Optimization
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                                Turn Your LinkedIn Into a{" "}
                                <span className="text-[#0B3B6F]">Client Magnet</span>
                            </h1>

                            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-8">
                                Get a data-driven audit of your profile, AI-powered rewrite suggestions,
                                and a clear roadmap to rank in the top 1% of your industry.
                            </p>

                            {/* CTA Button */}
                            <Link href="/intake">
                                <button className="bg-[#0B3B6F] text-white py-4 px-8 rounded-lg font-semibold text-lg transition-all duration-200 hover:bg-[#082a52] shadow-md hover:shadow-lg flex items-center gap-3 group">
                                    Get Access
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>

                            {/* Trust Signals */}
                            <div className="flex flex-wrap items-center gap-6 mt-8 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-green-500" />
                                    <span>No credit card required</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-green-500" />
                                    <span>Results in 2 minutes</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-green-500" />
                                    <span>100% Free</span>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial */}
                        <div className="bg-[#E7EEF5] rounded-xl p-6 flex items-start gap-4">
                            <div className="bg-white p-2 rounded-full shadow-sm text-2xl shrink-0">😎</div>
                            <div>
                                <p className="text-sm font-medium text-gray-800 italic">
                                    &quot;The review completely changed how I approach networking. My profile views increased 3x in just one week!&quot;
                                </p>
                                <p className="text-xs text-gray-500 mt-2 font-bold uppercase tracking-wider">
                                    - Amit S., Founder
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Feature Card */}
                    <div className="lg:col-span-5">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3">
                                What You&apos;ll Get
                            </h2>

                            <div className="flex gap-4 mb-6">
                                <div className="w-20 h-20 bg-blue-50 rounded-lg flex items-center justify-center text-3xl shrink-0">
                                    👀
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">Complete LinkedIn Audit</h3>
                                    <p className="text-sm text-gray-500 mt-1">50+ data points analyzed by AI</p>
                                    <div className="flex items-center gap-1 mt-2 text-yellow-500 text-sm font-medium">
                                        <Star size={14} fill="currentColor" />
                                        <span>4.9</span>
                                        <span className="text-gray-400 font-normal">(120+ reviews)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-start gap-2.5 text-sm text-gray-600">
                                    <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
                                    <span>Profile score out of 100</span>
                                </div>
                                <div className="flex items-start gap-2.5 text-sm text-gray-600">
                                    <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
                                    <span>Headline &amp; Bio optimization</span>
                                </div>
                                <div className="flex items-start gap-2.5 text-sm text-gray-600">
                                    <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
                                    <span>SEO &amp; keyword suggestions</span>
                                </div>
                                <div className="flex items-start gap-2.5 text-sm text-gray-600">
                                    <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
                                    <span>Actionable improvement roadmap</span>
                                </div>
                                <div className="flex items-start gap-2.5 text-sm text-gray-600">
                                    <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
                                    <span>Industry benchmarking</span>
                                </div>
                            </div>

                            <Link href="/intake" className="block">
                                <button className="w-full bg-[#0B3B6F] text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 hover:bg-[#082a52] shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                                    Get Access <ArrowRight size={18} />
                                </button>
                            </Link>

                            <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-800 text-center mt-4">
                                ✨ 100% Free • No credit card required
                            </div>
                        </div>
                    </div>
                </div>

                {/* How It Works Section */}
                <section className="mt-24 pt-16 border-t border-gray-200">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            How It Works
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Three simple steps to transform your LinkedIn presence
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                step: "01",
                                icon: <Users className="h-8 w-8 text-[#0B3B6F]" />,
                                title: "Enter Your URL",
                                desc: "Paste your LinkedIn profile URL and tell us your target audience."
                            },
                            {
                                step: "02",
                                icon: <Sparkles className="h-8 w-8 text-[#0B3B6F]" />,
                                title: "AI Analysis",
                                desc: "Our AI scans your profile against 50+ optimization criteria."
                            },
                            {
                                step: "03",
                                icon: <BarChart3 className="h-8 w-8 text-[#0B3B6F]" />,
                                title: "Get Results",
                                desc: "Receive a detailed report with scores and actionable improvements."
                            },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                                <div className="text-5xl font-bold text-gray-100 mb-4">{item.step}</div>
                                <div className="mb-4">{item.icon}</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-gray-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Final CTA */}
                <section className="mt-24">
                    <div className="relative overflow-hidden rounded-2xl bg-[#0B3B6F] px-8 py-16 text-center">
                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                                Ready to Optimize Your Profile?
                            </h2>
                            <p className="text-lg text-blue-100 mb-8">
                                Join 10,000+ professionals who have transformed their LinkedIn presence.
                            </p>
                            <Link href="/intake">
                                <button className="bg-white text-[#0B3B6F] py-4 px-8 rounded-lg font-semibold text-lg transition-all duration-200 hover:bg-gray-100 shadow-md hover:shadow-lg inline-flex items-center gap-3">
                                    Get Access
                                    <ArrowRight size={20} />
                                </button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="w-full border-t border-gray-200 mt-12 py-8 bg-white">
                <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-[#0B3B6F]" />
                        <span className="font-bold text-gray-900">LinkifyMe</span>
                    </div>
                    <p className="text-sm text-gray-400">© 2026 LinkifyMe. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
