import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// The nav's global "Dashboard Skor" entry point. The scorecard itself is
// per-vacancy (app/hr/dashboard/[jobId]), so this just picks the most
// recently posted job — the one a fresh sign-in would care about most — and
// hands off to its dashboard. No jobs yet means nothing to rank, so it falls
// back to the jobs list instead.
export default async function HrDashboardIndexPage() {
  const supabase = createServerSupabaseClient();

  const { data: job } = await supabase
    .from("job_vacancies")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  redirect(job ? `/hr/dashboard/${job.id}` : "/hr/jobs");
}
