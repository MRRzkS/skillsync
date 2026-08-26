"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

// The UI team's reference (design-handoff/UI_SkillSync/kandidat_*.png) puts the
// CV builder's steps in the app sidebar, not inside the form card. The sidebar
// lives in the layout and the wizard lives in the page, so the step cursor is
// held here — one level above both — instead of inside <CvWizard>.
//
// It deliberately holds only the *cursor* (which step is showing, how far the
// user got). All CV form state stays inside <CvWizard>, so nothing the
// Candidate team owns had to move.

export const WIZARD_STEP_KEYS = [
  "personal",
  "profile",
  "experience",
  "education",
  "skills",
  "review",
] as const;

export type WizardNav = {
  currentStep: number;
  furthestStep: number;
  /**
   * Bumped on every goToStep() call. The builder watches this so a sidebar
   * click can pull it out of the "CV is ready" screen even when the step
   * number itself didn't change.
   */
  navTick: number;
  goToStep: (step: number) => void;
  resetSteps: () => void;
};

const WizardNavContext = createContext<WizardNav | null>(null);

export function WizardNavProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [furthestStep, setFurthestStep] = useState(0);
  const [navTick, setNavTick] = useState(0);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
    setFurthestStep((f) => Math.max(f, step));
    setNavTick((n) => n + 1);
  }, []);

  const resetSteps = useCallback(() => {
    setCurrentStep(0);
    setFurthestStep(0);
  }, []);

  const value = useMemo(
    () => ({ currentStep, furthestStep, navTick, goToStep, resetSteps }),
    [currentStep, furthestStep, navTick, goToStep, resetSteps]
  );

  return <WizardNavContext.Provider value={value}>{children}</WizardNavContext.Provider>;
}

export function useWizardNav(): WizardNav {
  const ctx = useContext(WizardNavContext);
  if (!ctx) {
    throw new Error("useWizardNav must be used inside <WizardNavProvider>");
  }
  return ctx;
}
