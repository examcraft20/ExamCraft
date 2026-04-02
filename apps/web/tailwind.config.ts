import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
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
      },
      boxShadow: {
        glow: "0 0 20px rgba(59, 130, 246, 0.15)",
        blue: "0 18px 40px rgba(59, 130, 246, 0.18)",
        card: "0 24px 80px rgba(2, 6, 23, 0.58)",
      }
    },
  },
  plugins: [],
};
export default config;
