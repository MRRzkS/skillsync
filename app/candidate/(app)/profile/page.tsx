import { redirect } from "next/navigation";
import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CandidateProfileView } from "@/components/candidate/profile-view";
import type { CvData } from "@/lib/candidate/cv-schema";

export const dynamic = "force-dynamic";

// "My Profile" from the reference (design-handoff/UI_SkillSync/
// kandidat_lihat-profile.png): the candidate's own CV rendered as a profile
// page rather than a document. No CV saved yet means there's nothing to show,
// so send them to the builder — same as /candidate/cv-review does.
export default async function CandidateProfilePage() {
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

  return <CandidateProfileView cv={candidate.cv_json as CvData} />;
}
