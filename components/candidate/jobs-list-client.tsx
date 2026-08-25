"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Loader2, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/candidate/ui/button";
import { Badge } from "@/components/candidate/ui/badge";

type Job = {
  id: string;
  title: string;
  jd_text: string;
  created_at: string;
};

type Application = {
  id: string;
  job_id: string;
  status: string;
  match_score: number;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Not started",
  in_progress: "In progress",
  completed: "Completed",
};

function excerpt(text: string, max = 160) {
  const trimmed = text.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max).trimEnd()}…` : trimmed;
}

export default function JobsListClient({
  candidateId,
  jobs,
  applications,
}: {
  candidateId: string;
  jobs: Job[];
  applications: Application[];
}) {
  const router = useRouter();
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const applicationByJob = new Map(applications.map((a) => [a.job_id, a]));

  async function handleApply(jobId: string) {
    setError(null);
    setApplyingJobId(jobId);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate_id: candidateId, job_id: jobId }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Couldn't submit your application. Try again.");
      }
      router.push(`/assess/${json.applicationId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
      setApplyingJobId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-ocean-600 to-sync-purple-600">
          <Briefcase className="h-[18px] w-[18px] text-white" />
        </div>
        <h1 className="font-candidate-heading text-xl font-bold text-text-dark">Open Roles</h1>
      </div>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-gray">
        Pick a role and we&apos;ll walk you through a quick 3-question verification test using
        the CV you just built.
      </p>

      {error && (
        <p className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}

      {jobs.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-ocean-100 bg-white px-6 py-16 text-center">
          <Briefcase className="h-6 w-6 text-ocean-600" />
          <p className="text-sm font-medium text-text-dark">No open roles right now</p>
          <p className="max-w-xs text-sm text-text-gray">
            Check back later — HR posts new roles regularly.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {jobs.map((job) => {
            const application = applicationByJob.get(job.id);
            const isApplying = applyingJobId === job.id;

            return (
              <li
                key={job.id}
                className="rounded-2xl border border-ocean-100/60 bg-white p-6 shadow-card"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-candidate-heading text-base font-bold text-text-dark">
                      {job.title}
                    </h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-text-gray">
                      {excerpt(job.jd_text)}
                    </p>
                  </div>

                  {application ? (
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <Badge variant={application.status === "completed" ? "mint" : "ocean"}>
                        {application.status === "completed" && (
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                        )}
                        {STATUS_LABEL[application.status] ?? application.status}
                        {application.status === "completed" &&
                          ` · ${application.match_score}/100`}
                      </Badge>
                      <Button
                        variant="outline-soft"
                        size="sm"
                        className="gap-2"
                        onClick={() => router.push(`/assess/${application.id}`)}
                      >
                        {application.status === "completed" ? "View" : "Continue"}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ai"
                      size="sm"
                      className="shrink-0 gap-2"
                      disabled={isApplying}
                      onClick={() => handleApply(job.id)}
                    >
                      {isApplying ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Applying...
                        </>
                      ) : (
                        <>
                          Apply <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
