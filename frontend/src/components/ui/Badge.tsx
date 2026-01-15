import { cn } from "@/lib/cn";

type BadgeTone = "neutral" | "brand" | "success" | "warning" | "critical";

interface BadgeProps {
    tone?: BadgeTone;
    children: React.ReactNode;
    className?: string;
}

const toneStyles: Record<BadgeTone, string> = {
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
    brand: "bg-brand/10 text-brand-dark border-brand/20",
    success: "bg-green-50 text-green-700 border-green-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    critical: "bg-rose-50 text-rose-700 border-rose-200",
};

export function Badge({ tone = "neutral", children, className }: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border uppercase tracking-wide",
                toneStyles[tone],
                className
            )}
        >
            {children}
        </span>
    );
}
