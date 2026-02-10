/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.{js,ts,jsx,tsx}",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./app/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'rich-black': '#020617', // Deep Navy (replacing Black)
                'carbon': '#1e293b',     // Slate 800
                'charcoal': '#334155',   // Slate 700
                'platinum': '#f1f5f9',   // Slate 100
                'silver': '#cbd5e1',     // Slate 300
                'gray': {
                    50: '#f8fafc',  // Slate 50
                    100: '#f1f5f9', // Slate 100
                    200: '#e2e8f0', // Slate 200
                    300: '#cbd5e1', // Slate 300
                    400: '#94a3b8', // Slate 400
                    500: '#64748b', // Slate 500 (Navy Grey)
                    600: '#475569', // Slate 600 (Darker Navy Grey)
                    700: '#334155', // Slate 700 (Darkest Navy Grey)
                    800: '#1e293b', // Slate 800
                    900: '#0f172a', // Slate 900
                },
                'brand': {
                    DEFAULT: '#2563eb', // Blue 600
                    light: '#60a5fa',   // Blue 400
                    dark: '#1d4ed8',    // Blue 700
                    glow: '#3b82f6',    // Blue 500
                },
                'accent': {
                    DEFAULT: '#2563eb', // Blue 600
                    glow: '#60a5fa',    // Blue 400
                }
            },
            backgroundImage: {
                'brand-gradient': 'linear-gradient(to right, #1e3a8a, #2563eb)', // Dark Navy to Vibrant Blue
                'brand-gradient-subtle': 'linear-gradient(to right, rgba(30, 58, 138, 0.1), rgba(37, 99, 235, 0.1))',
            },
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'sans-serif'],
                heading: ['"Outfit"', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.8s ease-out',
                'slow-spin': 'spin 12s linear infinite',
                'shimmer': 'shimmer 2s linear infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                shimmer: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                }
            },
        },
    },
    plugins: [],
}
