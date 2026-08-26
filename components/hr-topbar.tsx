"use client";

import { usePathname } from "next/navigation";
import { Bell, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import UserAvatar from "@/components/user-avatar";

// Slim breadcrumb bar above every HR page's own content heading, matching
// the reference (design-handoff/UI_SkillSync/hr_*.png): "SkillSync / <page>"
// plus a refresh button, a notification bell (static — no notification
// system exists yet, so it's decorative rather than wired to fake data),
// and the signed-in user's avatar.
const ROUTE_LABELS: Record<string, string> = {
  "/hr/jobs": "nav.jobs",
  "/hr/new-job": "nav.newJob",
  "/hr/candidates": "nav.candidates",
  "/hr/assessments": "nav.assessments",
  "/hr/settings": "nav.settings",
  "/hr/dev-tools": "nav.devTools",
};

function labelForPath(pathname: string): string {
  if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname];
  if (pathname.startsWith("/hr/dashboard")) return "nav.dashboard";
  if (pathname.startsWith("/hr/candidates/")) return "candidates.profileTitle";
  if (pathname.startsWith("/hr/assessments/")) return "nav.assessments";
  if (pathname.startsWith("/hr/jobs/") && pathname.endsWith("/edit")) return "editJob.title";
  return "nav.jobs";
}

export default function HrTopbar({
  userName,
  userEmail,
  avatarUrl,
}: {
  userName: string | null;
  userEmail: string | null;
  avatarUrl: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-card px-6 py-3">
      <div className="min-w-0">
        <p className="truncate text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{t("app.name")}</span>
          <span className="mx-1">/</span>
          {t(labelForPath(pathname))}
        </p>
        <p className="truncate font-heading text-xl font-bold tracking-tight text-foreground">
          {t(labelForPath(pathname))}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => router.refresh()}
          aria-label={t("nav.refresh")}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden />
        </button>
        <button
          type="button"
          aria-label={t("nav.notifications")}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <Bell className="h-3.5 w-3.5" aria-hidden />
        </button>
        <UserAvatar name={userName} email={userEmail} avatarUrl={avatarUrl} size={32} />
      </div>
    </header>
  );
}
