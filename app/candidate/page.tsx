import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { signOut } from "@/actions/sign-out";
import UserAvatar from "@/components/user-avatar";

export const dynamic = "force-dynamic";

// Placeholder landing after candidate login — the real Candidate module UI
// (/candidate/*) is out of scope for this repo; this page only exists so the
// login redirect has somewhere valid to land, and to prove the session works.
// Left unlocalized on purpose, same as /assess/[applicationId].
export default async function CandidatePlaceholderPage() {
  const supabase = createAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/candidate/login");

  const metadata = user.user_metadata ?? {};
  const name = metadata.full_name ?? metadata.name ?? null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <UserAvatar
        name={name}
        email={user.email}
        avatarUrl={metadata.avatar_url ?? metadata.picture ?? null}
        size={64}
      />
      <div className="space-y-1">
        <p className="font-medium">Signed in as {name || user.email}</p>
        <p className="max-w-prose text-sm text-muted-foreground">
          The candidate dashboard is being built by the Candidate module team.
        </p>
      </div>
      <form action={signOut.bind(null, "/candidate/login")}>
        <button
          type="submit"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" aria-hidden />
          Log out
        </button>
      </form>
    </div>
  );
}
