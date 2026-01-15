import { cn } from "@/lib/cn";

interface NoiseOverlayProps {
    opacity?: number;
    className?: string;
}

export function NoiseOverlay({ opacity = 0.12, className }: NoiseOverlayProps) {
    return (
        <div
            className={cn("pointer-events-none absolute inset-0 z-0 noise-overlay mix-blend-overlay", className)}
            style={{ opacity }}
        />
    );
}
