"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PageHeader from "@/components/page-header";
import { useTranslation } from "@/lib/i18n";

export type CandidateRow = {
  applicationId: string;
  name: string;
  jobTitle: string;
  matchScore: number;
  status: string;
};

export default function CandidatesList({ candidates }: { candidates: CandidateRow[] }) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-6 md:p-10">
      <PageHeader
        eyebrow={t("candidates.eyebrow")}
        title={t("candidates.title")}
        subtitle={t("candidates.subtitle")}
      />

      {candidates.length === 0 ? (
        <Card className="border-dashed p-10 text-center">
          <p className="font-medium">{t("candidates.emptyTitle")}</p>
          <p className="mx-auto mt-1 max-w-prose text-sm text-muted-foreground">
            {t("candidates.emptyBody")}
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("candidates.colName")}</TableHead>
                <TableHead>{t("candidates.colJob")}</TableHead>
                <TableHead>{t("candidates.colScore")}</TableHead>
                <TableHead>{t("candidates.colStatus")}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((candidate) => (
                <TableRow key={candidate.applicationId}>
                  <TableCell className="font-medium">{candidate.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {candidate.jobTitle}
                  </TableCell>
                  <TableCell>
                    {candidate.status === "completed" ? (
                      <span
                        className={
                          candidate.matchScore >= 85
                            ? "font-semibold text-success"
                            : "font-semibold text-warning"
                        }
                      >
                        {candidate.matchScore}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        {t("dashboard.notScoredYet")}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {t(`dashboard.status.${candidate.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/hr/candidates/${candidate.applicationId}`}
                      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {t("candidates.viewProfile")}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
