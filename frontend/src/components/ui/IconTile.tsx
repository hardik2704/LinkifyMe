import { cn } from "@/lib/cn";

type IconTileTone = "brand" | "neutral" | "success" | "warning" | "critical";
type IconTileSize = "sm" | "md" | "lg";

interface IconTileProps {
    icon: React.ReactNode;
    tone?: IconTileTone;
    size?: IconTileSize;
    className?: string;
}

const toneStyles: Record<IconTileTone, string> = {
    brand: "bg-brand/10 text-brand border-brand/15",
    neutral: "bg-slate-100 text-slate-600 border-slate-200",
    success: "bg-green-50 text-green-600 border-green-200",
    warning: "bg-amber-50 text-amber-600 border-amber-200",
    critical: "bg-rose-50 text-rose-600 border-rose-200",
};

const sizeStyles: Record<IconTileSize, string> = {
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-12 w-12 text-lg",
};

export function IconTile({ icon, tone = "neutral", size = "md", className }: IconTileProps) {
    return (
        <div
            className={cn(
                "flex items-center justify-center rounded-xl border",
                toneStyles[tone],
                sizeStyles[size],
                className
            )}
        >
            {icon}
        </div>
    );
}
