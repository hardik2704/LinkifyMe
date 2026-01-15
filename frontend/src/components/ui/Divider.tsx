import { cn } from "@/lib/cn";

interface DividerProps {
    className?: string;
}

export function Divider({ className }: DividerProps) {
    return <hr className={cn("border-t border-slate-100", className)} />;
}
