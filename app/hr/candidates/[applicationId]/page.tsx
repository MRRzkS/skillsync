import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { CvJson, Transcript } from "@/lib/types";
import CandidateProfileView from "./candidate-profile-view";

export const dynamic = "force-dynamic";

type ApplicationRow = {
  id: string;
  match_score: number;
  status: string;
  transcript: Transcript | null;
  job_id: string;
  candidate_profiles:
    | { id: string; full_name: string; cv_json: CvJson }[]
    | { id: string; full_name: string; cv_json: CvJson }
    | null;
  job_vacancies: { id: string; title: string }[] | { id: string; title: string } | null;
};

function single<T>(v: T[] | T | null): T | null {
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

// Full-page candidate profile. The dashboard already shows this data in a side
// sheet; this is the linkable version the reference asks for, reachable from
// the candidate directory.
export default async function HrCandidateProfilePage({
  params,
}: {
  params: { applicationId: string };
}) {
  const supabase = createServerSupabaseClient();

  const { data } = await supabase
    .from("applications")
    .select(
      "id, match_score, status, transcript, job_id, candidate_profiles(id, full_name, cv_json), job_vacancies(id, title)"
    )
    .eq("id", params.applicationId)
    .maybeSingle();

  const application = data as unknown as ApplicationRow | null;
  if (!application) notFound();

  const candidate = single(application.candidate_profiles);
  const job = single(application.job_vacancies);

  return (
    <CandidateProfileView
      applicationId={application.id}
      jobId={application.job_id}
      jobTitle={job?.title ?? "—"}
      name={candidate?.full_name ?? "—"}
      cv={candidate?.cv_json ?? null}
      matchScore={application.match_score}
      status={application.status}
      pitchSummary={application.transcript?.pitch_summary ?? null}
      hasTranscript={(application.transcript?.entries?.length ?? 0) > 0}
    />
  );
}
