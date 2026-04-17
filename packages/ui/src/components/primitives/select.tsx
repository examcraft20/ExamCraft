import * as React from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  options: SelectOption[];
  required?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  hint,
  leftIcon,
  options,
  required,
  id,
  className = "",
  ...props
}, ref) => {
  const selectId = id ?? `ec-select-${label?.toLowerCase().replace(/\s+/g, "-") ?? Math.random()}`;

  return (
    <div className="flex flex-col gap-2 w-full">
      {label ? (
        <label
          htmlFor={selectId}
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

        <select
          ref={ref}
          id={selectId}
          required={required}
          className={`
            w-full rounded-lg bg-bgInput text-textPrimary font-inherit outline-none appearance-none
            min-h-[52px] text-[0.95rem] transition-all duration-150 ease-in-out shadow-sm
            focus:bg-bgSurfaceHover focus:border-borderFocus focus:ring-[3px] focus:ring-brandAccent/15 focus:shadow-sm
            ${error ? "border-red-500" : "border-borderSubtle hover:border-borderMedium"}
            ${leftIcon ? "pl-[42px] pr-11" : "pl-4 pr-11"}
            ${className}
          `.trim().replace(/\s+/g, " ")}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          aria-hidden="true"
          size={16}
          className="absolute right-4 text-textMuted pointer-events-none"
        />
      </div>

      {error ? <p className="m-0 text-[0.8125rem] text-red-500">{error}</p> : null}
      {hint && !error ? <p className="m-0 text-[0.8125rem] text-textMuted">{hint}</p> : null}
    </div>
  );
});

Select.displayName = "Select";
