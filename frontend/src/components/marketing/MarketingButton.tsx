"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";

export interface MarketingButtonProps {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
}

export const MarketingButton: React.FC<MarketingButtonProps> = ({
    className = "",
    variant = "primary",
    size = "md",
    children,
    onClick,
    disabled,
    type = "button",
}) => {
    const ref = useRef<HTMLButtonElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current?.getBoundingClientRect() ?? { left: 0, top: 0, width: 0, height: 0 };
        const x = (clientX - (left + width / 2)) * 0.35;
        const y = (clientY - (top + height / 2)) * 0.35;
        setPosition({ x, y });
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    const variants = {
        primary: "bg-gray-200 text-rich-black hover:bg-gray-300 border border-gray-300 shadow-lg hover:shadow-gray-300/50",
        secondary: "bg-gray-100 text-rich-black border border-gray-200 hover:bg-gray-200",
        outline: "bg-transparent text-rich-black border border-black/10 hover:bg-black/5 hover:border-black/30",
        ghost: "bg-transparent text-gray-500 hover:text-rich-black",
    };

    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg",
    };

    return (
        <motion.button
            ref={ref}
            type={type}
            disabled={disabled}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{ x: position.x, y: position.y }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            className={`relative rounded-full font-medium transition-[background-color,border-color] duration-150 ease-out cursor-pointer overflow-hidden group ${variants[variant]} ${sizes[size]} ${className}`}
        >
            <span className="relative z-10 flex items-center justify-center gap-2">
                {children}
            </span>
            {variant === "primary" && (
                <div className="absolute inset-0 -translate-x-full transition-transform duration-700 ease-out group-hover:translate-x-[200%] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
            )}
        </motion.button>
    );
};
