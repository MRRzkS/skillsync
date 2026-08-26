"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/candidate/ui/button";
import { Badge } from "@/components/candidate/ui/badge";
import { CvPreview } from "@/components/candidate/cv-preview";
import { StepIndicator } from "@/components/candidate/wizard/step-indicator";
import { StepPersonal } from "@/components/candidate/wizard/step-personal";
import { StepProfile } from "@/components/candidate/wizard/step-profile";
import { StepExperience } from "@/components/candidate/wizard/step-experience";
import { StepEducation } from "@/components/candidate/wizard/step-education";
import { StepSkills } from "@/components/candidate/wizard/step-skills";
import { StepReview } from "@/components/candidate/wizard/step-review";
import {
  createEmptyWizardData,
  cvDataToWizardData,
  wizardToCvData,
  validateWizardCv,
  isValidEmail,
  type WizardData,
} from "@/components/candidate/wizard/types";
import { WIZARD_STEP_KEYS, useWizardNav } from "@/components/candidate/layout/wizard-nav";
import { useTranslation } from "@/lib/i18n";
import type { CvData } from "@/lib/candidate/cv-schema";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Download,
  RefreshCcw,
  CheckCircle2,
  Pencil,
  Sparkles,
  FileText,
  AlertTriangle,
  Mail,
  MapPin,
  Briefcase,
} from "lucide-react";

const TOTAL_STEPS = 6; // Personal, Profile, Experience, Education, Skills, Review

type SaveStatus = "idle" | "saving" | "done" | "error";

function slugifyName(name: string) {
  const cleaned = name
    .trim()
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return cleaned.length > 0 ? cleaned : "Candidate";
}

