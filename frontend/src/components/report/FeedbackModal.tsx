"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { FeedbackForm } from "./FeedbackForm";

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    email: string;
    customerId: string;
}

export function FeedbackModal({ isOpen, onClose, email, customerId }: FeedbackModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
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
                                    <button
                                        onClick={onClose}
                                        className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                                    >
                                        <X className="h-4 w-4 text-white" />
                                    </button>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-6">
                                <FeedbackForm
                                    email={email}
                                    customerId={customerId}
                                    onSubmitSuccess={() => {
                                        setTimeout(onClose, 2000);
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
