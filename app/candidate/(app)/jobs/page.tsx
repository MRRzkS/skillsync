import { redirect } from "next/navigation";
import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import JobsListClient from "@/components/candidate/jobs-list-client";

export const dynamic = "force-dynamic";

export default async function CandidateJobsPage() {
  const authSupabase = createAuthServerClient();
  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) redirect("/candidate/login");

  const supabase = createServerSupabaseClient();

  const { data: candidate } = await supabase
    .from("candidate_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  // No CV yet — nothing to attach an application to.
  if (!candidate) redirect("/candidate/resume-builder");

  const [{ data: jobs }, { data: applications }] = await Promise.all([
    supabase
      .from("job_vacancies")
      .select("id, title, jd_text, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("applications")
      .select("id, job_id, status, match_score")
      .eq("candidate_id", candidate.id),
  ]);

  return (
    // The (app) layout already provides <main> and the page background.
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-8 lg:px-8">
      <JobsListClient
        candidateId={candidate.id}
        jobs={jobs ?? []}
        applications={applications ?? []}
      />
    </div>
  );
}
