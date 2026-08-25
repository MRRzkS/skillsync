import { redirect } from "next/navigation";
import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { LocaleProvider } from "@/lib/i18n";
import HrNav from "@/components/hr-nav";

// Shell for every HR-owned screen. The candidate-facing /assess route sits
// outside this layout on purpose — it belongs to the Candidate module's visual
// ownership and is intentionally left unstyled/unlocalized.
//
// middleware.ts already guarantees *someone* is signed in; the role check here
// is what keeps candidates out of the HR portal. It fails open when no profile
// row exists so a half-finished signup can't lock anyone out — the sign-in flow
// backfills that row on the next attempt.
export default async function HrLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    : { data: null };

  if (profile?.role === "candidate") redirect("/candidate");

  const metadata = user?.user_metadata ?? {};

  return (
    <LocaleProvider>
      <div className="flex min-h-screen flex-col md:flex-row">
        <HrNav
          userEmail={user?.email ?? null}
          userName={metadata.full_name ?? metadata.name ?? null}
          avatarUrl={metadata.avatar_url ?? metadata.picture ?? null}
        />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </LocaleProvider>
  );
}
