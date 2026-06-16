/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: "#E8F0FB",
          100: "#C5D7F0",
          200: "#9BBBE6",
          300: "#6E9FDB",
          400: "#4B87D4",
          500: "#286FCC",
          600: "#1F58A3",
          700: "#164075",
          800: "#0F2A4A",
          900: "#081729",
        },
        accent: {
          50: "#FFF1E8",
          100: "#FFD9BF",
          200: "#FFBE95",
          300: "#FFA36B",
          400: "#FF8F4D",
          500: "#FF6B35",
          600: "#E55020",
          700: "#B33D18",
          800: "#802B10",
          900: "#4D1A08",
        },
        dark: {
          50: "#F0F2F5",
          100: "#D9DEE6",
          200: "#B3BCC9",
          300: "#8D99AD",
          400: "#66758F",
          500: "#4A5A73",
          600: "#354358",
          700: "#243040",
          800: "#17202E",
          900: "#0E141F",
        },
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        info: "#3B82F6",
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', "system-ui", "sans-serif"],
        display: ['"Rajdhani"', '"Noto Sans SC"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      boxShadow: {
        "glow-primary": "0 0 20px rgba(40, 111, 204, 0.3)",
        "glow-accent": "0 0 20px rgba(255, 107, 53, 0.3)",
        "card-dark": "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-in-left": "slideInLeft 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideInLeft: {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
