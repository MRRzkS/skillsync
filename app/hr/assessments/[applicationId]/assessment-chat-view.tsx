"use client";

import Link from "next/link";
import { ArrowLeft, Eye, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PageHeader from "@/components/page-header";
import { useTranslation } from "@/lib/i18n";
import type { TranscriptEntry } from "@/lib/types";

// The reference draws this screen from the candidate's side, complete with a
// message box. HR is reading someone else's finished conversation, so the
// composer is deliberately not reproduced — there's nothing for HR to send.
export default function AssessmentChatView({
  applicationId,
  name,
  jobTitle,
  status,
  matchScore,
  entries,
  total,
}: {
  applicationId: string;
  name: string;
  jobTitle: string;
  status: string;
  matchScore: number;
  entries: TranscriptEntry[];
  total: number;
}) {
  const { t } = useTranslation();
  const scored = status === "completed";

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-6 md:p-10">
      <Button variant="outline" asChild className="w-fit">
        <Link href="/hr/assessments">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t("assessments.title")}
        </Link>
      </Button>

      <PageHeader
        eyebrow={`${name} · ${jobTitle}`}
        title={t("assessments.title")}
        subtitle={t("assessments.subtitle")}
        action={
          <Button variant="outline" asChild>
            <Link href={`/hr/candidates/${applicationId}`}>
              <Eye className="h-4 w-4" aria-hidden />
              {t("candidates.viewProfile")}
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="space-y-6 p-6">
          <p className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {t("assessments.readOnly")}
          </p>

          {entries.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t("assessments.notStarted")}
            </p>
          ) : (
            <ol className="space-y-6">
              {entries.map((entry, i) => (
                <li key={i} className="space-y-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {t("assessments.questionLabel", { number: i + 1 })}
                    {entry.focus_area ? ` · ${entry.focus_area}` : ""}
                  </p>

                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-secondary px-4 py-3 text-sm leading-relaxed">
                    {entry.question}
                  </div>

                  {entry.answer ? (
                    <div
                      className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed text-white"
                      style={{ backgroundColor: "hsl(var(--brand-navy))" }}
                    >
                      {entry.answer}
                    </div>
                  ) : (
                    <p className="ml-auto max-w-[85%] text-right text-sm text-muted-foreground">
                      {t("assessments.noAnswer")}
                    </p>
                  )}

                  {entry.feedback && (
                    <div className="rounded-xl border border-border p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-accent-foreground">
                        {t("assessments.aiEvaluation")}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {entry.feedback}
                      </p>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          )}
        </Card>

        <div className="space-y-4">
          <SideStat
            label={t("assessments.progressLabel")}
            value={`${entries.length} / ${total || "?"}`}
          />
          <SideStat
            label={t("assessments.scoreLabel")}
            value={scored ? `${matchScore}/100` : t("dashboard.notScoredYet")}
            tone={scored ? "success" : "muted"}
          />
          <SideStat
            label={t("assessments.statusLabel")}
            value={t(`dashboard.status.${status}`)}
          />
        </div>
      </div>
    </div>
  );
}

function SideStat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "success" | "muted";
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "muted"
        ? "text-muted-foreground"
        : "text-foreground";
  return (
    <Card className="p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 font-heading text-2xl font-bold ${toneClass}`}>{value}</p>
    </Card>
  );
}
