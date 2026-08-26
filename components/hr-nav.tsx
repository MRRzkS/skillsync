"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  Briefcase,
  Eye,
  FilePlus2,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Wrench,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LOCALES, useTranslation, type Locale } from "@/lib/i18n";
import { signOut } from "@/actions/sign-out";
import UserAvatar from "@/components/user-avatar";

// Light sidebar with grouped nav sections, matching the UI team's reference
// screenshots (design-handoff/UI_SkillSync/hr_*.png): white panel, each item
// an icon chip + label, and only the *active* item rendered as a dark
// navy→purple gradient pill.
//
// "Dashboard Skor" is a global entry point (app/hr/dashboard/page.tsx), even
// though the scorecard itself is per-vacancy — it redirects to the most
// recently posted job's dashboard, same job a fresh sign-in would care about
// most, so the nav doesn't need to ask which job first.
//
// `fullPrefetch` is reserved for data-free routes — see next.config.js.
const NAV_GROUPS = [
  {
    label: "nav.groupRecruitment",
    items: [
      { href: "/hr/jobs", labelKey: "nav.jobs", icon: Briefcase, fullPrefetch: false },
      { href: "/hr/new-job", labelKey: "nav.newJob", icon: FilePlus2, fullPrefetch: true },
      { href: "/hr/dashboard", labelKey: "nav.dashboard", icon: BarChart3, fullPrefetch: false },
    ],
  },
  {
    label: "nav.groupCandidates",
    items: [
      { href: "/hr/candidates", labelKey: "nav.candidates", icon: Eye, fullPrefetch: false },
      {
        href: "/hr/assessments",
        labelKey: "nav.assessments",
        icon: MessageSquare,
        fullPrefetch: false,
      },
    ],
  },
  // Dev Tools is dev/demo-only — the route itself 404s in production (see
  // app/hr/dev-tools/page.tsx), so the nav entry is left out there too rather
  // than dangling a link to a page that won't load.
  ...(process.env.NODE_ENV === "production"
    ? []
    : [
        {
          label: "nav.groupSystem",
          items: [
            { href: "/hr/dev-tools", labelKey: "nav.devTools", icon: Wrench, fullPrefetch: false },
          ],
        },
      ]),
  {
    label: "nav.groupAccount",
    items: [
      { href: "/hr/settings", labelKey: "nav.settings", icon: Settings, fullPrefetch: false },
    ],
  },
] satisfies { label: string; items: NavItem[] }[];

type NavItem = {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  fullPrefetch: boolean;
};

const LOCALE_LABELS: Record<Locale, string> = { en: "EN", id: "ID" };

export default function HrNav({
  userEmail,
  userName,
  avatarUrl,
}: {
  userEmail: string | null;
  userName: string | null;
  avatarUrl: string | null;
}) {
  const pathname = usePathname();
  const { t, locale, setLocale } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const navGroups = (
    <>
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {t(group.label)}
          </p>
          <ul className="flex flex-col items-stretch gap-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <li key={item.href} className="w-full">
                  <Link
                    href={item.href}
                    prefetch={item.fullPrefetch ? true : undefined}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition-colors",
                      active
                        ? "font-semibold text-white shadow-sm"
                        : "font-medium text-foreground hover:bg-secondary"
                    )}
                    style={
                      active
                        ? {
                            backgroundImage:
                              "linear-gradient(100deg, hsl(var(--brand-navy)), hsl(var(--brand-accent-purple)))",
                          }
                        : undefined
                    }
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                        active ? "bg-white/15 text-white" : "bg-secondary text-primary"
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span>{t(item.labelKey)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </>
  );

  return (
    <nav className="flex shrink-0 flex-col border-b border-border bg-card md:sticky md:top-0 md:h-screen md:w-64 md:overflow-y-auto md:border-b-0 md:border-r">
      <div className="flex items-center justify-between gap-4 p-4 md:block">
        <Link
          href="/"
          className="hidden items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:flex"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> {t("common.back")}
        </Link>

        <div className="flex w-full items-center justify-between md:mt-6 md:w-auto">
          <Link href="/hr/jobs" className="flex items-center gap-2">
            <Image src="/logo.png" alt="" width={28} height={28} className="shrink-0" priority />
            <p className="font-heading text-lg font-bold tracking-tight text-foreground">
              Skill<span style={{ color: "hsl(var(--brand-accent-purple))" }}>sync</span>
            </p>
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={t("nav.menu")}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground md:hidden"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        <p className="mt-4 hidden text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground md:block">
          {t("nav.module")}
        </p>
        <p className="mt-2 hidden items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm font-semibold text-foreground md:flex">
          <Briefcase className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          {t("auth.hrPanelEyebrow")}
        </p>
      </div>

      {/* Mobile: collapsed behind a hamburger instead of always-visible icons
          — the sidebar has five groups, which as a permanently-open mobile
          strip was either unlabeled icon soup or five stacked rows of mostly
          empty space. A dropdown keeps the header compact and shows full
          labels only when asked for. */}
      {menuOpen && (
        <div className="space-y-5 border-t border-border px-3 py-4 md:hidden">
          {navGroups}
          <div className="space-y-3 border-t border-border pt-4">
            <div className="flex items-center gap-2">
              <UserAvatar name={userName} email={userEmail} avatarUrl={avatarUrl} size={32} />
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground">
                  {userName || userEmail}
                </p>
                {userName && userEmail && (
                  <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <LanguageSwitcher locale={locale} setLocale={setLocale} label={t("nav.language")} />
              <SignOutButton label={t("auth.signOut")} />
            </div>
          </div>
        </div>
      )}

      <div className="hidden flex-1 space-y-5 px-3 pb-4 md:mt-4 md:block">{navGroups}</div>

      <div className="hidden space-y-3 border-t border-border p-4 md:block">
        <div className="flex items-center gap-2">
          <UserAvatar name={userName} email={userEmail} avatarUrl={avatarUrl} size={32} />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-foreground">
              {userName || userEmail}
            </p>
            {userName && userEmail && (
              <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <LanguageSwitcher locale={locale} setLocale={setLocale} label={t("nav.language")} />
          <SignOutButton label={t("auth.signOut")} />
        </div>
      </div>
    </nav>
  );
}

function SignOutButton({ label }: { label: string }) {
  return (
    <form action={signOut.bind(null, "/login")}>
      <button
        type="submit"
        className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <LogOut className="h-3.5 w-3.5" aria-hidden />
        {label}
      </button>
    </form>
  );
}

function LanguageSwitcher({
  locale,
  setLocale,
  label,
}: {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  label: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex rounded-md border border-border p-0.5"
    >
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          aria-pressed={locale === code}
          className={cn(
            "rounded px-2.5 py-1 text-xs transition-colors",
            locale === code
              ? "bg-primary font-medium text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {LOCALE_LABELS[code]}
        </button>
      ))}
    </div>
  );
}
