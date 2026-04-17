import * as React from "react";

export type TextareaSize = "sm" | "md" | "lg";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  inputSize?: TextareaSize;
  required?: boolean;
  /** Number of visible rows (default: 4) */
  rows?: number;
}

const sizeClasses: Record<TextareaSize, string> = {
  sm: "py-2 px-3 text-sm",
  md: "py-3 px-4 text-[0.9375rem]",
  lg: "py-3.5 px-5 text-base",
};

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>((
  {
    label,
    error,
    hint,
    leftIcon,
    inputSize = "md",
    required,
    id,
    rows = 4,
    className = "",
    ...props
  },
  ref
) => {
  const inputId = id ?? `ec-textarea-${label?.toLowerCase().replace(/\s+/g, "-") ?? Math.random()}`;

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

      <div className="relative flex">
        {leftIcon ? (
          <div className="absolute left-3.5 top-3.5 text-textMuted pointer-events-none flex items-center justify-center">
            {leftIcon}
          </div>
        ) : null}

        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          required={required}
          className={`
            w-full rounded-lg bg-bgInput text-textPrimary font-inherit outline-none resize-y
            transition-all duration-150 ease-in-out shadow-sm
            focus:bg-bgSurfaceHover focus:border-borderFocus focus:ring-[3px] focus:ring-brandAccent/15 focus:shadow-sm
            ${error ? "border border-red-500" : "border border-borderSubtle hover:border-borderMedium"}
            ${leftIcon ? "pl-[42px]" : ""}
            ${sizeClasses[inputSize]}
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

Textarea.displayName = "Textarea";
