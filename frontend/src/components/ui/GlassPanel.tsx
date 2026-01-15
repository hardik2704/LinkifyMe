import { cn } from "@/lib/cn";

interface GlassPanelProps {
    children: React.ReactNode;
    className?: string;
}

export function GlassPanel({ children, className }: GlassPanelProps) {
    return (
        <div
            className={cn(
                "bg-white/80 backdrop-blur-xl border border-black/5 rounded-3xl shadow-soft",
                className
            )}
        >
            {children}
        </div>
    );
}
