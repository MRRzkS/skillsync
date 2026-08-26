"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { WIZARD_STEP_KEYS } from "@/components/candidate/layout/wizard-nav";
import { useTranslation } from "@/lib/i18n";

// Step labels come from the shared i18n dictionaries (candidate.steps.*) so
// this row and the sidebar always read the same, in either language.

export function StepIndicator({
  currentStep,
  furthestStep,
  onStepClick,
}: {
  currentStep: number;
  furthestStep: number;
  onStepClick: (step: number) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="w-full overflow-x-auto thin-scrollbar">
      <ol className="flex min-w-max items-center gap-1 sm:gap-2">
        {WIZARD_STEP_KEYS.map((key, i) => {
          const label = t(`candidate.steps.${key}`);
          const isDone = i < currentStep;
          const isCurrent = i === currentStep;
          const isReachable = i <= furthestStep;

          return (
            <li key={key} className="flex items-center">
              <button
                type="button"
                disabled={!isReachable}
                onClick={() => isReachable && onStepClick(i)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm",
                  isCurrent
                    ? "bg-white text-text-dark shadow-card"
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
                      ? "text-white"
                      : isDone
                      ? "bg-mint-600 text-white"
                      : "bg-white text-text-gray"
                  )}
                  // Amber marks "you are here", per the UI team's reference.
                  style={isCurrent ? { backgroundColor: "#F57C00" } : undefined}
                >
                  {isDone ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </button>
              {i < WIZARD_STEP_KEYS.length - 1 && (
                <span className="mx-1 h-px w-3 shrink-0 bg-ocean-100 sm:w-6" />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
