"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n";

type Mode = "signIn" | "signUp";
type Role = "hr" | "candidate";

const ROLES: Role[] = ["hr", "candidate"];

export default function AuthForm({
  defaultRole,
  allowRoleChoice = false,
  redirectTo,
  role: controlledRole,
  onRoleChange,
}: {
  defaultRole: Role;
  /** Candidate's own login page pins the role; the shared /login lets you pick. */
  allowRoleChoice?: boolean;
  /** Where middleware wanted to send an HR user before it bounced them here. */
  redirectTo?: string;
  /** Controlled role, so a parent (e.g. the shared /login page) can drive the
   * side panel and the form's role toggle from the same piece of state. */
  role?: Role;
  onRoleChange?: (role: Role) => void;
}) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>("signIn");
  const [uncontrolledRole, setUncontrolledRole] = useState<Role>(defaultRole);
  const role = controlledRole ?? uncontrolledRole;
  const setRole = onRoleChange ?? setUncontrolledRole;
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function destinationFor(target: Role) {
    return target === "hr" ? redirectTo || "/hr/jobs" : "/candidate";
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setInfo(null);

    if (mode === "signUp" && password !== confirmPassword) {
      setError(t("auth.passwordMismatch"));
      return;
    }

    setIsSubmitting(true);

    const supabase = createBrowserSupabaseClient();

    try {
      if (mode === "signUp") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: fullName ? { data: { full_name: fullName } } : undefined,
        });
        if (signUpError) {
          setError(signUpError.message);
          return;
        }
        if (!data.session) {
          // Email confirmation is on for this Supabase project — no session
          // yet, so we can't write the profiles row (RLS requires auth.uid()).
          setInfo(t("auth.confirmEmailSent"));
          return;
        }
        await supabase.from("profiles").insert({ id: data.user!.id, role });
        window.location.href = destinationFor(role);
        return;
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
        return;
      }

      // The stored role wins over whatever is selected here: an existing
      // account shouldn't switch sides just because of the toggle's position.
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      let effectiveRole = (profile?.role as Role | undefined) ?? null;
      if (!effectiveRole) {
        await supabase.from("profiles").insert({ id: data.user.id, role });
        effectiveRole = role;
      }

      window.location.href = destinationFor(effectiveRole);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    const supabase = createBrowserSupabaseClient();
    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("role", role);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl.toString() },
    });
  }

  return (
    <Card className="w-full max-w-sm border-none shadow-none">
      <CardHeader className="px-0 pt-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          {role === "hr" ? t("auth.roleHr") : t("auth.roleCandidate")}
        </p>
        <CardTitle className="font-heading text-2xl">
          {role === "hr" ? t("auth.hrTitle") : t("auth.candidateTitle")}
        </CardTitle>
        <CardDescription>
          {mode === "signIn" ? t("auth.signInSubtitle") : t("auth.signUpSubtitle")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 px-0 pb-0">
        {allowRoleChoice && (
          <div className="space-y-2">
            <Label id="role-label">{t("auth.roleLabel")}</Label>
            <div
              role="group"
              aria-labelledby="role-label"
              className="grid grid-cols-2 gap-1 rounded-md border border-border p-1"
            >
              {ROLES.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setRole(code)}
                  aria-pressed={role === code}
                  disabled={isSubmitting}
                  className={cn(
                    "rounded px-3 py-1.5 text-sm transition-colors",
                    role === code
                      ? "bg-primary font-medium text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t(code === "hr" ? "auth.roleHr" : "auth.roleCandidate")}
                </button>
              ))}
            </div>
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogle}
          disabled={isSubmitting}
        >
          <GoogleIcon />
          {t("auth.google")}
        </Button>

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-[10px] font-semibold tracking-wide text-muted-foreground">{t("auth.or")}</span>
          <Separator className="flex-1" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signUp" && (
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t("auth.fullName")}
              </Label>
              <Input
                id="fullName"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("auth.email")}
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {t("auth.password")}
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "signIn" ? "current-password" : "new-password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          {mode === "signUp" ? (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t("auth.confirmPassword")}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          ) : null}

          {error && (
            <p role="alert" className="rounded-md border border-border bg-muted px-3 py-2 text-sm">
              {error}
            </p>
          )}
          {info && (
            <p role="status" className="rounded-md border border-border bg-muted px-3 py-2 text-sm">
              {info}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {mode === "signIn" ? t("auth.signIn") : t("auth.signUp")}
          </Button>
        </form>

        <button
          type="button"
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
          onClick={() => {
            setMode(mode === "signIn" ? "signUp" : "signIn");
            setError(null);
            setInfo(null);
          }}
        >
          {mode === "signIn" ? t("auth.switchToSignUp") : t("auth.switchToSignIn")}
        </button>

        <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
          {t("auth.termsNotice")}
        </p>
      </CardContent>
    </Card>
  );
}

// Google's mark must keep its official colours, so these are hardcoded rather
// than drawn from the design tokens in globals.css.
function GoogleIcon() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden focusable="false">
      <path
        fill="#4285F4"
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.859-3.048.859-2.344 0-4.328-1.583-5.036-3.71H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71a5.41 5.41 0 0 1 0-3.42V4.958H.957a9 9 0 0 0 0 8.084l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.346l2.582-2.582C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}
