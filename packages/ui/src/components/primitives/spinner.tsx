import * as React from "react";

export type SpinnerSize = "sm" | "md" | "lg";

export interface SpinnerProps {
  size?: SpinnerSize;
  colorClassName?: string;
  className?: string;
}

const sizeClassMap: Record<SpinnerSize, string> = {
  sm: "h-3.5 w-3.5 border-2",
  md: "h-5 w-5 border-2",
  lg: "h-7 w-7 border-[3px]"
};

export function Spinner({
  size = "md",
  colorClassName = "border-t-current",
  className = ""
}: SpinnerProps) {
  return (
    <span
      aria-label="Loading"
      role="status"
      className={`inline-block shrink-0 animate-spin rounded-full border-white/15 ${colorClassName} ${sizeClassMap[size]} ${className}`.trim()}
    />
  );
}
