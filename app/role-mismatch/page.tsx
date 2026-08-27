"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n";

type Role = "hr" | "candidate";

// Reached when someone signs in with the role toggle set differently from
// their account's actual stored role (e.g. an HR account picking "Candidate"
// on /login, or vice versa). Previously this case redirected silently to the
// correct side with no explanation — this page tells them what happened and
// gives two explicit ways forward instead.
export default function RoleMismatchPage() {
  return (
    <Suspense fallback={null}>
      <RoleMismatchContent />
    </Suspense>
  );
}

function RoleMismatchContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const actualRole: Role = searchParams.get("role") === "candidate" ? "candidate" : "hr";
  const [isSigningOut, setIsSigningOut] = useState(false);

  const dashboardHref = actualRole === "hr" ? "/hr/jobs" : "/candidate";
  const loginHref = actualRole === "hr" ? "/candidate/login" : "/login";

  async function handleCreateNewAccount() {
    setIsSigningOut(true);
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    window.location.href = loginHref;
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md space-y-5 p-8 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-warning" aria-hidden />
        <div className="space-y-2">
          <h1 className="text-xl font-semibold tracking-tight">
            {t("roleMismatch.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t(
              actualRole === "hr"
                ? "roleMismatch.bodyHr"
                : "roleMismatch.bodyCandidate"
            )}
          </p>
        </div>
        <div className="space-y-2">
          <Button asChild className="w-full">
            <a href={dashboardHref}>{t("roleMismatch.goToDashboard")}</a>
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleCreateNewAccount}
            disabled={isSigningOut}
          >
            {isSigningOut
              ? t("roleMismatch.signingOut")
              : t("roleMismatch.createNewAccount")}
          </Button>
        </div>
      </Card>
    </main>
  );
}
