import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Transcript } from "@/lib/types";
import AssessmentsList, { type AssessmentRow } from "./assessments-list";

export const dynamic = "force-dynamic";

type ApplicationRow = {
  id: string;
  match_score: number;
  status: string;
  transcript: Transcript | null;
  candidate_profiles: { full_name: string }[] | { full_name: string } | null;
  job_vacancies: { title: string; scenarios: unknown }[] | { title: string; scenarios: unknown } | null;
};

function single<T>(v: T[] | T | null): T | null {
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

// Every assessment conversation, newest first. Pending applications are left
// out: there's no conversation to read until the candidate starts.
export default async function HrAssessmentsPage() {
  const supabase = createServerSupabaseClient();

  const { data } = await supabase
    .from("applications")
    .select(
      "id, match_score, status, transcript, created_at, candidate_profiles(full_name), job_vacancies(title, scenarios)"
    )
    .neq("status", "pending")
    .order("created_at", { ascending: false });

  const assessments: AssessmentRow[] = ((data ?? []) as unknown as ApplicationRow[]).map((row) => {
    const candidate = single(row.candidate_profiles);
    const job = single(row.job_vacancies);
    return {
      applicationId: row.id,
      name: candidate?.full_name ?? "—",
      jobTitle: job?.title ?? "—",
      status: row.status,
      matchScore: row.match_score,
      answered: row.transcript?.entries?.length ?? 0,
      total: Array.isArray(job?.scenarios)
        ? (job?.scenarios as unknown[]).length
        : (row.transcript?.entries?.length ?? 0),
    };
  });

  return <AssessmentsList assessments={assessments} />;
}
