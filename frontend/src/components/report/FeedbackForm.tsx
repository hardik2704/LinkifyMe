"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { submitFeedback } from "@/lib/api";

interface FeedbackFormProps {
    email: string;
    userId: string;
    onSubmitSuccess?: () => void;
    compact?: boolean;
}

function StarRating({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-slate-700 min-w-[120px]">{label}</span>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onChange(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        className="p-0.5 transition-transform hover:scale-110"
                    >
                        <Star
                            className={`h-6 w-6 transition-colors ${star <= (hover || value)
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300"
                                }`}
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}

export function FeedbackForm({ email, userId, onSubmitSuccess, compact }: FeedbackFormProps) {
    const [wouldRefer, setWouldRefer] = useState(0);
    const [wasHelpful, setWasHelpful] = useState(0);
    const [suggestions, setSuggestions] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (wouldRefer === 0 || wasHelpful === 0) {
            setError("Please rate both fields");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await submitFeedback({
                email: email || "anonymous@linkifyme.com",
                user_id: userId,
                would_refer: wouldRefer,
                was_helpful: wasHelpful,
                suggestions: suggestions || undefined,
            });
            setSubmitted(true);
            onSubmitSuccess?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to submit");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
            >
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-emerald-100 flex items-center justify-center">
                    <svg className="h-7 w-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h4 className="text-lg font-semibold text-slate-900 mb-1">Thank you!</h4>
                <p className="text-sm text-slate-500">Your feedback helps us improve LinkifyMe</p>
            </motion.div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {!compact && (
                <div className="mb-2">
                    <h4 className="text-base font-semibold text-slate-900">How was your experience?</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Your feedback helps us improve</p>
                </div>
            )}

            <StarRating label="Would Refer (1-5)" value={wouldRefer} onChange={setWouldRefer} />
            <StarRating label="Was Helpful (1-5)" value={wasHelpful} onChange={setWasHelpful} />

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Suggestions</label>
                <textarea
                    value={suggestions}
                    onChange={(e) => setSuggestions(e.target.value)}
                    placeholder="Any suggestions to improve our service?"
                    rows={2}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                />
            </div>

            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-brand text-white text-sm font-semibold shadow-sm hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </button>
        </form>
    );
}
