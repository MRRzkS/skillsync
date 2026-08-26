import { NextRequest, NextResponse } from "next/server";
import { cvSchema, type CvData } from "@/lib/candidate/cv-schema";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { reviewCvWithStar } from "@/lib/ai/cv-star-review";

export const runtime = "nodejs";

interface SaveCvBody {
  cv: unknown;
}

/**
 * Saves a CvData object assembled client-side by the multi-step wizard.
 * Validates against cvSchema and writes to candidate_profiles.
 */
export async function POST(req: NextRequest) {
  let body: SaveCvBody;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = cvSchema.safeParse(body?.cv);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "CV data didn't pass validation.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  try {
    const authSupabase = createAuthServerClient();
    const {
      data: { user },
    } = await authSupabase.auth.getUser();

    const supabase = createServerSupabaseClient();
    const row = {
      full_name: data.contact.fullName || "Unnamed Candidate",
      cv_json: data,
      user_id: user?.id ?? null,
    };

    // A signed-in candidate rebuilding their CV updates the same row instead
    // of piling up duplicates — /candidate/jobs looks up "my CV" by user_id,
    // so there must only ever be one per account.
    const { data: existing } = user
      ? await supabase
          .from("candidate_profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle()
      : { data: null };

    const { data: inserted, error } = existing
      ? await supabase
          .from("candidate_profiles")
          .update(row)
          .eq("id", existing.id)
          .select("id")
          .single()
      : await supabase.from("candidate_profiles").insert(row).select("id").single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "CV generated successfully, but we couldn't save it.", cv: data },
        { status: 502 }
      );
    }

    // Fire-and-forget: review the CV with AI now, off the request/response
    // path, so /candidate/cv-review can read a cached result instead of
    // calling the model on every visit. Not awaited — its own try/catch
    // means a failure here never affects the save response the candidate is
    // waiting on; the review page falls back to generating on the spot if
    // this hasn't finished (or errored) by the time they open it.
    void runBackgroundStarReview(data, inserted.id, supabase);

    return NextResponse.json({ cv: data, candidateId: inserted.id });
  } catch (err) {
    console.error("save-cv failed:", err);
    const message = err instanceof Error ? err.message : "Failed to save CV.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function runBackgroundStarReview(
  cv: CvData,
  candidateId: string,
  supabase: ReturnType<typeof createServerSupabaseClient>
) {
  try {
    const review = await reviewCvWithStar(cv);
    await supabase.from("candidate_profiles").update({ star_review: review }).eq("id", candidateId);
  } catch (err) {
    console.error("Background STAR review failed:", err);
  }
}
