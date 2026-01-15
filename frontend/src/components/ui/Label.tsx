import * as React from "react";
import { cn } from "@/lib/cn";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    required?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
    ({ className, children, required, ...props }, ref) => (
        <label
            ref={ref}
            className={cn(
                "block text-sm font-semibold text-slate-700 mb-2",
                className
            )}
            {...props}
        >
            {children}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
    )
);
Label.displayName = "Label";
