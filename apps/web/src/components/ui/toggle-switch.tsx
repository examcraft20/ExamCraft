"use client";

import { useState } from "react";

type ToggleSwitchProps = {
  enabled: boolean;
  onChange: (enabled: boolean) => void | Promise<void>;
  disabled?: boolean;
};

export function ToggleSwitch({ enabled, onChange, disabled = false }: ToggleSwitchProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (disabled || isLoading) return;
    setIsLoading(true);
    try {
      await onChange(!enabled);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={disabled || isLoading}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
        enabled ? "bg-indigo-500" : "bg-slate-600"
      } ${disabled || isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:opacity-90"}`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
