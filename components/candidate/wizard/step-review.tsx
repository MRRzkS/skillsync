"use client";

import { CvPreview } from "@/components/candidate/cv-preview";
import type { CvData } from "@/lib/candidate/cv-schema";
import type { WizardData } from "@/components/candidate/wizard/types";
import { Pencil, AlertTriangle } from "lucide-react";

function SummaryRow({
  title,
  onEdit,
  children,
}: {
  title: string;
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
        <Pencil className="h-3.5 w-3.5" /> Edit
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
  return (
    <div>
      <h2 className="font-candidate-heading text-xl font-bold text-text-dark">Review your CV</h2>
      <p className="mt-1.5 text-sm text-text-gray">
        Double-check everything below, then generate your CV.
      </p>

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
        <SummaryRow title="Personal Information" onEdit={() => onEditStep(0)}>
          <p className="font-medium">{wizard.personal.fullName || "—"}</p>
          {wizard.personal.desiredTitle && (
            <p className="text-text-gray">{wizard.personal.desiredTitle}</p>
          )}
          <p className="text-text-gray">{wizard.personal.email || "—"}</p>
        </SummaryRow>

        <SummaryRow title="Professional Profile" onEdit={() => onEditStep(1)}>
          {wizard.summary ? (
            <p className="line-clamp-2 text-text-dark/90">{wizard.summary}</p>
          ) : (
            <p className="text-text-gray">No summary added yet.</p>
          )}
        </SummaryRow>

        <SummaryRow title="Experience" onEdit={() => onEditStep(2)}>
          {wizard.noExperience ? (
            <p className="text-text-gray">No work experience yet.</p>
          ) : (
            <p>
              {wizard.experience.length} experience{wizard.experience.length === 1 ? "" : "s"}{" "}
              added
            </p>
          )}
        </SummaryRow>

        <SummaryRow title="Education" onEdit={() => onEditStep(3)}>
          <p>
            {wizard.education.length} education{wizard.education.length === 1 ? "" : "s"} added
          </p>
        </SummaryRow>

        <SummaryRow title="Skills" onEdit={() => onEditStep(4)}>
          {wizard.skills.length > 0 ? (
            <p className="text-text-dark/90">{wizard.skills.join(", ")}</p>
          ) : (
            <p className="text-text-gray">No skills added yet.</p>
          )}
        </SummaryRow>
      </div>

      <div className="mt-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ocean-700">
          Full CV Preview
        </p>
        <CvPreview cv={cv} warnings={[]} />
      </div>
    </div>
  );
}
