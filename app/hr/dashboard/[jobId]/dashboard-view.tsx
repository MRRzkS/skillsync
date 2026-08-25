"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import CvPreview from "@/components/cv-preview";
import PageHeader from "@/components/page-header";
import { useTranslation } from "@/lib/i18n";
import type { ApplicationWithCandidate } from "@/lib/types";

/**
 * Quotes a CSV field and neutralises spreadsheet formula injection. Candidate
 * names and AI summaries are data we didn't author, and a value starting with
 * =, +, - or @ is executed as a formula when the export is opened in Excel or
 * Sheets — the leading apostrophe forces it back to text.
 */
function csvField(value: string | number | null | undefined) {
  const raw = String(value ?? "");
  const safe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
}

function downloadCsv(
  applications: ApplicationWithCandidate[],
  filename: string
) {
  const header = "full_name,match_score,status,pitch_summary\n";
  const rows = applications
    .map((a) =>
      [
        csvField(a.candidate_profiles?.full_name),
        csvField(a.status === "completed" ? a.match_score : ""),
        csvField(a.status),
        csvField(a.transcript?.pitch_summary),
      ].join(",")
    )
    .join("\n");

  // A BOM keeps Excel from mangling non-ASCII names.
  const blob = new Blob(["﻿" + header + rows], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  // Firefox ignores .click() on an anchor that isn't in the document, and
  // revoking the URL in the same tick can cancel the download before it
  // starts — hence the append/remove and the deferred revoke.
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Keeps the exported filename readable and filesystem-safe. */
function shortlistFilename(jobTitle: string) {
  const slug = jobTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return `shortlist-${slug || "job"}.csv`;
}

export default function DashboardView({
  jobTitle,
  applications,
}: {
  jobTitle: string;
  applications: ApplicationWithCandidate[];
}) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<ApplicationWithCandidate | null>(
    null
  );

  // t() already falls back to the key itself, so no extra guard is needed.
  const statusLabel = (status: string) => t(`dashboard.status.${status}`);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-6 md:p-10">
      <PageHeader
        eyebrow={
          <Link
            href="/hr/jobs"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            {t("dashboard.backToJobs")}
          </Link>
        }
        title={jobTitle}
        subtitle={t("dashboard.subtitle")}
        action={
          applications.length > 0 ? (
            <Button
              variant="outline"
              onClick={() =>
                downloadCsv(applications, shortlistFilename(jobTitle))
              }
            >
              <Download className="h-4 w-4" aria-hidden />
              {t("dashboard.exportShortlist")}
            </Button>
          ) : undefined
        }
      />

      {applications.length === 0 ? (
        <Card className="border-dashed p-10 text-center">
          <p className="font-medium">{t("dashboard.emptyTitle")}</p>
          <p className="mx-auto mt-1 max-w-prose text-sm text-muted-foreground">
            {t("dashboard.emptyBody")}
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>{t("dashboard.colName")}</TableHead>
                <TableHead className="w-32">{t("dashboard.colScore")}</TableHead>
                <TableHead className="w-36">
                  {t("dashboard.colStatus")}
                </TableHead>
                <TableHead className="w-24 text-right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell className="font-medium">
                    {application.candidate_profiles?.full_name ?? "—"}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {application.status === "completed"
                      ? application.match_score
                      : t("dashboard.notScoredYet")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">
                      {statusLabel(application.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelected(application)}
                    >
                      {t("dashboard.details")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Sheet
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {selected && (
            <>
              <SheetHeader className="text-left">
                <SheetTitle>
                  {selected.candidate_profiles?.full_name ?? "—"}
                </SheetTitle>
                <SheetDescription>
                  {t("detail.matchScore")}:{" "}
                  <span className="font-medium text-foreground tabular-nums">
                    {selected.status === "completed"
                      ? selected.match_score
                      : t("dashboard.notScoredYet")}
                  </span>{" "}
                  · {statusLabel(selected.status)}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {selected.status === "in_progress" && (
                  <p className="rounded-md border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
                    {t("dashboard.staleHint")}
                  </p>
                )}

                {selected.transcript?.pitch_summary && (
                  <section className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t("detail.pitchSummary")}
                    </h3>
                    <p className="text-sm text-foreground/80">
                      {selected.transcript.pitch_summary}
                    </p>
                  </section>
                )}

                <section className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("detail.transcript")}
                  </h3>
                  {selected.transcript?.entries?.length ? (
                    <div className="space-y-3">
                      {selected.transcript.entries.map((entry, i) => (
                        <div
                          key={i}
                          className="space-y-2 rounded-lg border border-border p-3"
                        >
                          {entry.focus_area && (
                            <p className="text-xs text-muted-foreground">
                              {entry.focus_area}
                            </p>
                          )}
                          {entry.question && (
                            <p className="text-sm font-medium">
                              {entry.question}
                            </p>
                          )}
                          {entry.answer && (
                            <p className="text-sm text-foreground/80">
                              {entry.answer}
                            </p>
                          )}
                          {entry.feedback && (
                            <p className="border-t border-border pt-2 text-xs text-muted-foreground">
                              <span className="font-medium">
                                {t("detail.feedbackLabel")}:
                              </span>{" "}
                              {entry.feedback}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {t("detail.noTranscript")}
                    </p>
                  )}
                </section>

                <Separator />

                <section className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("detail.cv")}
                  </h3>
                  <CvPreview cv={selected.candidate_profiles?.cv_json} />
                </section>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
