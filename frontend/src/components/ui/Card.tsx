import { cn } from "@/lib/cn";

type CardVariant = "default" | "soft" | "elevated" | "glass";

interface CardProps {
    variant?: CardVariant;
    children: React.ReactNode;
    className?: string;
}

const variantStyles: Record<CardVariant, string> = {
    default: "bg-white border border-slate-100 shadow-sm",
    soft: "bg-slate-50/80 border border-transparent",
    elevated: "bg-white border border-slate-100 shadow-soft hover:shadow-hover transition-shadow duration-300",
    glass: "bg-white/70 backdrop-blur-xl border border-black/5 shadow-soft",
};

export function Card({ variant = "default", children, className }: CardProps) {
    return (
        <div className={cn("rounded-3xl p-6", variantStyles[variant], className)}>
            {children}
        </div>
    );
}
