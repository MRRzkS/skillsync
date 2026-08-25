"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { buildTranscriptEntries } from "@/lib/ai/scoring-engine";
import type { Transcript } from "@/lib/types";

/**
 * Progressive save: called after each answer so a dropped connection
 * doesn't lose earlier answers (FRD exception for FR-003). Stores answers
 * as a partial transcript with status 'in_progress' — no scoring yet.
 *
 * The questions are looked up here rather than accepted from the client:
 * they're what HR reads next to the answers if this assessment never
 * finishes, so they have to come from the job vacancy itself.
 */
export async function saveDraftAnswerAction(params: {
  applicationId: string;
  answers: string[];
}): Promise<{ error?: string }> {
  const supabase = createServerSupabaseClient();

  const { data: application } = await supabase
    .from("applications")
    .select("job_id")
    .eq("id", params.applicationId)
    .single();

  if (!application) return { error: "Application not found" };

  const { data: job } = await supabase
    .from("job_vacancies")
    .select("scenarios")
    .eq("id", application.job_id)
    .single();

  const draftTranscript: Transcript = {
    entries: buildTranscriptEntries({
      questions: job?.scenarios ?? [],
      answers: params.answers,
    }),
  };

  const { error } = await supabase
    .from("applications")
    .update({ transcript: draftTranscript, status: "in_progress" })
    .eq("id", params.applicationId);

  if (error) return { error: error.message };
  return {};
}
