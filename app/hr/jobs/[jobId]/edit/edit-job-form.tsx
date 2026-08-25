"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import EnhanceJdButton from "@/components/enhance-jd-button";
import PageHeader from "@/components/page-header";
import { useTranslation } from "@/lib/i18n";
import { useElapsedSeconds } from "@/lib/use-elapsed-seconds";

// Kept in sync with app/hr/new-job/page.tsx's MIN_JD_LENGTH.
const MIN_JD_LENGTH = 40;

export default function EditJobForm({
  job,
}: {
  job: { id: string; title: string; jd_text: string };
}) {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [title, setTitle] = useState(job.title);
  const [jdText, setJdText] = useState(job.jd_text);
  const [regenerate, setRegenerate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const elapsedSeconds = useElapsedSeconds(isSaving);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!title.trim() || !jdText.trim()) {
      setError(t("newJob.errorRequired"));
      return;
    }
    if (jdText.trim().length < MIN_JD_LENGTH) {
      setError(t("newJob.errorTooShort", { count: MIN_JD_LENGTH }));
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/hr/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, jd_text: jdText, regenerate, locale }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? t("editJob.errorSave"));
        return;
      }
      router.push(`/hr/dashboard/${job.id}`);
      router.refresh();
    } catch {
      setError(t("editJob.errorSave"));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6 md:p-10">
      <PageHeader title={t("editJob.title")} subtitle={t("editJob.subtitle")} />

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">{t("newJob.jobTitleLabel")}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSaving}
              placeholder={t("newJob.jobTitlePlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="jd_text">{t("newJob.jdLabel")}</Label>
              <EnhanceJdButton
                title={title}
                jdText={jdText}
                onEnhanced={setJdText}
                disabled={isSaving}
              />
            </div>
            <Textarea
              id="jd_text"
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              disabled={isSaving}
              rows={10}
              placeholder={t("newJob.jdPlaceholder")}
            />
            <p className="text-xs text-muted-foreground">
              {t("newJob.enhanceHint")}
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={regenerate}
              onChange={(e) => setRegenerate(e.target.checked)}
              disabled={isSaving}
              className="h-4 w-4 rounded border-input"
            />
            {t("editJob.regenerate")}
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-md border border-border bg-muted px-3 py-2 text-sm"
            >
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={isSaving}>
              {isSaving
                ? t("editJob.saving", { seconds: elapsedSeconds })
                : t("editJob.save")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={isSaving}
              onClick={() => router.back()}
            >
              {t("common.back")}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
