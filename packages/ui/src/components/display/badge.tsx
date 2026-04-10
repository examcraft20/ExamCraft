import * as React from "react";

export type BadgeVariant = "brand" | "success" | "warning" | "danger" | "neutral" | "cyan";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
}

const variantMap: Record<BadgeVariant, { container: string; dot: string }> = {
  brand: {
    container: "border-borderSubtle bg-bgGlass text-textPrimary",
    dot: "bg-white"
  },
  success: {
    container: "border border-green-500/20 bg-green-500/10 text-green-300",
    dot: "bg-green-400"
  },
  warning: {
    container: "border border-amber-500/20 bg-amber-500/10 text-amber-200",
    dot: "bg-amber-400"
  },
  danger: {
    container: "border border-red-500/20 bg-red-500/10 text-red-300",
    dot: "bg-red-400"
  },
  neutral: {
    container: "border-borderSubtle bg-bgGlass text-textSecondary",
    dot: "bg-textMuted"
  },
  cyan: {
    container: "border border-cyan-500/20 bg-cyan-500/10 text-cyan-200",
    dot: "bg-cyan-400"
  }
};

export function Badge({ variant = "brand", children, dot = false, className = "", ...props }: BadgeProps) {
  const selected = variantMap[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold tracking-[0.04em] ${selected.container} ${className}`.trim()}
      {...props}
    >
      {dot ? <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${selected.dot}`} /> : null}
      {children}
    </span>
  );
}
