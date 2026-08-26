import { redirect } from "next/navigation";
import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { reviewCvWithStar, type StarReview } from "@/lib/ai/cv-star-review";
import { CvReviewView } from "@/components/candidate/cv-review-view";
import type { CvData } from "@/lib/candidate/cv-schema";

export const dynamic = "force-dynamic";

// New feature, separate from the Candidate team's own wizard/preview code —
// reads the CV they already saved and reviews it with AI using the STAR
// method, so a candidate can see strengths/weaknesses before applying to
// jobs and taking the AI assessment. Doesn't modify anything of theirs.
//
// Thin server component → client view, the same split used on the HR side:
// locale lives in localStorage, so the rendering half has to be client-side.
//
// save-cv already kicks off this review in the background right after a CV
// is saved (see app/api/candidate/save-cv/route.ts), so the common case here
// is just reading the cached star_review column — not calling the model
// again on every visit. Only missing/failed background runs fall back to a
// synchronous generate, which then gets persisted so the next visit is cached
// too.
export default async function CvReviewPage() {
  const authSupabase = createAuthServerClient();
  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) redirect("/candidate/login");

  const supabase = createServerSupabaseClient();
  const { data: candidate } = await supabase
    .from("candidate_profiles")
    .select("id, cv_json, star_review")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!candidate) redirect("/candidate/resume-builder");

  const cv = candidate.cv_json as CvData;

  let review: StarReview | null = (candidate.star_review as StarReview | null) ?? null;
  let reviewError: string | null = null;

  if (!review) {
    try {
      review = await reviewCvWithStar(cv);
      await supabase
        .from("candidate_profiles")
        .update({ star_review: review })
        .eq("id", candidate.id);
    } catch (err) {
      reviewError =
        err instanceof Error ? err.message : "Couldn't review your CV right now.";
    }
  }

  return <CvReviewView review={review} reviewError={reviewError} />;
}
