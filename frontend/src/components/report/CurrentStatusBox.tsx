import { cn } from "@/lib/cn";
import { Pencil } from "lucide-react";

interface CurrentStatusBoxProps {
    content: string;
    className?: string;
}

export function CurrentStatusBox({ content, className }: CurrentStatusBoxProps) {
    return (
        <div className={cn("", className)}>
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 uppercase tracking-wider mb-3">
                <Pencil className="h-3 w-3" />
                CURRENT LINKEDIN STATUS
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-700">
                {content}
            </div>
        </div>
    );
}
