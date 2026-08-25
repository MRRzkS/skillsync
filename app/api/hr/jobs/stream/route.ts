import { streamObject } from "ai";
import { createOpenRouterProvider, OPENROUTER_MODEL } from "@/lib/ai/openrouter";
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

  if (!id || !title || !jdText) {
    return new Response(
      JSON.stringify({ error: "id, title and jd_text are required" }),
      { status: 400 }
    );
  }

  const openrouter = createOpenRouterProvider();
  const { system, user } = buildScenarioPrompt({ title, jdText, locale });

  const result = streamObject({
    model: openrouter(OPENROUTER_MODEL),
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
