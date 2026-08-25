"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const STEP_LABELS = [
  "Personal",
  "Profile",
  "Experience",
  "Education",
  "Skills",
  "Review",
];

export function StepIndicator({
  currentStep,
  furthestStep,
  onStepClick,
}: {
  currentStep: number;
  furthestStep: number;
  onStepClick: (step: number) => void;
}) {
  return (
    <div className="w-full overflow-x-auto thin-scrollbar">
      <ol className="flex min-w-max items-center gap-1 sm:gap-2">
        {STEP_LABELS.map((label, i) => {
          const isDone = i < currentStep;
          const isCurrent = i === currentStep;
          const isReachable = i <= furthestStep;

          return (
            <li key={label} className="flex items-center">
              <button
                type="button"
                disabled={!isReachable}
                onClick={() => isReachable && onStepClick(i)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm",
                  isCurrent
                    ? "bg-gradient-to-r from-ocean-600 to-sync-purple-600 text-white shadow-card"
                    : isDone
                    ? "bg-ocean-50 text-ocean-700 hover:bg-ocean-100"
                    : isReachable
                    ? "bg-ocean-50/60 text-text-gray hover:bg-ocean-50"
                    : "cursor-not-allowed bg-ocean-50/30 text-text-gray/50"
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px]",
                    isCurrent
                      ? "bg-white/25 text-white"
                      : isDone
                      ? "bg-mint-600 text-white"
                      : "bg-white text-text-gray"
                  )}
                >
                  {isDone ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </button>
              {i < STEP_LABELS.length - 1 && (
                <span className="mx-1 h-px w-3 shrink-0 bg-ocean-100 sm:w-6" />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
