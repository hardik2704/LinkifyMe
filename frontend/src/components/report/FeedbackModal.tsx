"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FeedbackForm } from "./FeedbackForm";

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    email: string;
    customerId: string;
}

export function FeedbackModal({ isOpen, onClose, email, customerId }: FeedbackModalProps) {
    const [hasSubmitted, setHasSubmitted] = useState(false);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop — non-closable until submitted */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                        className="fixed inset-0 z-[101] flex items-center justify-center p-4"
                    >
                        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
                            {/* Header */}
                            <div className="bg-brand px-6 py-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Quick Feedback</h3>
                                        <p className="text-white/80 text-sm mt-0.5">Help us improve your experience</p>
                                    </div>
                                    {/* Close button only visible after submission */}
                                    {hasSubmitted && (
                                        <button
                                            onClick={onClose}
                                            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                                        >
                                            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-6">
                                <FeedbackForm
                                    email={email}
                                    customerId={customerId}
                                    onSubmitSuccess={() => {
                                        setHasSubmitted(true);
                                        setTimeout(onClose, 2500);
                                    }}
                                    compact
                                />
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
