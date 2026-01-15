import { cn } from "@/lib/cn";
import { Info } from "lucide-react";

interface AnalysisBoxProps {
    content: string;
    className?: string;
}

export function AnalysisBox({ content, className }: AnalysisBoxProps) {
    return (
        <div className={cn("", className)}>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                <Info className="h-3 w-3" />
                YOUR ANALYSIS
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{content}</p>
        </div>
    );
}
