"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import PageHeader from "@/components/page-header";
import { useTranslation } from "@/lib/i18n";

export type AssessmentRow = {
  applicationId: string;
  name: string;
  jobTitle: string;
  status: string;
  matchScore: number;
  answered: number;
  total: number;
};

export default function AssessmentsList({
  assessments,
}: {
  assessments: AssessmentRow[];
}) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-6 md:p-10">
      <PageHeader
        eyebrow={t("assessments.eyebrow")}
        title={t("assessments.title")}
        subtitle={t("assessments.subtitle")}
      />

      {assessments.length === 0 ? (
        <Card className="border-dashed p-10 text-center">
          <p className="font-medium">{t("assessments.emptyTitle")}</p>
          <p className="mx-auto mt-1 max-w-prose text-sm text-muted-foreground">
            {t("assessments.emptyBody")}
          </p>
        </Card>
      ) : (
        <ul className="space-y-3">
          {assessments.map((item) => (
            <li key={item.applicationId}>
              <Card className="transition-colors hover:border-foreground/20">
                <Link
                  href={`/hr/assessments/${item.applicationId}`}
                  className="flex items-center justify-between gap-4 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.name}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {item.jobTitle} · {item.answered}/{item.total || "?"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Badge variant="outline">{t(`dashboard.status.${item.status}`)}</Badge>
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      {t("assessments.open")}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </span>
                  </div>
                </Link>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
