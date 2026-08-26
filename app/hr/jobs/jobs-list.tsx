"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ConfirmDialog from "@/components/confirm-dialog";
import PageHeader from "@/components/page-header";
import { useTranslation } from "@/lib/i18n";

export type JobSummary = {
  id: string;
  title: string;
  createdAt: string | null;
  questionCount: number;
  candidateCount: number;
};

export default function JobsList({ jobs }: { jobs: JobSummary[] }) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const [pendingDelete, setPendingDelete] = useState<JobSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete() {
    if (!pendingDelete) return;

    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/hr/jobs/${pendingDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setDeleteError(t("jobs.deleteFailed"));
        return;
      }
      setPendingDelete(null);
      router.refresh();
    } catch {
      setDeleteError(t("jobs.deleteFailed"));
    } finally {
      setIsDeleting(false);
    }
  }

  function formatDate(value: string | null) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-6 md:p-10">
      {/* Welcome banner from the reference (hr_daftar-lowongan.png). Counts are
          derived from the jobs already on screen — no extra query. */}
      <div
        className="rounded-2xl px-6 py-7 text-white lg:px-8"
        style={{
          backgroundImage:
            "linear-gradient(105deg, hsl(var(--brand-navy)) 0%, hsl(var(--primary)) 45%, hsl(var(--brand-accent-purple)) 100%)",
        }}
      >
        <h2 className="font-heading text-2xl font-bold">
          {t("jobs.welcomeTitle")} <span aria-hidden>👋</span>
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/85">
          {t("jobs.welcomeBody", {
            jobs: jobs.length,
            candidates: jobs.reduce((sum, job) => sum + job.candidateCount, 0),
          })}
        </p>
      </div>

      <PageHeader
        eyebrow={t("jobs.eyebrow")}
        title={t("jobs.title")}
        subtitle={t("jobs.subtitle")}
        action={
          <Button asChild>
            <Link href="/hr/new-job" prefetch>
              <Plus className="h-4 w-4" aria-hidden />
              {t("jobs.create")}
            </Link>
          </Button>
        }
      />

      {jobs.length === 0 ? (
        <Card className="border-dashed p-10 text-center">
          <p className="font-medium">{t("jobs.emptyTitle")}</p>
          <p className="mx-auto mt-1 max-w-prose text-sm text-muted-foreground">
            {t("jobs.emptyBody")}
          </p>
          <Button asChild className="mt-5">
            <Link href="/hr/new-job" prefetch>
              <Plus className="h-4 w-4" aria-hidden />
              {t("jobs.create")}
            </Link>
          </Button>
        </Card>
      ) : (
        <ul className="space-y-3">
          {jobs.map((job) => {
            const created = formatDate(job.createdAt);
            const meta = [
              job.candidateCount === 1
                ? t("jobs.candidateCountOne")
                : t("jobs.candidateCount", { count: job.candidateCount }),
              t("jobs.questionCount", { count: job.questionCount }),
              created ? t("jobs.createdOn", { date: created }) : null,
            ].filter(Boolean);

            return (
              <li key={job.id}>
                <Card className="flex items-center gap-2 p-2 transition-colors hover:border-foreground/20">
                  <Link
                    href={`/hr/dashboard/${job.id}`}
                    className="flex min-w-0 flex-1 items-center justify-between gap-4 p-2"
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="truncate font-medium">{job.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {meta.join(" · ")}
                      </p>
                    </div>
                    <span className="flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground">
                      <span className="hidden sm:inline">
                        {t("jobs.openDashboard")}
                      </span>
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </span>
                  </Link>
                  <div className="flex shrink-0 items-center gap-1 pr-1">
                    <Button asChild variant="ghost" size="icon" aria-label={t("jobs.edit")}>
                      <Link href={`/hr/jobs/${job.id}/edit`}>
                        <Pencil className="h-4 w-4" aria-hidden />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t("jobs.delete")}
                      onClick={() => {
                        setDeleteError(null);
                        setPendingDelete(job);
                      }}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </Button>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={t("jobs.delete")}
        description={
          pendingDelete
            ? t("jobs.deleteConfirm", { title: pendingDelete.title })
            : undefined
        }
        confirmLabel={isDeleting ? t("jobs.deleting") : t("jobs.deleteAction")}
        cancelLabel={t("common.cancel")}
        onConfirm={handleDelete}
        isPending={isDeleting}
        error={deleteError}
      />
    </div>
  );
}
