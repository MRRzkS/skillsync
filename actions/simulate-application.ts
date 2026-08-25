"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DEMO_SIMULATED_CANDIDATE } from "@/lib/demo-data";

export type SimulateApplicationState = {
  error?: string;
};

/**
 * Demo-only helper: the Candidate module (ResumeForge) doesn't have a UI
 * yet, so there's no real way to trigger "Submit Application" end-to-end.
 * This creates a throwaway demo candidate + a pending application for the
 * given job, then sends the presenter straight to the assessment page so
 * the live AI scoring demo can continue uninterrupted.
 */
export async function simulateApplicationAction(
  _prevState: SimulateApplicationState,
  formData: FormData
): Promise<SimulateApplicationState> {
  const jobId = String(formData.get("job_id") ?? "").trim();

  if (!jobId) {
    return { error: "Job ID is required." };
  }

  const supabase = createServerSupabaseClient();

  const { data: job } = await supabase
    .from("job_vacancies")
    .select("id")
    .eq("id", jobId)
    .single();

  if (!job) {
    return { error: "Job not found. Double-check the Job ID." };
  }

  const { data: candidate, error: candidateError } = await supabase
    .from("candidate_profiles")
    .insert({
      full_name: DEMO_SIMULATED_CANDIDATE.full_name,
      cv_json: DEMO_SIMULATED_CANDIDATE.cv_json,
    })
    .select("id")
    .single();

  if (candidateError || !candidate) {
    return { error: "Failed to create demo candidate: " + candidateError?.message };
  }

  const { data: application, error: applicationError } = await supabase
    .from("applications")
    .insert({ candidate_id: candidate.id, job_id: jobId, status: "pending" })
    .select("id")
    .single();

  if (applicationError || !application) {
    return { error: "Failed to create application: " + applicationError?.message };
  }

  redirect(`/assess/${application.id}`);
}
