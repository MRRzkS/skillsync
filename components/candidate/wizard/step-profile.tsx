"use client";

import { useState } from "react";
import { Textarea } from "@/components/candidate/ui/textarea";
import { Label } from "@/components/candidate/ui/label";
import { Button } from "@/components/candidate/ui/button";
import { useTranslation } from "@/lib/i18n";
import type { WizardData } from "@/components/candidate/wizard/types";
import { Sparkles, Loader2, AlertTriangle } from "lucide-react";

// Heading/subtitle live above the card now — see cv-wizard.tsx.
export function StepProfile({
  data,
  onChange,
}: {
  data: WizardData;
  onChange: (summary: string) => void;
}) {
  const { t } = useTranslation();
  const [isImproving, setIsImproving] = useState(false);
  const [improveError, setImproveError] = useState<string | null>(null);

  async function handleImproveWithAi() {
    if (data.summary.trim().length < 10) {
      setImproveError(t("candidate.form.improveNeedsText"));
      return;
    }
    setIsImproving(true);
    setImproveError(null);
    try {
      const res = await fetch("/api/candidate/improve-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: data.summary,
          context: {
            title: data.personal.desiredTitle,
            topSkills: data.skills.slice(0, 8),
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || t("candidate.form.improveFailed"));
      }
      onChange(json.summary);
    } catch (err) {
      setImproveError(
        err instanceof Error ? err.message : t("candidate.form.unexpectedError")
      );
    } finally {
      setIsImproving(false);
    }
  }

  return (
    <div>
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <Label htmlFor="summary">{t("candidate.form.summary")}</Label>
          <span className="text-xs text-text-gray">
            {t("candidate.form.summaryCount", { count: data.summary.length })}
          </span>
        </div>
        <p className="mb-2 text-xs text-text-gray">{t("candidate.form.summaryHint")}</p>
        <Textarea
          id="summary"
          className="min-h-[180px] resize-none text-sm leading-relaxed"
          placeholder={t("candidate.form.summaryPlaceholder")}
          value={data.summary}
          onChange={(e) => onChange(e.target.value)}
        />

        <div className="mt-3 flex items-center gap-3">
          <Button
            type="button"
            variant="outline-soft"
            size="sm"
            onClick={handleImproveWithAi}
            disabled={isImproving}
            className="gap-2"
          >
            {isImproving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />{" "}
                {t("candidate.form.improving")}
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" /> {t("candidate.form.improve")}
              </>
            )}
          </Button>
        </div>

        {improveError && (
          <p className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {improveError}
          </p>
        )}
      </div>
    </div>
  );
}
