import * as React from "react";

export type InputSize = "sm" | "md" | "lg";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  inputSize?: InputSize;
  required?: boolean;
}

const sizeClasses: Record<InputSize, { container: string; input: string }> = {
  sm: { container: "text-sm", input: "py-2 px-3 text-sm" },
  md: { container: "text-[0.9375rem]", input: "py-3 px-4 text-[0.9375rem]" },
  lg: { container: "text-base", input: "py-3.5 px-5 text-base" }
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  leftIcon,
  inputSize = "md",
  required,
  id,
  className = "",
  ...props
}, ref) => {
  const inputId = id ?? `ec-input-${label?.toLowerCase().replace(/\s+/g, "-") ?? Math.random()}`;
  const sizeConfig = sizeClasses[inputSize];

  return (
    <div className="flex flex-col gap-2 w-full">
      {label ? (
        <label
          htmlFor={inputId}
          className="flex items-center gap-1 text-sm font-semibold text-textPrimary"
        >
          {label}
          {required ? <span className="text-red-500 text-[1.1em] leading-none">*</span> : null}
        </label>
      ) : null}

      <div className="relative flex items-center">
        {leftIcon ? (
          <div className="absolute left-3.5 text-textMuted pointer-events-none flex items-center justify-center">
            {leftIcon}
          </div>
        ) : null}
        
        <input
          ref={ref}
          id={inputId}
          required={required}
          className={`
            w-full rounded-lg bg-bgInput text-textPrimary font-inherit outline-none 
            min-h-[52px] transition-all duration-150 ease-in-out shadow-sm
            focus:bg-bgSurfaceHover focus:border-borderFocus focus:ring-[3px] focus:ring-brandAccent/15 focus:shadow-sm
            ${error ? "border-red-500" : "border-borderSubtle hover:border-borderMedium"}
            ${leftIcon ? "pl-[42px]" : ""}
            ${sizeConfig.input}
            ${className}
          `.trim().replace(/\s+/g, " ")}
          {...props}
        />
      </div>

      {error ? <p className="m-0 text-[0.8125rem] text-red-500">{error}</p> : null}
      {hint && !error ? <p className="m-0 text-[0.8125rem] text-textMuted">{hint}</p> : null}
    </div>
  );
});

Input.displayName = "Input";
