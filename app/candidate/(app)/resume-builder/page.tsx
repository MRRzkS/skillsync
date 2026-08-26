import { CvWizard } from "@/components/candidate/cv-wizard";
import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { CvData } from "@/lib/candidate/cv-schema";

export const dynamic = "force-dynamic";

export default async function ResumeBuilderPage() {
  // Auth itself is already enforced by the (app) layout — this just looks
  // up whether this candidate has a CV already, so a returning visitor
  // (or a refresh) doesn't land on a blank wizard.
  const authSupabase = createAuthServerClient();
  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  let initialCv: CvData | null = null;
  if (user) {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase
      .from("candidate_profiles")
      .select("cv_json")
      .eq("user_id", user.id)
      .maybeSingle();
    initialCv = (data?.cv_json as CvData | undefined) ?? null;
  }

  return (
    // The (app) layout already provides <main> and the page background.
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 lg:px-8">
      <CvWizard initialCv={initialCv} />
    </div>
  );
}
