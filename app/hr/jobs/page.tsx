import { createServerSupabaseClient } from "@/lib/supabase/server";
import JobsList, { type JobSummary } from "./jobs-list";

export const dynamic = "force-dynamic";

type JobRow = {
  id: string;
  title: string;
  created_at: string | null;
  scenarios: unknown;
  applications: { count: number }[] | null;
};

export default async function JobsPage() {
  const supabase = createServerSupabaseClient();

  const { data } = await supabase
    .from("job_vacancies")
    .select("id, title, created_at, scenarios, applications(count)")
    .order("created_at", { ascending: false });

  const jobs: JobSummary[] = ((data ?? []) as JobRow[]).map((job) => ({
    id: job.id,
    title: job.title,
    createdAt: job.created_at,
    questionCount: Array.isArray(job.scenarios) ? job.scenarios.length : 0,
    candidateCount: job.applications?.[0]?.count ?? 0,
  }));

  return <JobsList jobs={jobs} />;
}
