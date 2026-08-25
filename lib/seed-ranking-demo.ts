import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DEMO_RANKING_JOB,
  DEMO_RANKING_QUESTIONS,
  DEMO_RANKING_CANDIDATES,
} from "./demo-data";
import type { Transcript } from "./types";

export type SeedRankingResult = {
  jobId: string;
  candidateIds: string[];
  applicationIds: string[];
};

/**
 * Creates one job vacancy plus several already-scored candidates so the HR
 * ranking dashboard can be demoed instantly, with no AI calls involved.
 *
 * Shared by the CLI script (`npm run seed:ranking`) and the dev-tools button so
 * the two can't drift. Returns every id it created — callers should surface
 * these so the rows can be cleaned up precisely later.
 */
export async function seedRankingDemo(
  supabase: SupabaseClient
): Promise<SeedRankingResult> {
  const { data: job, error: jobError } = await supabase
    .from("job_vacancies")
    .insert({
      title: DEMO_RANKING_JOB.title,
      jd_text: DEMO_RANKING_JOB.jd_text,
      scenarios: DEMO_RANKING_QUESTIONS,
    })
    .select("id")
    .single();

  if (jobError || !job) {
    throw new Error(`Failed to create demo job: ${jobError?.message}`);
  }

  const candidateIds: string[] = [];
  const applicationIds: string[] = [];

  for (const candidate of DEMO_RANKING_CANDIDATES) {
    const { data: profile, error: profileError } = await supabase
      .from("candidate_profiles")
      .insert({
        full_name: candidate.full_name,
        cv_json: candidate.cv_json,
      })
      .select("id")
      .single();

    if (profileError || !profile) {
      throw new Error(
        `Failed to create candidate ${candidate.full_name}: ${profileError?.message}`
      );
    }
    candidateIds.push(profile.id);

    const transcript: Transcript = {
      entries: DEMO_RANKING_QUESTIONS.map((q) => ({
        question: q.question,
        focus_area: q.focus_area,
        answer: "(seeded demo answer)",
        feedback: "(seeded demo feedback)",
      })),
      pitch_summary: candidate.pitch_summary,
    };

    const { data: application, error: applicationError } = await supabase
      .from("applications")
      .insert({
        candidate_id: profile.id,
        job_id: job.id,
        match_score: candidate.match_score,
        transcript,
        status: "completed",
      })
      .select("id")
      .single();

    if (applicationError || !application) {
      throw new Error(
        `Failed to create application for ${candidate.full_name}: ${applicationError?.message}`
      );
    }
    applicationIds.push(application.id);
  }

  return { jobId: job.id, candidateIds, applicationIds };
}
