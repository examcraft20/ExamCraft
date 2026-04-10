import * as React from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm rounded-md",
  md: "px-5 py-3 text-[0.9375rem] rounded-md",
  lg: "px-6 py-3.5 text-base rounded-md",
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-brandPrimary text-black border border-white/40 shadow-sm hover:!bg-gradient-button-hover hover:shadow-blue hover:border-transparent",
  secondary: "bg-transparent text-textPrimary border border-borderMedium hover:bg-bgGlassHover hover:shadow-sm",
  ghost: "bg-transparent text-textSecondary border-transparent hover:text-textPrimary hover:bg-bgGlass",
  danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/15",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className = "",
  ...props
}, ref) => {
  const isDisabled = disabled || loading;

  const baseClasses = "inline-flex items-center justify-center gap-2 font-medium font-inherit whitespace-nowrap transition-all duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-brandAccent focus-visible:ring-offset-2 focus-visible:ring-offset-bgSurface";
  const disabledClasses = isDisabled ? "opacity-50 cursor-not-allowed hover:!shadow-none hover:transform-none" : "cursor-pointer";
  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses} ${widthClass} ${className}`.trim()}
      {...props}
    >
      {loading ? <Loader2 className="animate-spin" size={16} /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
});

Button.displayName = "Button";
