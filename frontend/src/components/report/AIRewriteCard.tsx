"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Chip } from "@/components/ui/Chip";
import { Sparkles, Copy, Check } from "lucide-react";

interface AIRewriteCardProps {
    text?: string;
    tags?: string[];
    onCopy?: () => void;
    className?: string;
}

export function AIRewriteCard({ text, tags, onCopy, className }: AIRewriteCardProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (text) {
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            onCopy?.();
        }
    };

    return (
        <div className={cn("rounded-xl border border-brand/20 bg-brand/5 p-4", className)}>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-brand" />
                    <span className="text-sm font-semibold text-slate-900">AI Rewrite</span>
                </div>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                    {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                    {copied ? "Copied" : "Copy"}
                </button>
            </div>

            {text && (
                <p className="text-sm text-slate-700 leading-relaxed mb-3">{text}</p>
            )}

            {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag, idx) => (
                        <Chip key={idx} checked>{tag}</Chip>
                    ))}
                </div>
            )}
        </div>
    );
}
