import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Exchanges a Google OAuth code for a session, then ensures a `profiles` row
// exists for this user. `role` comes from which login page started the OAuth
// flow, but only applies on first sign-in — an existing profile's role always
// wins, so clicking "Continue with Google" from the other login page can't
// silently change an existing user's role.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const role = searchParams.get("role") === "candidate" ? "candidate" : "hr";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

  const cookiesToApply: { name: string; value: string; options?: Record<string, unknown> }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToApply.push(...cookiesToSet);
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  const finalRole = existingProfile?.role ?? role;

  if (!existingProfile) {
    await supabase.from("profiles").insert({ id: data.user.id, role });
  }

  // Same mismatch case as the password flow in auth-form.tsx: an existing
  // account's real role can differ from the entrance used to start Google
  // OAuth. Send them to an explanation instead of silently landing on their
  // real dashboard.
  const destination =
    existingProfile && finalRole !== role
      ? `/role-mismatch?role=${finalRole}`
      : finalRole === "hr"
        ? "/hr/jobs"
        : "/candidate";
  const redirectResponse = NextResponse.redirect(`${origin}${destination}`);
  cookiesToApply.forEach(({ name, value, options }) =>
    redirectResponse.cookies.set(name, value, options)
  );
  return redirectResponse;
}
