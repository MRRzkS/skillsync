import { streamObject } from "ai";
import { createOpenRouterProvider, OPENROUTER_MODEL } from "@/lib/ai/openrouter";
import { createGeminiProvider, GEMINI_MODEL } from "@/lib/ai/gemini";
import { scenarioQuestionsSchema } from "@/lib/ai/schemas";
import { buildScenarioPrompt } from "@/lib/ai/scenario-generator";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Streaming counterpart of POST /api/hr/jobs, used only by our own
// /hr/new-job page (useObject) so the 3 scenario questions appear
// progressively instead of after a single ~30-60s wait. The external API
// contract for the Candidate module stays non-streaming at /api/hr/jobs.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const id = String(body?.id ?? "");
  const title = String(body?.title ?? "").trim();
  const jdText = String(body?.jd_text ?? "").trim();
  const locale = typeof body?.locale === "string" ? body.locale : null;
  const useFallback = Boolean(body?.fallback);

  if (!id || !title || !jdText) {
    return new Response(
      JSON.stringify({ error: "id, title and jd_text are required" }),
      { status: 400 }
    );
  }

  // OpenRouter's free tier rate-limits hard. Unlike generateJson, a
  // streaming request already has bytes on the wire the moment it starts, so
  // we can't switch models mid-stream — instead the client retries once with
  // `fallback: true` when the first attempt's onError fires (see
  // app/hr/new-job/page.tsx), and we honor that by using Gemini here.
  const model = useFallback
    ? createGeminiProvider()(GEMINI_MODEL)
    : createOpenRouterProvider()(OPENROUTER_MODEL);
  const { system, user } = buildScenarioPrompt({ title, jdText, locale });

  const result = streamObject({
    model,
    schema: scenarioQuestionsSchema,
    temperature: 0.4,
    system,
    prompt: user,
    onFinish: async ({ object }) => {
      if (!object) return; // schema validation failed — nothing to save
      const supabase = createServerSupabaseClient();
      await supabase.from("job_vacancies").insert({
        id,
        title,
        jd_text: jdText,
        scenarios: object.questions,
      });
    },
  });

  return result.toTextStreamResponse();
}
