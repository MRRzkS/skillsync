import { redirect } from "next/navigation";
import { createAuthServerClient } from "@/lib/supabase/auth-server";
import LoginView from "./login-view";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { redirectTo?: string };
}) {
  const supabase = createAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    redirect(
      profile?.role === "candidate"
        ? "/candidate"
        : searchParams.redirectTo || "/hr/jobs"
    );
  }

  return <LoginView redirectTo={searchParams.redirectTo} />;
}
