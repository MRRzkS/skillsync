import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireHrUser } from "@/lib/auth-guard";

// match_score/status change every time a candidate finishes their
// assessment, so this must never serve a cached response.
export const dynamic = "force-dynamic";

// HR-only: this returns every applicant's score, transcript and full CV for a
// job. It is not part of the external contract the Candidate module consumes
// (that's /api/hr/jobs, /api/assess/[id] and /api/applications), and our own
// dashboard reads Supabase directly, so gating it costs nothing.
export async function GET(
  _req: Request,
  { params }: { params: { jobId: string } }
) {
  const denied = await requireHrUser();
  if (denied) return denied;

  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("applications")
    .select("*, candidate_profiles(*)")
    .eq("job_id", params.jobId)
    .order("match_score", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
