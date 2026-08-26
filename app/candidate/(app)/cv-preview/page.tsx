import { redirect } from "next/navigation";
import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CvPreviewView } from "@/components/candidate/cv-preview-view";
import type { CvData } from "@/lib/candidate/cv-schema";

export const dynamic = "force-dynamic";

// "Pratinjau CV" from the reference (kandidat_pratinjau-cv.png) — a real,
// standalone document view with a template picker and PDF download. Distinct
// from the wizard's "Tinjau & Simpan" step, which is a form summary before
// saving; this reads the CV that's already been saved.
export default async function CvPreviewPage() {
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

  return <CvPreviewView cv={candidate.cv_json as CvData} />;
}
