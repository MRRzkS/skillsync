import { NextResponse } from "next/server";
import { createAuthServerClient } from "@/lib/supabase/auth-server";

/**
 * Gate for HR-only route handlers. Returns `null` when the caller may
 * proceed, otherwise the error Response to return as-is.
 *
 * Route handlers guard themselves rather than going through middleware:
 * middleware answers with an HTML redirect to /login, which is the wrong
 * reply to an API call. It also only matches /hr/:path*, so nothing under
 * /api ever reaches it.
 *
 * Fails open when no profile row exists, matching app/hr/layout.tsx — a
 * half-finished signup shouldn't lock an HR user out of their own data.
 */
export async function requireHrUser(): Promise<NextResponse | null> {
  const supabase = createAuthServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "candidate") {
    return NextResponse.json({ error: "HR access required" }, { status: 403 });
  }

  return null;
}
