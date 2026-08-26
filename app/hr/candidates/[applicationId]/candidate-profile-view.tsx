"use client";

import Link from "next/link";
import { ArrowLeft, Download, Mail, MapPin, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";
import type { CvJson } from "@/lib/types";

// Reads the CV tolerantly — the Candidate module owns that shape and spells
// some fields two ways (see lib/types.ts).
function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function csvField(value: string | number | null | undefined) {
  const raw = String(value ?? "");
  const safe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

export default function CandidateProfileView({
  applicationId,
  jobId,
  jobTitle,
  name,
  cv,
  matchScore,
  status,
  pitchSummary,
  hasTranscript,
}: {
  applicationId: string;
  jobId: string;
  jobTitle: string;
  name: string;
  cv: CvJson | null;
  matchScore: number;
  status: string;
  pitchSummary: string | null;
  hasTranscript: boolean;
}) {
  const { t } = useTranslation();

  const experience = cv?.experience ?? [];
  const education = cv?.education ?? [];
  const skills = cv?.skills ?? [];
  const certifications = cv?.certifications ?? [];
  const languages = cv?.languages ?? [];
  const scored = status === "completed";

  function exportProfile() {
    const rows = [
      ["Name", "Applied for", "Match score", "Status", "AI summary"],
      [name, jobTitle, scored ? matchScore : "", status, pitchSummary ?? ""],
    ];
    const csv = rows.map((row) => row.map(csvField).join(",")).join("\r\n");
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `profile-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-6 md:p-10">
      <Button variant="outline" asChild className="w-fit">
        <Link href={`/hr/dashboard/${jobId}`}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t("candidates.backToDashboard")}
        </Link>
      </Button>

      <div
        className="rounded-2xl px-6 py-8 text-white lg:px-8"
        style={{
          backgroundImage:
            "linear-gradient(120deg, hsl(var(--brand-navy)) 0%, hsl(var(--primary)) 120%)",
        }}
      >
        <div
          className="flex h-20 w-20 items-center justify-center rounded-2xl font-heading text-2xl font-bold"
          style={{ backgroundColor: "hsl(var(--success))" }}
        >
          {initials(name)}
        </div>
        <h1 className="mt-5 font-heading text-3xl font-bold tracking-tight">{name}</h1>
        <p className="mt-1 text-sm font-medium" style={{ color: "hsl(var(--brand-accent-purple))" }}>
          {t("candidates.appliedFor", { job: jobTitle })}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/80">
          {cv?.contact?.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" aria-hidden /> {cv.contact.location}
            </span>
          )}
          {cv?.contact?.email && (
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" aria-hidden /> {cv.contact.email}
            </span>
          )}
        </div>
      </div>

      <Card className="grid grid-cols-2 divide-border md:grid-cols-4 md:divide-x">
        <Stat
          label={t("candidates.statMatch")}
          value={scored ? String(matchScore) : t("dashboard.notScoredYet")}
          tone={scored ? (matchScore >= 85 ? "success" : "warning") : "muted"}
        />
        <Stat label={t("candidates.statYears")} value={String(experience.length)} />
        <Stat label={t("candidates.statSkills")} value={String(skills.length)} />
        <Stat
          label={t("candidates.statStatus")}
          value={t(`dashboard.status.${status}`)}
          tone={scored ? "success" : "muted"}
        />
      </Card>

      <div className="flex flex-wrap justify-end gap-3">
        {hasTranscript && (
          <Button variant="outline" asChild>
            <Link href={`/hr/assessments/${applicationId}`}>
              <MessageSquare className="h-4 w-4" aria-hidden />
              {t("candidates.viewTranscript")}
            </Link>
          </Button>
        )}
        <Button onClick={exportProfile}>
          <Download className="h-4 w-4" aria-hidden />
          {t("candidates.exportProfile")}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="space-y-6 p-6">
          <section>
            <h2 className="font-heading text-lg font-bold">{t("candidates.aiSummary")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {pitchSummary ?? t("candidates.noSummary")}
            </p>
          </section>

          {experience.length > 0 && (
            <section>
              <h2 className="font-heading text-lg font-bold">{t("cv.experience")}</h2>
              <ol className="mt-3 space-y-5 border-l border-border pl-5">
                {experience.map((item, i) => (
                  <li key={i} className="relative">
                    <TimelineDot />
                    <p className="font-medium">{item.role || item.title || "—"}</p>
                    <p className="text-xs text-muted-foreground">
                      {[item.company, item.period || [item.startDate, item.endDate].filter(Boolean).join(" — ")]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {item.bullets && item.bullets.length > 0 && (
                      <ul className="mt-1.5 space-y-1 text-sm text-muted-foreground">
                        {item.bullets.map((bullet, b) => (
                          <li key={b}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {education.length > 0 && (
            <section>
              <h2 className="font-heading text-lg font-bold">{t("cv.education")}</h2>
              <ol className="mt-3 space-y-5 border-l border-border pl-5">
                {education.map((item, i) => (
                  <li key={i} className="relative">
                    <TimelineDot />
                    <p className="font-medium">
                      {[item.degree, item.fieldOfStudy].filter(Boolean).join(" ") || "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {[
                        item.institution || item.school,
                        item.period || [item.startDate, item.endDate].filter(Boolean).join(" — "),
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {item.gpa && (
                      <p className="mt-1 text-sm text-muted-foreground">{item.gpa}</p>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {!cv && (
            <p className="text-sm text-muted-foreground">{t("candidates.noCv")}</p>
          )}
        </Card>

        <Card className="space-y-6 p-6">
          {skills.length > 0 && (
            <ChipSection title={t("cv.skills")} items={skills} />
          )}
          {certifications.length > 0 && (
            <ChipSection title={t("cv.certifications")} items={certifications} />
          )}
          {languages.length > 0 && (
            <ChipSection title={t("cv.languages")} items={languages} />
          )}

          {scored && (
            <section>
              <h2 className="font-heading text-lg font-bold">{t("candidates.progress")}</h2>
              <ScoreDonut score={matchScore} label={t("candidates.match")} />
            </section>
          )}
        </Card>
      </div>
    </div>
  );
}

function TimelineDot() {
  return (
    <span
      aria-hidden
      className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background"
      style={{ backgroundColor: "hsl(var(--brand-accent-purple))" }}
    />
  );
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "success" | "warning" | "muted";
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : tone === "muted"
          ? "text-muted-foreground"
          : "text-foreground";
  return (
    <div className="p-5 text-center">
      <p className={`font-heading text-2xl font-bold ${toneClass}`}>{value}</p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function ChipSection({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <h2 className="font-heading text-lg font-bold">{title}</h2>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.map((item) => (
          <Badge key={item} variant="outline">
            {item}
          </Badge>
        ))}
      </div>
    </section>
  );
}

/** Plain SVG ring — no chart library for one number. */
function ScoreDonut({ score, label }: { score: number; label: string }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));

  return (
    <div className="mt-3 flex justify-center">
      <div className="relative h-32 w-32">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            strokeWidth="10"
            className="stroke-secondary"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            className="stroke-success"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - clamped / 100)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading text-2xl font-bold">{clamped}%</span>
          <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}
