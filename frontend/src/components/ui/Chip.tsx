import { cn } from "@/lib/cn";
import { Check } from "lucide-react";

interface ChipProps {
    checked?: boolean;
    icon?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}

export function Chip({ checked, icon, children, className }: ChipProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                checked
                    ? "bg-brand/10 text-brand-dark border-brand/20"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100",
                className
            )}
        >
            {checked ? <Check className="h-3 w-3" /> : icon}
            {children}
        </span>
    );
}
