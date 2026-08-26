"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useObject } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import EnhanceJdButton from "@/components/enhance-jd-button";
import PageHeader from "@/components/page-header";
import { scenarioQuestionsSchema } from "@/lib/ai/schemas";
import { useTranslation } from "@/lib/i18n";
import { useElapsedSeconds } from "@/lib/use-elapsed-seconds";

function generateId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

// A JD shorter than this can't give the model enough to build 3 distinct
// case-scenario questions from, and free-tier AI calls aren't free to waste.
const MIN_JD_LENGTH = 40;

export default function NewJobPage() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [title, setTitle] = useState("");
  const [jdText, setJdText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const pendingJobId = useRef<string | null>(null);
  // Remembers the exact payload for a one-shot retry against Gemini when
  // OpenRouter fails — see app/api/hr/jobs/stream/route.ts.
  const lastPayload = useRef<Record<string, unknown> | null>(null);
  const hasRetried = useRef(false);

  const { object, submit, isLoading } = useObject({
    api: "/api/hr/jobs/stream",
    schema: scenarioQuestionsSchema,
    onFinish: ({ object: finalObject, error: finishError }) => {
      // OpenRouter's rate-limit surfaces here (stream completes with no
      // valid object), not via onError — same one-shot Gemini retry.
      if ((finishError || !finalObject) && !hasRetried.current && lastPayload.current) {
        hasRetried.current = true;
        submit({ ...lastPayload.current, fallback: true });
        return;
      }
      // The stream saves the job server-side once the object validates, so we
      // only navigate on a clean finish. Inputs are intentionally left intact
      // on failure so the user can just press the button again.
      if (finishError || !finalObject || !pendingJobId.current) {
        setError(t("newJob.errorGenerate"));
        return;
      }
      router.push(`/hr/dashboard/${pendingJobId.current}`);
    },
    onError: (err) => {
      if (!hasRetried.current && lastPayload.current) {
        hasRetried.current = true;
        submit({ ...lastPayload.current, fallback: true });
        return;
      }
      setError(err.message);
    },
  });

  const elapsedSeconds = useElapsedSeconds(isLoading);

  function handleSubmit(event: React.FormEvent) {
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

    const id = generateId();
    pendingJobId.current = id;
    hasRetried.current = false;
    const payload = { id, title, jd_text: jdText, locale };
    lastPayload.current = payload;
    submit(payload);
  }

  const showPreview = isLoading || Boolean(object?.questions);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-6 md:p-10">
      <PageHeader eyebrow={t("newJob.eyebrow")} title={t("newJob.title")} subtitle={t("newJob.subtitle")} />

      {/* Two columns on desktop — form left, generated questions right — to
          match the reference (hr_buat-lowongan.png). The right column only
          renders once there's something to show, so it doesn't leave an
          empty panel staring back before the first submit. */}
      <div className={`grid grid-cols-1 gap-6 ${showPreview ? "lg:grid-cols-2" : ""}`}>
        <Card className="h-fit p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">{t("newJob.jobTitleLabel")}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>
              <Textarea
                id="jd_text"
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                disabled={isLoading}
                rows={10}
                placeholder={t("newJob.jdPlaceholder")}
              />
              <p className="text-xs text-muted-foreground">
                {t("newJob.enhanceHint")}
              </p>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-md border border-border bg-muted px-3 py-2 text-sm"
              >
                {error}
              </p>
            )}

            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? t("newJob.submitting", { seconds: elapsedSeconds })
                : t("newJob.submit")}
            </Button>
          </form>
        </Card>

        {showPreview && (
          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("newJob.generatedTitle")}
            </h2>
            <div className="space-y-3">
              {[0, 1, 2].map((index) => {
                const question = object?.questions?.[index];
                return (
                  <Card key={index} className="p-4">
                    {question?.question ? (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          {question.focus_area ?? ""}
                        </p>
                        <p className="text-sm">{question.question}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          {t("newJob.generatingQuestion", { number: index + 1 })}
                        </p>
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-4/5" />
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
