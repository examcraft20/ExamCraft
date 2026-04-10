"use client";

import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3;
}

const steps = [
  { number: 1, label: "Institution" },
  { number: 2, label: "Academic Setup" },
  { number: 3, label: "Invite Team" }
];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center gap-2">
          {/* Circle */}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
              step.number < currentStep
                ? "bg-indigo-500 border border-indigo-400 text-white"
                : step.number === currentStep
                  ? "bg-transparent border-2 border-indigo-500 text-indigo-400"
                  : "bg-slate-700 border border-slate-600 text-slate-400"
            }`}
          >
            {step.number < currentStep ? (
              <Check size={18} strokeWidth={3} />
            ) : (
              step.number
            )}
          </div>

          {/* Label */}
          <span
            className={`text-xs font-semibold uppercase tracking-wide hidden sm:inline ${
              step.number <= currentStep ? "text-indigo-400" : "text-slate-500"
            }`}
          >
            {step.label}
          </span>

          {/* Connector line */}
          {index < steps.length - 1 && (
            <div
              className={`w-8 h-0.5 mx-1 transition-all ${
                step.number < currentStep ? "bg-indigo-500" : "bg-slate-700"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
