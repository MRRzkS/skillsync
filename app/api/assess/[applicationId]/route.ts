import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { scoreCandidateAssessment } from "@/lib/ai/scoring-engine";
import type { Transcript } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { applicationId: string } }
) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("applications")
    .select("id, job_id, candidate_id, status, match_score, transcript")
    .eq("id", params.applicationId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const { data: job } = await supabase
    .from("job_vacancies")
    .select("title, scenarios")
    .eq("id", data.job_id)
    .single();

  return NextResponse.json({ ...data, job });
}

// Programmatic submit endpoint (equivalent to finalizeAssessmentAction), for
// the candidate module to call directly instead of using the bare-bones page.
export async function POST(
  req: Request,
  { params }: { params: { applicationId: string } }
) {
  const body = await req.json().catch(() => null);
  const answers: string[] = Array.isArray(body?.answers) ? body.answers : [];

  if (answers.length === 0) {
    return NextResponse.json({ error: "answers array is required" }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();

  const { data: application, error: appError } = await supabase
    .from("applications")
    .select("id, candidate_id, job_id")
    .eq("id", params.applicationId)
    .single();

  if (appError || !application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const [{ data: candidate }, { data: job }] = await Promise.all([
    supabase
      .from("candidate_profiles")
      .select("cv_json")
      .eq("id", application.candidate_id)
      .single(),
    supabase
      .from("job_vacancies")
      .select("title, jd_text, scenarios")
      .eq("id", application.job_id)
      .single(),
  ]);

  if (!candidate || !job) {
    return NextResponse.json(
      { error: "Candidate profile or job vacancy not found" },
      { status: 404 }
    );
  }

  let result;
  try {
    result = await scoreCandidateAssessment({
      cvJson: candidate.cv_json,
      jdText: job.jd_text,
      jobTitle: job.title,
      questions: job.scenarios,
      answers,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI scoring failed" },
      { status: 502 }
    );
  }

  const transcript: Transcript = {
    entries: result.entries,
    pitch_summary: result.pitch_summary,
  };

  const { error: updateError } = await supabase
    .from("applications")
    .update({ match_score: result.match_score, transcript, status: "completed" })
    .eq("id", params.applicationId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ match_score: result.match_score, transcript });
}
