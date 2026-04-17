import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";

const brand = {
  brand: "#2B7D3F",
  brandLight: "#A6DFC2",
  brandBoost: "#F2A662",
  brandSoft: "#FFFAF4",
  mapBlue: "#2A9ED3",
  dusk: "#28455C",
  bay: "#516B8F",
  sand: "#F8E8CF",
  path: "#F4CA88",
  charcoal: "#162530",
};

export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
        xl: "3rem",
      },
    },
    extend: {
      colors: {
        ...brand,
        earth: "#3d2f24",
        moss: "#2f884f",
        sky: "#7db5d1",
        fog: "#f2f5f6",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        heading: ["var(--font-heading)", "Sora", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        glow: "0 14px 44px rgba(39, 61, 82, 0.18)",
        card: "0 8px 20px rgba(23, 30, 42, 0.08)",
        flyout: "0 22px 40px rgba(20, 32, 46, 0.15)",
      },
      borderRadius: {
        base: "0.75rem",
        lg: "1.25rem",
        xl: "1.75rem",
      },
      transitionTimingFunction: {
        flow: "cubic-bezier(0.4, 0.0, 0.2, 1)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        fadeIn: {
          "from": { opacity: "0" },
          "to": { opacity: "1" },
        },
        fadeOut: {
          "from": { opacity: "1" },
          "to": { opacity: "0" },
        },
        slideInUp: {
          "from": { opacity: "0", transform: "translateY(10px)" },
          "to": { opacity: "1", transform: "translateY(0)" },
        },
        slideInDown: {
          "from": { opacity: "0", transform: "translateY(-10px)" },
          "to": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "from": { opacity: "0", transform: "translateX(-10px)" },
          "to": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "from": { opacity: "0", transform: "translateX(10px)" },
          "to": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "from": { opacity: "0", transform: "scale(0.95)" },
          "to": { opacity: "1", transform: "scale(1)" },
        },
        bounceIn: {
          "0%": { opacity: "0", transform: "scale(0.3)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        "spin-slow": {
          "from": { transform: "rotate(0deg)" },
          "to": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        float: "float 5s ease-in-out infinite",
        fadeIn: "fadeIn 0.3s ease-in-out",
        fadeOut: "fadeOut 0.3s ease-in-out",
        slideInUp: "slideInUp 0.4s ease-out",
        slideInDown: "slideInDown 0.4s ease-out",
        slideInLeft: "slideInLeft 0.4s ease-out",
        slideInRight: "slideInRight 0.4s ease-out",
        scaleIn: "scaleIn 0.3s ease-out",
        bounceIn: "bounceIn 0.5s ease-out",
        shimmer: "shimmer 2s infinite",
        "spin-slow": "spin-slow 3s linear infinite",
      },
    },
  },
  plugins: [forms, typography],
} satisfies Config;