function MiniPreview({ wizard }: { wizard: WizardData }) {
  const { t } = useTranslation();
  return (
    <div className="sticky top-8 hidden rounded-2xl border border-ocean-100/70 bg-white p-5 shadow-card lg:block">
      <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ocean-700">
        <FileText className="h-3.5 w-3.5" /> {t("candidate.wizard.livePreview")}
      </p>
      <p className="font-candidate-heading text-lg font-bold text-text-dark">
        {wizard.personal.fullName || t("candidate.wizard.yourName")}
      </p>
      {wizard.personal.desiredTitle && (
        <p className="text-sm font-medium text-sync-purple-600">{wizard.personal.desiredTitle}</p>
      )}
      <div className="mt-2 space-y-1 text-xs text-text-gray">
        {wizard.personal.email && (
          <p className="flex items-center gap-1.5">
            <Mail className="h-3 w-3" /> {wizard.personal.email}
          </p>
        )}
        {wizard.personal.location && (
          <p className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3" /> {wizard.personal.location}
          </p>
        )}
      </div>

      {wizard.summary && (
        <p className="mt-4 line-clamp-3 text-xs leading-relaxed text-text-dark/80">
          {wizard.summary}
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-lg bg-ocean-50/60 py-2">
          <p className="font-candidate-heading text-base font-bold text-ocean-700">
            {wizard.noExperience ? 0 : wizard.experience.length}
          </p>
          <p className="text-[10px] uppercase tracking-wide text-text-gray">
            {t("candidate.wizard.countExperience")}
          </p>
        </div>
        <div className="rounded-lg bg-sync-purple-50 py-2">
          <p className="font-candidate-heading text-base font-bold text-sync-purple-700">
            {wizard.education.length}
          </p>
          <p className="text-[10px] uppercase tracking-wide text-text-gray">
            {t("candidate.wizard.countEducation")}
          </p>
        </div>
      </div>

      {wizard.skills.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {wizard.skills.slice(0, 6).map((s) => (
            <Badge key={s} variant="ocean" className="text-[10px]">
              {s}
            </Badge>
          ))}
          {wizard.skills.length > 6 && (
            <Badge variant="outline-soft" className="text-[10px]">
              +{wizard.skills.length - 6}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

export function CvWizard({ initialCv = null }: { initialCv?: CvData | null }) {
  const router = useRouter();
  const [wizard, setWizard] = useState<WizardData>(() =>
    initialCv ? cvDataToWizardData(initialCv) : createEmptyWizardData()
  );
  const { t } = useTranslation();
  // The step cursor lives one level up, in the layout, so the sidebar can
  // render the steps — see components/candidate/layout/wizard-nav.tsx.
  const { currentStep, furthestStep, navTick, goToStep, resetSteps } = useWizardNav();
  const [personalTouched, setPersonalTouched] = useState(false);

  // Reopening the builder with an already-saved CV lands straight on the
  // "ready" screen instead of an empty form — nothing was actually lost,
  // the wizard just never checked for existing data before.
  const [phase, setPhase] = useState<"form" | "success">(initialCv ? "success" : "form");
  const [cv, setCv] = useState<CvData | null>(initialCv);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);
  const [saveWarning, setSaveWarning] = useState<string | null>(null);

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const liveCv = useMemo(() => wizardToCvData(wizard), [wizard]);
  const validation = useMemo(() => validateWizardCv(wizard), [wizard]);
  const validationIssues = validation.success
    ? []
    : validation.error.issues.map((i) => i.message);

  const isPersonalValid =
    wizard.personal.fullName.trim().length > 0 && isValidEmail(wizard.personal.email);

  function handleContinue() {
    if (currentStep === 0) {
      setPersonalTouched(true);
      if (!isPersonalValid) return;
    }
    if (currentStep < TOTAL_STEPS - 1) {
      goToStep(currentStep + 1);
    }
  }

  function handleBack() {
    if (currentStep > 0) goToStep(currentStep - 1);
  }

  async function handleSaveAndGenerate() {
    if (!validation.success) return;

    setSaveStatus("saving");
    setSaveErrorMsg(null);
    setSaveWarning(null);

    try {
      const res = await fetch("/api/candidate/save-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv: validation.data }),
      });
      const json = await res.json();

      // Same "parsed ok but save failed" contract used elsewhere in this app.
      if (res.status === 502 && json.cv) {
        setCv(json.cv);
        setSaveWarning(json.error || "CV generated successfully, but we couldn't save it.");
        setSaveStatus("done");
        setPhase("success");
        return;
      }

      if (!res.ok) {
        throw new Error(json.error || "Something went wrong while saving your CV.");
      }

      setCv(json.cv);
      setSaveStatus("done");
      setPhase("success");
    } catch (err) {
      setSaveErrorMsg(err instanceof Error ? err.message : "Unexpected error.");
      setSaveStatus("error");
    }
  }

  async function handleDownloadPdf() {
    if (!cv) return;
    setIsDownloading(true);
    setDownloadError(null);
    try {
      // Both must stay dynamic imports, never a static top-level import of
      // cv-pdf.tsx: @react-pdf/renderer isn't safe to include in the
      // server/RSC module graph at all (Next tries to resolve it during
      // SSR/prerender since this file is otherwise statically imported by
      // the page, and its exports come back undefined there) — it can only
      // run client-side, triggered by this click handler.
      const [{ pdf }, { CvPdfDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/candidate/cv-pdf"),
      ]);
      const blob = await pdf(<CvPdfDocument cv={cv} />).toBlob();
      const filename = `${slugifyName(cv.contact.fullName || "")}-CV.pdf`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
      setDownloadError(t("candidate.success.downloadError"));
    } finally {
      setIsDownloading(false);
    }
  }

  function handleGenerateAnother() {
    setWizard(createEmptyWizardData());
    resetSteps();
    setPersonalTouched(false);
    setPhase("form");
    setCv(null);
    setSaveStatus("idle");
    setSaveErrorMsg(null);
    setSaveWarning(null);
    setDownloadError(null);
  }

  function handleEditInformation() {
    setPhase("form");
    goToStep(0);
  }

  // A sidebar step click has to pull the builder out of the "CV is ready"
  // screen — including when it lands on the step that's already current,
  // which is why this watches the tick rather than currentStep.
  const lastNavTick = useRef(navTick);
  useEffect(() => {
    if (lastNavTick.current === navTick) return;
    lastNavTick.current = navTick;
    setPhase("form");
  }, [navTick]);

  if (phase === "success" && cv) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-ocean-100/60 bg-white p-6 shadow-card lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-mint-600" />
              <h2 className="font-candidate-heading text-lg font-bold text-text-dark">
                {t("candidate.success.title")}
              </h2>
            </div>
            <Badge variant="mint" className="gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> {t("candidate.success.atsReady")}
            </Badge>
          </div>

          {saveWarning && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {saveWarning}
            </div>
          )}

          <div className="mt-6">
            <CvPreview cv={cv} warnings={[]} />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-ocean-100/70 pt-5">
            <Button
              variant="ai"
              onClick={() => router.push("/candidate/cv-review")}
              className="gap-2"
            >
              <Briefcase className="h-4 w-4" /> {t("candidate.success.review")}
            </Button>
            <Button variant="outline-soft" onClick={handleDownloadPdf} disabled={isDownloading} className="gap-2">
              {isDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> {t("candidate.success.preparing")}
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" /> {t("candidate.success.download")}
                </>
              )}
            </Button>
            <Button variant="outline-soft" onClick={handleEditInformation} className="gap-2">
              <Pencil className="h-4 w-4" /> {t("candidate.success.edit")}
            </Button>
            <Button variant="ghost" onClick={handleGenerateAnother} className="gap-2">
              <RefreshCcw className="h-4 w-4" /> {t("candidate.success.another")}
            </Button>
          </div>

          {downloadError && (
            <p className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {downloadError}
            </p>
          )}
        </div>
      </div>
    );
  }

  const isReviewStep = currentStep === TOTAL_STEPS - 1;
  const stepKey = WIZARD_STEP_KEYS[currentStep] ?? WIZARD_STEP_KEYS[0];

  return (
    <div>
      {/* Hero banner — navy→amber gradient, per the UI team's reference. */}
      <div
        className="rounded-2xl px-6 py-7 text-white shadow-card lg:px-8"
        style={{
          backgroundImage: "linear-gradient(105deg, #172033 0%, #0D47A1 45%, #E07B00 100%)",
        }}
      >
        <h1 className="flex items-center gap-2 font-candidate-heading text-2xl font-bold">
          {t("candidate.wizard.heroTitle")}
          <Sparkles className="h-5 w-5" aria-hidden />
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/85">
          {t("candidate.wizard.heroBody")}
        </p>
      </div>

      {/* Current step */}
      <h2 className="mt-8 font-candidate-heading text-3xl font-bold text-text-dark">
        {t(`candidate.steps.${stepKey}`)}
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-text-gray">
        {t(`candidate.stepIntro.${stepKey}`)}
      </p>

      {/* Progress */}
      <div className="mt-6">
        <StepIndicator
          currentStep={currentStep}
          furthestStep={furthestStep}
          onStepClick={(step) => goToStep(step)}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-ocean-100/60 bg-white p-6 shadow-card animate-fade-up lg:p-8">
          {currentStep === 0 && (
            <StepPersonal
              data={wizard}
              showErrors={personalTouched}
              onChange={(patch) =>
                setWizard((w) => ({ ...w, personal: { ...w.personal, ...patch } }))
              }
            />
          )}
          {currentStep === 1 && (
            <StepProfile
              data={wizard}
              onChange={(summary) => setWizard((w) => ({ ...w, summary }))}
            />
          )}
          {currentStep === 2 && (
            <StepExperience
              experience={wizard.experience}
              noExperience={wizard.noExperience}
              onChangeExperience={(experience) => setWizard((w) => ({ ...w, experience }))}
              onChangeNoExperience={(noExperience) =>
                setWizard((w) => ({ ...w, noExperience }))
              }
            />
          )}
          {currentStep === 3 && (
            <StepEducation
              education={wizard.education}
              onChange={(education) => setWizard((w) => ({ ...w, education }))}
            />
          )}
          {currentStep === 4 && (
            <StepSkills
              skills={wizard.skills}
              languages={wizard.languages}
              onChangeSkills={(skills) => setWizard((w) => ({ ...w, skills }))}
              onChangeLanguages={(languages) => setWizard((w) => ({ ...w, languages }))}
            />
          )}
          {isReviewStep && (
            <StepReview
              wizard={wizard}
              cv={liveCv}
              validationIssues={validationIssues}
              onEditStep={(step) => goToStep(step)}
            />
          )}

          {saveErrorMsg && saveStatus === "error" && (
            <p className="mt-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {saveErrorMsg}
            </p>
          )}

          {/* Nav buttons */}
          <div className="mt-8 flex items-center justify-between border-t border-ocean-100/70 pt-5">
            <Button
              type="button"
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> {t("candidate.wizard.back")}
            </Button>

            {isReviewStep ? (
              <Button
                type="button"
                variant="ai"
                onClick={handleSaveAndGenerate}
                disabled={saveStatus === "saving" || !validation.success}
                className="gap-2"
              >
                {saveStatus === "saving" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />{" "}
                    {t("candidate.wizard.saving")}
                  </>
                ) : (
                  <>
                    {t("candidate.wizard.save")} <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button type="button" variant="ai" onClick={handleContinue} className="gap-2">
                {t("candidate.wizard.continue")} <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {!isReviewStep && <MiniPreview wizard={wizard} />}
      </div>
    </div>
  );
}
