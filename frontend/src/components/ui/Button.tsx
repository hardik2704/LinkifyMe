"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
    {
        variants: {
            variant: {
                primary:
                    "bg-brand text-white hover:bg-brand-dark shadow-lg shadow-brand/20 hover:shadow-xl hover:shadow-brand/30",
                outline:
                    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300",
                ghost:
                    "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                gradient:
                    "bg-gradient-to-r from-brand to-brand-light text-white shadow-lg shadow-brand/20 hover:shadow-xl hover:shadow-brand/30",
            },
            size: {
                sm: "h-9 px-4 text-xs",
                md: "h-10 px-5",
                lg: "h-12 px-8 text-base",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "md",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    isLoading?: boolean;
}

export function Button({
    className,
    variant,
    size,
    leftIcon,
    rightIcon,
    isLoading,
    children,
    disabled,
    ...props
}: ButtonProps) {
    return (
        <button
            className={cn(buttonVariants({ variant, size, className }))}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                leftIcon
            )}
            {children}
            {!isLoading && rightIcon}
        </button>
    );
}
