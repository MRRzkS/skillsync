import { createServerSupabaseClient } from "@/lib/supabase/server";
import CandidatesList, { type CandidateRow } from "./candidates-list";

export const dynamic = "force-dynamic";

type ApplicationRow = {
  id: string;
  match_score: number;
  status: string;
  created_at: string | null;
  candidate_profiles: { id: string; full_name: string }[] | { id: string; full_name: string } | null;
  job_vacancies: { id: string; title: string }[] | { id: string; title: string } | null;
};

function single<T>(v: T[] | T | null): T | null {
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

// Cross-job candidate directory. The dashboard is scoped to one vacancy; this
// is the same data read the other way round, so the sidebar's "Candidate
// Profiles" entry has somewhere real to land.
export default async function HrCandidatesPage() {
  const supabase = createServerSupabaseClient();

  const { data } = await supabase
    .from("applications")
    .select(
      "id, match_score, status, created_at, candidate_profiles(id, full_name), job_vacancies(id, title)"
    )
    .order("match_score", { ascending: false });

  const candidates: CandidateRow[] = ((data ?? []) as unknown as ApplicationRow[]).map((row) => {
    const candidate = single(row.candidate_profiles);
    const job = single(row.job_vacancies);
    return {
      applicationId: row.id,
      name: candidate?.full_name ?? "—",
      jobTitle: job?.title ?? "—",
      matchScore: row.match_score,
      status: row.status,
    };
  });

  return <CandidatesList candidates={candidates} />;
}
