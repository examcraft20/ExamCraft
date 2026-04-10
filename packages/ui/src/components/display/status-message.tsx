import * as React from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";

export type StatusVariant = "success" | "error" | "warning" | "info";

export interface StatusMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  variant: StatusVariant;
  children: React.ReactNode;
}

const variantMap: Record<StatusVariant, { container: string; icon: React.ReactNode }> = {
  success: {
    container: "border border-green-500/20 bg-green-500/5 text-green-300",
    icon: <CheckCircle2 size={16} />
  },
  error: {
    container: "border border-red-500/20 bg-red-500/5 text-red-300",
    icon: <AlertCircle size={16} />
  },
  warning: {
    container: "border border-amber-500/20 bg-amber-500/5 text-amber-200",
    icon: <TriangleAlert size={16} />
  },
  info: {
    container: "border border-borderSubtle bg-bgGlass text-textPrimary",
    icon: <Info size={16} />
  }
};

export function StatusMessage({
  variant,
  children,
  className = "",
  ...props
}: StatusMessageProps) {
  const selected = variantMap[variant];

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-md px-4 py-4 text-sm leading-6 ${selected.container} ${className}`.trim()}
      {...props}
    >
      <span className="mt-0.5 inline-flex shrink-0">{selected.icon}</span>
      <span>{children}</span>
    </div>
  );
}
