import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'rich-black': '#020617',
        'carbon': '#1e293b',
        'charcoal': '#334155',
        'platinum': '#f1f5f9',
        'silver': '#cbd5e1',
        ink: "#020617",
        brand: {
          DEFAULT: "#2563eb",
          dark: "#1d4ed8",
          light: "#60a5fa",
          glow: "#3b82f6",
        },
        accent: {
          DEFAULT: "#2563eb",
          glow: "#60a5fa",
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "Inter", "system-ui", "sans-serif"],
        heading: ['"Outfit"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
      boxShadow: {
        soft: "0 8px 30px rgba(2, 6, 23, 0.06)",
        hover: "0 14px 40px rgba(2, 6, 23, 0.10)",
        glow: "0 0 40px rgba(37, 99, 235, 0.15)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(to right, #1e3a8a, #2563eb)",
        "brand-gradient-subtle": "linear-gradient(to right, rgba(30, 58, 138, 0.1), rgba(37, 99, 235, 0.1))",
        "ink-gradient": "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "slow-spin": "spin 12s linear infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.8s ease-out",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
