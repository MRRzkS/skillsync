"use client";

import { Input } from "@/components/candidate/ui/input";
import { Label } from "@/components/candidate/ui/label";
import { useTranslation } from "@/lib/i18n";
import type { WizardData } from "@/components/candidate/wizard/types";
import { isValidEmail } from "@/components/candidate/wizard/types";

// The step's own heading/subtitle live above the card now (see cv-wizard.tsx),
// matching the UI team's reference — this renders fields only.
export function StepPersonal({
  data,
  onChange,
  showErrors,
}: {
  data: WizardData;
  onChange: (patch: Partial<WizardData["personal"]>) => void;
  showErrors: boolean;
}) {
  const { t } = useTranslation();
  const p = data.personal;
  const nameError =
    showErrors && !p.fullName.trim() ? t("candidate.form.fullNameRequired") : null;
  const emailError = showErrors
    ? !p.email.trim()
      ? t("candidate.form.emailRequired")
      : !isValidEmail(p.email)
      ? t("candidate.form.emailInvalid")
      : null
    : null;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <div>
        <Label htmlFor="fullName">{t("candidate.form.fullName")}</Label>
        <Input
          id="fullName"
          className="mt-1.5"
          placeholder={t("candidate.form.fullNamePlaceholder")}
          value={p.fullName}
          error={!!nameError}
          onChange={(e) => onChange({ fullName: e.target.value })}
        />
        {nameError && <p className="mt-1 text-xs text-red-600">{nameError}</p>}
      </div>

      <div>
        <Label htmlFor="desiredTitle">{t("candidate.form.desiredTitle")}</Label>
        <Input
          id="desiredTitle"
          className="mt-1.5"
          placeholder={t("candidate.form.desiredTitlePlaceholder")}
          value={p.desiredTitle}
          onChange={(e) => onChange({ desiredTitle: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="email">{t("candidate.form.email")}</Label>
        <Input
          id="email"
          type="email"
          className="mt-1.5"
          placeholder={t("candidate.form.emailPlaceholder")}
          value={p.email}
          error={!!emailError}
          onChange={(e) => onChange({ email: e.target.value })}
        />
        {emailError && <p className="mt-1 text-xs text-red-600">{emailError}</p>}
      </div>

      <div>
        <Label htmlFor="phone">{t("candidate.form.phone")}</Label>
        <Input
          id="phone"
          type="tel"
          className="mt-1.5"
          placeholder={t("candidate.form.phonePlaceholder")}
          value={p.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="location">{t("candidate.form.location")}</Label>
        <Input
          id="location"
          className="mt-1.5"
          placeholder={t("candidate.form.locationPlaceholder")}
          value={p.location}
          onChange={(e) => onChange({ location: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="linkedin">{t("candidate.form.linkedin")}</Label>
        <Input
          id="linkedin"
          className="mt-1.5"
          placeholder={t("candidate.form.linkedinPlaceholder")}
          value={p.linkedin}
          onChange={(e) => onChange({ linkedin: e.target.value })}
        />
      </div>

      <div className="sm:col-span-2">
        <Label htmlFor="portfolio">{t("candidate.form.portfolio")}</Label>
        <Input
          id="portfolio"
          className="mt-1.5"
          placeholder={t("candidate.form.portfolioPlaceholder")}
          value={p.portfolio}
          onChange={(e) => onChange({ portfolio: e.target.value })}
        />
      </div>
    </div>
  );
}
