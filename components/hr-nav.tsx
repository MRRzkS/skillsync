"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Briefcase, FilePlus2, LogOut, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { LOCALES, useTranslation, type Locale } from "@/lib/i18n";
import { signOut } from "@/actions/sign-out";
import UserAvatar from "@/components/user-avatar";

// `fullPrefetch` is reserved for data-free routes. Prefetching a dynamic route
// with prefetch={true} would let the router reuse its payload for the *static*
// staleTime (3 min), which would show stale rankings — see next.config.js.
const NAV_ITEMS = [
  { href: "/hr/jobs", labelKey: "nav.jobs", icon: Briefcase, fullPrefetch: false },
  { href: "/hr/new-job", labelKey: "nav.newJob", icon: FilePlus2, fullPrefetch: true },
  { href: "/hr/dev-tools", labelKey: "nav.devTools", icon: Wrench, fullPrefetch: false },
] as const;

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

  function isActive(href: string) {
    if (pathname === href) return true;
    // A job's dashboard is reached from the jobs list, so keep that item lit.
    return href === "/hr/jobs" && pathname.startsWith("/hr/dashboard");
  }

  return (
    <nav className="flex shrink-0 flex-col border-b border-border bg-card md:h-screen md:w-60 md:border-b-0 md:border-r">
      <div className="flex items-center justify-between gap-4 p-4 md:block md:space-y-6">
        <Link href="/hr/jobs" className="flex items-center gap-2">
          <Image src="/logo.png" alt="" width={28} height={28} className="shrink-0" priority />
          <span>
            <p className="text-sm font-semibold tracking-tight">
              {t("app.name")}
            </p>
            <p className="text-xs text-muted-foreground">{t("app.module")}</p>
          </span>
        </Link>

        <ul className="flex items-center gap-1 md:flex-col md:items-stretch">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  prefetch={item.fullPrefetch ? true : undefined}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-accent font-medium text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="hidden sm:inline">{t(item.labelKey)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="hidden md:mt-auto md:block md:space-y-3 md:border-t md:border-border md:p-4">
        <div className="flex items-center gap-2">
          <UserAvatar name={userName} email={userEmail} avatarUrl={avatarUrl} size={32} />
          <div className="min-w-0">
            <p className="truncate text-xs font-medium">
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

      <div className="flex items-center justify-between gap-3 border-t border-border p-4 md:hidden">
        <LanguageSwitcher locale={locale} setLocale={setLocale} label={t("nav.language")} />
        <div className="flex items-center gap-2">
          <UserAvatar name={userName} email={userEmail} avatarUrl={avatarUrl} size={28} />
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
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
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
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {LOCALE_LABELS[code]}
        </button>
      ))}
    </div>
  );
}
