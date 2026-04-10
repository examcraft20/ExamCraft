import * as React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Extra padding variant */
  padding?: "sm" | "md" | "lg";
  /** Hover lift effect */
  hoverable?: boolean;
  /** Optional persistent glow border */
  glow?: boolean;
}

const paddingMap = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({
  children,
  padding = "md",
  hoverable = false,
  glow = false,
  className = "",
  ...props
}: CardProps) {
  const baseClasses = "bg-gradient-to-b from-[#0f172a]/90 to-[#0a0a0a]/95 backdrop-blur-[18px] backdrop-saturate-[1.6] rounded-xl border transition-all duration-[250ms] ease-in-out";
  const paddingClass = paddingMap[padding];
  
  const borderClass = glow ? "border-borderMedium" : "border-borderSubtle";
  const shadowClass = glow ? "shadow-card ring-1 ring-white/5" : "shadow-md shadow-black/40 ring-1 ring-white/5 ring-inset";
  
  const hoverClasses = hoverable 
    ? "hover:-translate-y-[2px] hover:border-borderMedium hover:shadow-card hover:ring-white/5" 
    : "";

  return (
    <div
      className={`${baseClasses} ${paddingClass} ${borderClass} ${shadowClass} ${hoverClasses} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
