import { streamObject } from "ai";
import { createOpenRouterProvider, OPENROUTER_MODEL } from "@/lib/ai/openrouter";
import { createGeminiProvider, GEMINI_MODEL } from "@/lib/ai/gemini";
import { scoringResultSchema } from "@/lib/ai/schemas";
import { buildScoringPrompt, buildTranscriptEntries } from "@/lib/ai/scoring-engine";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Transcript } from "@/lib/types";

// Streaming counterpart of POST /api/assess/[applicationId], used only by
// our own /assess/[applicationId] page (useObject) so per-question feedback
// and the final match_score appear progressively instead of after a single
// ~30-60s wait. The external API contract for the Candidate module stays
// non-streaming at /api/assess/[applicationId].
export async function POST(
  req: Request,
  { params }: { params: { applicationId: string } }
) {
  const body = await req.json().catch(() => null);
  const answers: string[] = Array.isArray(body?.answers) ? body.answers : [];
  const useFallback = Boolean(body?.fallback);

  if (answers.length === 0) {
    return new Response(JSON.stringify({ error: "answers array is required" }), {
      status: 400,
    });
  }

  const supabase = createServerSupabaseClient();

  const { data: application, error: appError } = await supabase
    .from("applications")
    .select("id, candidate_id, job_id")
    .eq("id", params.applicationId)
    .single();

  if (appError || !application) {
    return new Response(JSON.stringify({ error: "Application not found" }), {
      status: 404,
    });
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
    return new Response(
      JSON.stringify({ error: "Candidate profile or job vacancy not found" }),
      { status: 404 }
    );
  }

  // See app/api/hr/jobs/stream/route.ts for why this is a client-driven
  // retry instead of an in-request fallback.
  const model = useFallback
    ? createGeminiProvider()(GEMINI_MODEL)
    : createOpenRouterProvider()(OPENROUTER_MODEL);
  const { system, user } = buildScoringPrompt({
    cvJson: candidate.cv_json,
    jdText: job.jd_text,
    jobTitle: job.title,
    questions: job.scenarios,
    answers,
  });

  const result = streamObject({
    model,
    schema: scoringResultSchema,
    temperature: 0.2,
    system,
    prompt: user,
    onFinish: async ({ object, error: finishError }) => {
      if (!object) {
        console.error(
          "[assess/stream onFinish] schema validation failed, not saving:",
          finishError
        );
        return;
      }

      // Only `feedback` is trusted from the model here — see
      // buildTranscriptEntries. The client already streamed the live version;
      // this is what HR reads afterwards, so it has to be the real answers.
      const transcript: Transcript = {
        entries: buildTranscriptEntries({
          questions: job.scenarios,
          answers,
          modelEntries: object.entries,
        }),
        pitch_summary: object.pitch_summary,
      };

      const { error: updateError, data: updated } = await supabase
        .from("applications")
        .update({
          match_score: Math.round(object.match_score),
          transcript,
          status: "completed",
        })
        .eq("id", params.applicationId)
        .select("id");

      if (updateError) {
        console.error("[assess/stream onFinish] Supabase update failed:", updateError);
      } else {
        console.log("[assess/stream onFinish] saved, rows updated:", updated?.length);
      }
    },
  });

  return result.toTextStreamResponse();
}
