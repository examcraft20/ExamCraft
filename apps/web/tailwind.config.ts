import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        display: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        brandPrimary: "#ffffff",
        brandAccent: "#3b82f6",
        bgBase: "#000000",
        bgSurface: "#0a0a0a",
        bgSurfaceHover: "#171717",
        bgGlass: "rgba(255,255,255,0.03)",
        bgGlassHover: "rgba(255,255,255,0.06)",
        bgInput: "rgba(255,255,255,0.03)",
        borderSubtle: "rgba(255,255,255,0.08)",
        borderMedium: "rgba(255,255,255,0.12)",
        borderFocus: "rgba(255,255,255,0.4)",
        textPrimary: "#ededed",
        textSecondary: "#a1a1aa",
        textMuted: "#71717a",
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%)",
        "gradient-button": "linear-gradient(135deg, #ffffff 0%, #dbeafe 100%)",
        "gradient-button-hover": "linear-gradient(135deg, #ffffff 0%, #bfdbfe 100%)",
        "gradient-surface": "linear-gradient(180deg, rgba(15,23,42,0.9) 0%, rgba(10,10,10,0.95) 100%)",
      },
      boxShadow: {
        glow: "0 0 20px rgba(59, 130, 246, 0.15)",
        blue: "0 18px 40px rgba(59, 130, 246, 0.18)",
        card: "0 24px 80px rgba(2, 6, 23, 0.58)",
        "glass-inner": "inset 0 1px 0 rgba(255,255,255,0.06)",
        sm: "0 2px 8px rgba(0,0,0,0.4)",
        md: "0 8px 32px rgba(0,0,0,0.48)",
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "20px",
        pill: "9999px",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        spin: {
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2s infinite ease-in-out",
        spin: "spin 0.8s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
