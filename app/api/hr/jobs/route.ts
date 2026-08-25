import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateScenarioQuestions } from "@/lib/ai/scenario-generator";

// Job list changes on every POST, so never serve a cached response.
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("job_vacancies")
    .select("id, title, jd_text, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// Programmatic equivalent of the /hr/new-job form, for the candidate module
// or other services to create a job vacancy without going through the UI.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const title = String(body?.title ?? "").trim();
  const jdText = String(body?.jd_text ?? "").trim();

  if (!title || !jdText) {
    return NextResponse.json(
      { error: "title and jd_text are required" },
      { status: 400 }
    );
  }

  let scenarios;
  try {
    scenarios = await generateScenarioQuestions({ title, jdText });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI generation failed" },
      { status: 502 }
    );
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("job_vacancies")
    .insert({ title, jd_text: jdText, scenarios })
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to save job" },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 201 });
}
