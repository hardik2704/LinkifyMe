import React, { useState } from 'react';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AuditPage: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        linkedinUrl: '',
        email: '',
        phone: '',
        audience: 'HR'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');

        // Create form data for Google Apps Script (x-www-form-urlencoded)
        const payload = new URLSearchParams();
        payload.append('linkedin', formData.linkedinUrl);
        payload.append('email', formData.email);
        payload.append('phone', formData.phone);
        payload.append('audience', formData.audience);

        try {
            const response = await fetch('https://script.google.com/macros/s/AKfycbxjlg-TM1e7InCNTWTnS9LTHTbthjPw9ON7dnQpK3KQfoN-MDJbbinlx0AIQQohfNt0/exec', {
                method: 'POST',
                body: payload,
            });

            // GAS often returns a redirect or opaque response if CORS isn't perfect, 
            // but if we get here without network error, we assume it sent.
            // If the script returns properly formatted JSON with CORS, we can parse it.

            const result = await response.json();

            if (result.result === 'success') {
                setSubmitStatus('success');
                setFormData({ linkedinUrl: '', email: '', phone: '', audience: 'HR' });
            } else {
                throw new Error(result.message || 'Submission failed');
            }

        } catch (error) {
            console.error('Submission error:', error);
            // Fallback: If JSON parsing fails (opaque response), but no network error thrown,
            // it might still be a success in "no-cors" scenarios, but we tried standard CORS.
            // For now, treat valid network completion as potential success or show general error.
            // Given the user script returns JSON, we expect parsing to work if CORS is good.
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-rich-black font-sans selection:bg-brand selection:text-white overflow-x-hidden relative flex flex-col">
            {/* Background Atmosphere */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-brand/10 rounded-full blur-[100px] mix-blend-multiply" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-blue-600/10 rounded-full blur-[100px] mix-blend-multiply" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
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
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center text-sm text-gray-500 hover:text-rich-black mb-6 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Back
                        </button>

                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-heading font-bold text-rich-black mb-2">
                                Start Your Audit
                            </h1>
                            <p className="text-gray-600">
                                Let's analyze your profile potential.
                            </p>
                        </div>

                        {submitStatus === 'success' ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-rich-black mb-2">Request Received!</h3>
                                <p className="text-gray-600 mb-6">We'll reach out to you shortly with your free audit.</p>
                                <Button onClick={() => setSubmitStatus('idle')} variant="outline">Submit Another</Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700 mb-1">
                                        LinkedIn URL
                                    </label>
                                    <input
                                        type="url"
                                        id="linkedinUrl"
                                        required
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
                                        type="email"
                                        id="email"
                                        required
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
                                        type="tel"
                                        id="phone"
                                        required
                                        placeholder="+1 (555) 000-0000"
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
                                            <option value="HR">HR / Recruiters</option>
                                            <option value="VCs">VCs / Investors</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {submitStatus === 'error' && (
                                    <p className="text-red-500 text-sm text-center">Something went wrong. Please try again.</p>
                                )}

                                <Button size="lg" className="w-full group" disabled={isSubmitting}>
                                    {isSubmitting ? 'Submitting...' : 'Start Free Audit'}
                                    {!isSubmitting && <CheckCircle2 className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />}
                                </Button>
                            </form>
                        )}

                        {submitStatus !== 'success' && (
                            <p className="mt-4 text-xs text-center text-gray-400">
                                By clicking "Start Free Audit", you agree to our Terms & Privacy Policy.
                            </p>
                        )}
                    </motion.div>
                </main>

                <Footer />
            </div>
        </div>
    );
};
