import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CandidateSettingsView } from "@/components/candidate/settings-view";
import type { CvData } from "@/lib/candidate/cv-schema";

export const dynamic = "force-dynamic";

// The (app) layout already enforces auth; this just reads the current values.
export default async function CandidateSettingsPage() {
  const authSupabase = createAuthServerClient();
  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  const metadata = user?.user_metadata ?? {};

  // Location/LinkedIn/Portfolio live on the CV (candidate_profiles.cv_json),
  // not on the auth user — so Settings reads them for display only, rather
  // than duplicating a second editable copy that could drift from the CV.
  let cv: CvData | null = null;
  if (user) {
    const supabase = createServerSupabaseClient();
    const { data: candidate } = await supabase
      .from("candidate_profiles")
      .select("cv_json")
      .eq("user_id", user.id)
      .maybeSingle();
    cv = (candidate?.cv_json as CvData | undefined) ?? null;
  }

  return (
    <CandidateSettingsView
      email={user?.email ?? ""}
      fullName={metadata.full_name ?? metadata.name ?? ""}
      phone={metadata.phone ?? ""}
      location={cv?.contact.location ?? ""}
      linkedin={cv?.contact.linkedin ?? ""}
      portfolio={cv?.contact.portfolio ?? ""}
    />
  );
}
