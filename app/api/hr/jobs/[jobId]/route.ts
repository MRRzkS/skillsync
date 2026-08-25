import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { generateScenarioQuestions } from "@/lib/ai/scenario-generator";
import { requireHrUser } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { jobId: string } }
) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("job_vacancies")
    .select("*")
    .eq("id", params.jobId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

// Edits a job's title/JD, optionally regenerating its 3 scenario questions
// (FR-002) when the JD text actually changed enough to warrant it.
//
// HR-only: unlike the GET above (and the documented external contract routes),
// this mutates a database shared with the Candidate module team.
export async function PATCH(
  req: Request,
  { params }: { params: { jobId: string } }
) {
  const denied = await requireHrUser();
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  const title = String(body?.title ?? "").trim();
  const jdText = String(body?.jd_text ?? "").trim();
  const regenerate = Boolean(body?.regenerate);
  const locale = typeof body?.locale === "string" ? body.locale : null;

  if (!title || !jdText) {
    return NextResponse.json(
      { error: "title and jd_text are required" },
      { status: 400 }
    );
  }

  const update: Record<string, unknown> = { title, jd_text: jdText };

  if (regenerate) {
    try {
      update.scenarios = await generateScenarioQuestions({ title, jdText, locale });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "AI generation failed" },
        { status: 502 }
      );
    }
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("job_vacancies")
    .update(update)
    .eq("id", params.jobId)
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to update job" },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

// Deletes a job and its applications. Never touches candidate_profiles —
// those rows are shared with the Candidate module and outlive any one job.
export async function DELETE(
  _req: Request,
  { params }: { params: { jobId: string } }
) {
  const denied = await requireHrUser();
  if (denied) return denied;

  const supabase = createServerSupabaseClient();

  const { error: applicationsError } = await supabase
    .from("applications")
    .delete()
    .eq("job_id", params.jobId);

  if (applicationsError) {
    return NextResponse.json({ error: applicationsError.message }, { status: 500 });
  }

  const { error: jobError } = await supabase
    .from("job_vacancies")
    .delete()
    .eq("id", params.jobId);

  if (jobError) {
    return NextResponse.json({ error: jobError.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
