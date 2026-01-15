import { cn } from "@/lib/cn";
import { BlobBackground } from "@/components/ui/BlobBackground";
import { NoiseOverlay } from "@/components/ui/NoiseOverlay";

type PageShellVariant = "marketing" | "dashboard" | "loader";

interface PageShellProps {
    variant?: PageShellVariant;
    children: React.ReactNode;
    className?: string;
}

export function PageShell({ variant = "marketing", children, className }: PageShellProps) {
    const bgClass = variant === "dashboard" ? "bg-slate-50" : "bg-white";

    return (
        <div className={cn("relative min-h-screen", bgClass, className)}>
            {(variant === "marketing" || variant === "loader") && (
                <>
                    <BlobBackground variant={variant === "loader" ? "loaderLight" : "marketing"} />
                    <NoiseOverlay opacity={0.08} />
                </>
            )}
            <div className="relative z-10">{children}</div>
        </div>
    );
}
