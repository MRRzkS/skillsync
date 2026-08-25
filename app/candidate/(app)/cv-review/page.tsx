import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, AlertTriangle, ArrowRight, Sparkles } from "lucide-react";
import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { reviewCvWithStar } from "@/lib/ai/cv-star-review";
import { Button } from "@/components/candidate/ui/button";
import { Badge } from "@/components/candidate/ui/badge";
import type { CvData } from "@/lib/candidate/cv-schema";

export const dynamic = "force-dynamic";

// New feature, separate from the Candidate team's own wizard/preview code —
// reads the CV they already saved and reviews it with AI using the STAR
// method, so a candidate can see strengths/weaknesses before applying to
// jobs and taking the AI assessment. Doesn't modify anything of theirs.
export default async function CvReviewPage() {
  const authSupabase = createAuthServerClient();
  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) redirect("/candidate/login");

  const supabase = createServerSupabaseClient();
  const { data: candidate } = await supabase
    .from("candidate_profiles")
    .select("cv_json")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!candidate) redirect("/candidate/resume-builder");

  const cv = candidate.cv_json as CvData;

  let review;
  let reviewError: string | null = null;
  try {
    review = await reviewCvWithStar(cv);
  } catch (err) {
    reviewError =
      err instanceof Error ? err.message : "Couldn't review your CV right now.";
  }

  return (
    <main className="min-h-screen bg-cloud">
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-8 lg:px-8 lg:pt-12">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-ocean-600 to-sync-purple-600">
            <Sparkles className="h-[18px] w-[18px] text-white" />
          </div>
          <h1 className="font-candidate-heading text-xl font-bold text-text-dark">
            CV Review
          </h1>
        </div>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-gray">
          Before you apply, here&apos;s how your CV holds up against the STAR
          method (Situation, Task, Action, Result) — the same lens recruiters
          use to judge real impact, not just duties.
        </p>

        {reviewError ? (
          <div className="mt-8 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-red-200 bg-white px-6 py-12 text-center">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <p className="text-sm font-medium text-text-dark">
              Couldn&apos;t review your CV right now
            </p>
            <p className="max-w-xs text-sm text-text-gray">{reviewError}</p>
            <Button variant="outline-soft" size="sm" className="mt-2" asChild>
              <Link href="/candidate/cv-review">Try again</Link>
            </Button>
          </div>
        ) : review ? (
          <div className="mt-8 space-y-6">
            <div className="rounded-2xl border border-ocean-100/60 bg-white p-6 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-text-dark">
                  Overall CV Strength
                </p>
                <Badge variant={review.overall_score >= 70 ? "mint" : "ocean"}>
                  {review.overall_score}/100
                </Badge>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-text-gray">
                {review.overall_feedback}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-ocean-100/60 bg-white p-5 shadow-card">
                <p className="text-xs font-semibold uppercase tracking-wide text-ocean-700">
                  Strengths
                </p>
                <ul className="mt-3 space-y-2">
                  {review.strengths.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text-dark">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mint-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-ocean-100/60 bg-white p-5 shadow-card">
                <p className="text-xs font-semibold uppercase tracking-wide text-sync-purple-600">
                  Opportunities
                </p>
                <ul className="mt-3 space-y-2">
                  {review.weaknesses.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text-dark">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sync-purple-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {review.bullet_feedback.length > 0 && (
              <div className="rounded-2xl border border-ocean-100/60 bg-white p-6 shadow-card">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-gray">
                  Bullet-by-Bullet STAR Check
                </p>
                <div className="mt-4 space-y-4">
                  {review.bullet_feedback.map((item, i) => (
                    <div key={i} className="border-t border-ocean-100/70 pt-4 first:border-t-0 first:pt-0">
                      <p className="text-xs font-medium text-text-gray">{item.role}</p>
                      <p className="mt-1 text-sm text-text-dark">&ldquo;{item.bullet}&rdquo;</p>
                      <div className="mt-2 flex items-start gap-2">
                        <Badge variant={item.follows_star ? "mint" : "outline-soft"}>
                          {item.follows_star ? "Follows STAR" : "Needs work"}
                        </Badge>
                      </div>
                      {item.suggestion && (
                        <p className="mt-2 text-sm leading-relaxed text-text-gray">
                          {item.suggestion}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-ocean-100/70 pt-6">
          <Button variant="ai" asChild className="gap-2">
            <Link href="/candidate/jobs">
              Continue to Jobs <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline-soft" asChild>
            <Link href="/candidate/resume-builder">Edit My CV</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
