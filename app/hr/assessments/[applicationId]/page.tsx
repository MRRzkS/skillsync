import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Transcript } from "@/lib/types";
import AssessmentChatView from "./assessment-chat-view";

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

export default async function HrAssessmentPage({
  params,
}: {
  params: { applicationId: string };
}) {
  const supabase = createServerSupabaseClient();

  const { data } = await supabase
    .from("applications")
    .select(
      "id, match_score, status, transcript, candidate_profiles(full_name), job_vacancies(title, scenarios)"
    )
    .eq("id", params.applicationId)
    .maybeSingle();

  const application = data as unknown as ApplicationRow | null;
  if (!application) notFound();

  const candidate = single(application.candidate_profiles);
  const job = single(application.job_vacancies);

  const entries = application.transcript?.entries ?? [];
  const total = Array.isArray(job?.scenarios)
    ? (job?.scenarios as unknown[]).length
    : entries.length;

  return (
    <AssessmentChatView
      applicationId={application.id}
      name={candidate?.full_name ?? "—"}
      jobTitle={job?.title ?? "—"}
      status={application.status}
      matchScore={application.match_score}
      entries={entries}
      total={total}
    />
  );
}
