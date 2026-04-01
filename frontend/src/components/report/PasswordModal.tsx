"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ShieldCheck } from "lucide-react";

interface PasswordModalProps {
    isOpen: boolean;
    phone: string;
    onSuccess: () => void;
}

export function PasswordModal({ isOpen, phone, onSuccess }: PasswordModalProps) {
    const [input, setInput] = useState("");
    const [error, setError] = useState(false);
    const [shake, setShake] = useState(false);

    // Get last 4 digits of phone
    const phoneDigits = phone.replace(/\D/g, "");
    const last4 = phoneDigits.slice(-4);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const inputDigits = input.replace(/\D/g, "");

        if (inputDigits === last4) {
            // Store auth in session
            sessionStorage.setItem("linkify_report_auth", "true");
            onSuccess();
        } else {
            setError(true);
            setShake(true);
            setTimeout(() => setShake(false), 500);
            setTimeout(() => setError(false), 3000);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-gradient-to-br from-slate-900/90 to-indigo-900/90 backdrop-blur-md"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                        className="fixed inset-0 z-[201] flex items-center justify-center p-4"
                    >
                        <motion.div
                            animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
                            transition={{ duration: 0.4 }}
                            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-6 text-center">
                                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                                    <Lock className="h-7 w-7 text-indigo-400" />
                                </div>
                                <h3 className="text-lg font-bold text-white">Protected Report</h3>
                                <p className="text-slate-400 text-sm mt-1">
                                    Enter the last 4 digits of the sender&apos;s phone number
                                </p>
                            </div>

                            {/* Body */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={4}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value.replace(/\D/g, ""))}
                                        placeholder="• • • •"
                                        autoFocus
                                        className={`w-full text-center text-3xl font-bold tracking-[0.5em] rounded-xl border-2 px-4 py-4 transition-colors focus:outline-none ${error
                                                ? "border-red-400 bg-red-50 text-red-700 focus:ring-red-500/20"
                                                : "border-slate-200 bg-slate-50 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                                            }`}
                                    />
                                </div>

                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-sm text-red-600 text-center font-medium"
                                    >
                                        Incorrect password. Please try again.
                                    </motion.p>
                                )}

                                <button
                                    type="submit"
                                    disabled={input.length < 4}
                                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm font-semibold shadow-sm hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    <ShieldCheck className="h-4 w-4" />
                                    Unlock Report
                                </button>

                                <p className="text-xs text-center text-slate-400">
                                    This is the phone number used by the person who shared this report
                                </p>
                            </form>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
