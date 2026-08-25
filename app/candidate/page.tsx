import { redirect } from "next/navigation";
import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Landing after candidate login. Sends a candidate who already has a CV
// straight to job browsing, and one who doesn't to the builder first —
// this route itself renders nothing, it only decides where to go.
export default async function CandidateLandingPage() {
  const authSupabase = createAuthServerClient();
  const {
    data: { user },
  } = await authSupabase.auth.getUser();

  if (!user) redirect("/candidate/login");

  const supabase = createServerSupabaseClient();
  const { data: profile } = await supabase
    .from("candidate_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  redirect(profile ? "/candidate/jobs" : "/candidate/resume-builder");
}
