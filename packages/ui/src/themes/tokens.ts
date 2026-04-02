/**
 * ExamCraft Design Tokens - packages/ui/src/themes/tokens.ts
 */

export const color = {
  brandPrimary: "#ffffff",
  brandSecondary: "#a1a1aa",
  brandAccent: "#3b82f6",
  gradientStart: "#ffffff",
  gradientEnd: "#a1a1aa",
  gradientWarmEnd: "#3b82f6",
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
  textBrand: "#ffffff",
  success: "#22c55e",
  successText: "#86efac",
  error: "#ef4444",
  errorText: "#fca5a5",
  warning: "#f59e0b",
  warningText: "#fde68a",
  info: "#3b82f6",
  infoText: "#93c5fd",
  cyan: "#06b6d4",
  cyanText: "#67e8f9"
} as const;

export const font = {
  body: `"Inter", "Segoe UI", system-ui, sans-serif`,
  display: `"Plus Jakarta Sans", "Inter", sans-serif`,
  xs: "0.75rem",
  sm: "0.875rem",
  base: "1rem",
  md: "1.125rem",
  lg: "1.25rem",
  xl: "1.5rem",
  "2xl": "2rem",
  "3xl": "2.5rem",
  "4xl": "3rem",
  hero: "clamp(3rem, 8vw, 6.5rem)",
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900
} as const;

export const radius = {
  sm: "6px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  pill: "9999px",
  full: "50%"
} as const;

export const shadow = {
  sm: "0 10px 24px rgba(0, 0, 0, 0.22)",
  md: "0 18px 50px rgba(0, 0, 0, 0.4)",
  lg: "0 24px 80px rgba(2, 6, 23, 0.58)",
  blue: "0 18px 40px rgba(59, 130, 246, 0.18)",
  brand: "0 0 30px rgba(255,255,255,0.05)",
  glow: "0 0 20px rgba(59, 130, 246, 0.15)",
  glowCyan: "0 0 16px rgba(6,182,212,0.3)"
} as const;

export const space = {
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
  20: "80px"
} as const;

export const transition = {
  fast: "150ms ease",
  base: "250ms ease",
  slow: "400ms ease"
} as const;

export const breakpoint = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px"
} as const;

export const zIndex = {
  base: 0,
  raised: 10,
  dropdown: 50,
  sticky: 100,
  overlay: 200,
  modal: 300,
  toast: 400
} as const;

export const gradient = {
  brand: `linear-gradient(135deg, ${color.gradientStart} 0%, ${color.gradientEnd} 100%)`,
  warm: `linear-gradient(135deg, ${color.gradientStart} 0%, ${color.gradientWarmEnd} 100%)`,
  darkBg: "var(--bg-base)",
  authSide: "#000000"
} as const;
