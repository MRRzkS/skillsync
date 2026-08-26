"use client";

import { usePathname, useRouter } from "next/navigation";
import { Bell, LogOut, RefreshCw } from "lucide-react";
import { signOut } from "@/actions/sign-out";
import { WIZARD_STEP_KEYS, useWizardNav } from "@/components/candidate/layout/wizard-nav";
import { useTranslation } from "@/lib/i18n";

// Breadcrumb bar above every candidate page, matching the reference
// (design-handoff/UI_SkillSync/kandidat_*.png). Two chips from the reference
// are deliberately not reproduced: the "Desktop / HP" toggle is a prototype
// viewport control rather than a product feature, and the "Draft tersimpan"
// pill would be a permanent claim with nothing behind it — the builder has no
// autosave. The bell is decorative for the same reason: no notification
// system exists on this side yet, so it isn't wired to fake data.

export function Topbar({ initial }: { initial: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const { currentStep } = useWizardNav();

  const onBuilder = pathname === "/candidate/resume-builder";
  const title = onBuilder
    ? t(`candidate.steps.${WIZARD_STEP_KEYS[currentStep] ?? "personal"}`)
    : pathname.startsWith("/candidate/jobs")
      ? t("candidate.navJobs")
      : pathname.startsWith("/candidate/settings")
        ? t("nav.settings")
        : pathname.startsWith("/candidate/profile")
          ? t("candidate.profile.title")
          : pathname.startsWith("/candidate/cv-preview")
            ? t("candidate.cvPreview.title")
            : t("candidate.navReview");

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-ocean-100/70 bg-white/90 px-4 py-3 backdrop-blur lg:px-6">
      <div className="min-w-0">
        <p className="truncate text-xs text-text-gray">
          <span className="font-semibold text-text-dark">Skillsync</span>
          <span className="mx-1">/</span>
          {title}
        </p>
        <p className="truncate font-candidate-heading text-xl font-bold text-text-dark">{title}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => router.refresh()}
          aria-label={t("nav.refresh")}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-ocean-100 text-text-gray transition-colors hover:bg-ocean-50 hover:text-ocean-700"
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
        </button>
        <span className="relative hidden h-9 w-9 items-center justify-center rounded-full border border-ocean-100 text-text-gray sm:flex">
          <Bell className="h-4 w-4" aria-hidden />
          <span className="sr-only">{t("nav.notifications")}</span>
        </span>
        <form action={signOut.bind(null, "/candidate/login")}>
          <button
            type="submit"
            title={t("candidate.signOut")}
            className="group flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-ocean-600 to-sync-purple-600 font-candidate-heading text-sm font-semibold text-white"
          >
            <span className="group-hover:hidden">{initial}</span>
            <LogOut className="hidden h-4 w-4 group-hover:block" aria-hidden />
          </button>
        </form>
      </div>
    </header>
  );
}
