"use client";

import { CvPreview } from "@/components/candidate/cv-preview";
import type { CvData } from "@/lib/candidate/cv-schema";
import type { WizardData } from "@/components/candidate/wizard/types";
import { useTranslation } from "@/lib/i18n";
import { Pencil, AlertTriangle } from "lucide-react";

function SummaryRow({
  title,
  editLabel,
  onEdit,
  children,
}: {
  title: string;
  editLabel: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-ocean-100/70 py-4 last:border-0">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ocean-700">{title}</p>
        <div className="mt-1 text-sm text-text-dark">{children}</div>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="flex shrink-0 items-center gap-1 text-xs font-medium text-sync-purple-600 hover:text-sync-purple-700"
      >
        <Pencil className="h-3.5 w-3.5" /> {editLabel}
      </button>
    </div>
  );
}

export function StepReview({
  wizard,
  cv,
  validationIssues,
  onEditStep,
}: {
  wizard: WizardData;
  cv: CvData;
  validationIssues: string[];
  onEditStep: (step: number) => void;
}) {
  const { t } = useTranslation();
  const edit = t("candidate.form.edit");

  return (
    <div>
      {/* Heading/subtitle live above the card now — see cv-wizard.tsx. */}

      {validationIssues.length > 0 && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <ul className="space-y-0.5">
            {validationIssues.map((msg) => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5 rounded-xl border border-ocean-100/70 bg-white p-5 shadow-card">
        <SummaryRow
          title={t("candidate.form.personalInfo")}
          editLabel={edit}
          onEdit={() => onEditStep(0)}
        >
          <p className="font-medium">{wizard.personal.fullName || "—"}</p>
          {wizard.personal.desiredTitle && (
            <p className="text-text-gray">{wizard.personal.desiredTitle}</p>
          )}
          <p className="text-text-gray">{wizard.personal.email || "—"}</p>
        </SummaryRow>

        <SummaryRow
          title={t("candidate.form.professionalProfile")}
          editLabel={edit}
          onEdit={() => onEditStep(1)}
        >
          {wizard.summary ? (
            <p className="line-clamp-2 text-text-dark/90">{wizard.summary}</p>
          ) : (
            <p className="text-text-gray">{t("candidate.form.noSummary")}</p>
          )}
        </SummaryRow>

        <SummaryRow
          title={t("candidate.steps.experience")}
          editLabel={edit}
          onEdit={() => onEditStep(2)}
        >
          {wizard.noExperience ? (
            <p className="text-text-gray">{t("candidate.form.noWorkExperience")}</p>
          ) : (
            <p>
              {t("candidate.form.experienceAdded", { count: wizard.experience.length })}
            </p>
          )}
        </SummaryRow>

        <SummaryRow
          title={t("candidate.steps.education")}
          editLabel={edit}
          onEdit={() => onEditStep(3)}
        >
          <p>{t("candidate.form.educationAdded", { count: wizard.education.length })}</p>
        </SummaryRow>

        <SummaryRow
          title={t("candidate.steps.skills")}
          editLabel={edit}
          onEdit={() => onEditStep(4)}
        >
          {wizard.skills.length > 0 ? (
            <p className="text-text-dark/90">{wizard.skills.join(", ")}</p>
          ) : (
            <p className="text-text-gray">{t("candidate.form.noSkills")}</p>
          )}
        </SummaryRow>
      </div>

      <div className="mt-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ocean-700">
          {t("candidate.form.fullPreview")}
        </p>
        <CvPreview cv={cv} warnings={[]} />
      </div>
    </div>
  );
}
