import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ApplicationWithCandidate } from "@/lib/types";
import DashboardView from "./dashboard-view";

// Ranking changes every time a candidate finishes their assessment, so this
// page must never serve a cached response.
export const dynamic = "force-dynamic";

export default async function HrDashboardPage({
  params,
}: {
  params: { jobId: string };
}) {
  const supabase = createServerSupabaseClient();

  const { data: job } = await supabase
    .from("job_vacancies")
    .select("id, title")
    .eq("id", params.jobId)
    .single();

  if (!job) notFound();

  const { data: applications } = await supabase
    .from("applications")
    .select("*, candidate_profiles(*)")
    .eq("job_id", params.jobId)
    .order("match_score", { ascending: false });

  return (
    <DashboardView
      jobTitle={job.title}
      applications={(applications ?? []) as ApplicationWithCandidate[]}
    />
  );
}
