"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Called by the Candidate module (ResumeForge) when the applicant clicks
 * "Submit Application" on a job. Creates the `applications` row and returns
 * its id so the caller can redirect to /assess/[applicationId].
 */
export async function createApplicationAction(params: {
  candidateId: string;
  jobId: string;
}): Promise<{ applicationId: string } | { error: string }> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("applications")
    .insert({
      candidate_id: params.candidateId,
      job_id: params.jobId,
      status: "pending",
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Failed to create application" };
  }

  return { applicationId: data.id };
}
