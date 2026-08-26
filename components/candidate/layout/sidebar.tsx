"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  ChevronDown,
  Eye,
  FileText,
  GraduationCap,
  ListChecks,
  Menu,
  Search,
  Settings,
  Sparkles,
  Star,
  User,
  UserRound,
  X,
} from "lucide-react";
import { SkillSyncLogo } from "@/components/candidate/layout/skillsync-logo";
import { WIZARD_STEP_KEYS, useWizardNav } from "@/components/candidate/layout/wizard-nav";
import { LOCALES, useTranslation, type Locale } from "@/lib/i18n";

// Candidate-side sidebar, matching the UI team's reference
// (design-handoff/UI_SkillSync/kandidat_*.png): light panel, icon-chip nav
// rows, and only the active row as a navy→purple gradient pill — same shape as
// the HR sidebar, but drawn with the Candidate module's own tokens/fonts so
// the two design systems stay separate (see tailwind.config.ts).
//
// The "CV Builder" group *is* the wizard's steps in the reference. On the
// builder route those rows drive the shared step cursor; anywhere else they're
// plain links back into the builder.
//
// Steps after "Data Diri" used to render as a permanently-visible, grayed-out
// list even before a candidate had typed anything — five disabled rows with
// nothing behind them yet. They're now a dropdown nested under "Data Diri"
// that only exists once there's somewhere to go (furthestStep > 0), and
// expands on its own once the candidate is actually past personal data.

const BUILDER_URL = "/candidate/resume-builder";

const STEP_ICONS = [User, FileText, Briefcase, GraduationCap, Star, ListChecks] as const;

const RESULT_ITEMS = [
  { href: "/candidate/profile", labelKey: "candidate.navProfile", icon: Eye },
  { href: "/candidate/cv-review", labelKey: "candidate.navReview", icon: Sparkles },
  { href: "/candidate/cv-preview", labelKey: "candidate.navPreview", icon: FileText },
  { href: "/candidate/jobs", labelKey: "candidate.navJobs", icon: Search },
] as const;

const LOCALE_LABELS: Record<Locale, string> = { en: "EN", id: "ID" };

export function CandidateSidebar() {
  const pathname = usePathname();
  const { t, locale, setLocale } = useTranslation();
  const { currentStep, furthestStep, goToStep } = useWizardNav();
  const [menuOpen, setMenuOpen] = useState(false);
  const [stepsExpanded, setStepsExpanded] = useState(false);

  const onBuilder = pathname === BUILDER_URL;
  const hasFurtherSteps = furthestStep > 0;

  // Follows progress automatically: once the candidate is past personal data
  // on the builder itself, the rest of the steps are exactly what's
  // "needed" right now, so open without waiting for a click.
  useEffect(() => {
    if (onBuilder && currentStep > 0) setStepsExpanded(true);
  }, [onBuilder, currentStep]);

  function closeMobileMenu() {
    setMenuOpen(false);
  }

  const navSections = (
    <>
      <div>
        <p className="hidden px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-gray md:block">
          {t("candidate.groupBuilder")}
        </p>
        <ul className="flex flex-col items-stretch gap-1">
          <li className="w-full">
            <div className="flex items-center gap-1">
              {onBuilder ? (
                <button
                  type="button"
                  onClick={() => {
                    goToStep(0);
                    closeMobileMenu();
                  }}
                  aria-current={onBuilder && currentStep === 0 ? "step" : undefined}
                  className={rowClass(onBuilder && currentStep === 0, false) + " flex-1"}
                >
                  <NavChip active={onBuilder && currentStep === 0}>
                    <User className="h-4 w-4" aria-hidden />
                  </NavChip>
                  <span className="whitespace-nowrap">{t(`candidate.steps.${WIZARD_STEP_KEYS[0]}`)}</span>
                </button>
              ) : (
                <Link
                  href={BUILDER_URL}
                  onClick={closeMobileMenu}
                  className={rowClass(false, false) + " flex-1"}
                >
                  <NavChip active={false}>
                    <User className="h-4 w-4" aria-hidden />
                  </NavChip>
                  <span className="whitespace-nowrap">{t(`candidate.steps.${WIZARD_STEP_KEYS[0]}`)}</span>
                </Link>
              )}

              {hasFurtherSteps && (
                <button
                  type="button"
                  onClick={() => setStepsExpanded((v) => !v)}
                  aria-expanded={stepsExpanded}
                  aria-label={t("candidate.wizard.toggleSteps")}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-gray transition-colors hover:bg-ocean-50 hover:text-ocean-700"
                >
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${stepsExpanded ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </button>
              )}
            </div>

            {hasFurtherSteps && stepsExpanded && (
              <ul className="mt-1 flex flex-col items-stretch gap-1 border-l border-ocean-100 pl-3">
                {WIZARD_STEP_KEYS.slice(1).map((key, i) => {
                  const index = i + 1;
                  const Icon = STEP_ICONS[index];
                  const label = t(`candidate.steps.${key}`);
                  const active = onBuilder && currentStep === index;
                  const reachable = index <= furthestStep;

                  const inner = (
                    <>
                      <NavChip active={active}>
                        <Icon className="h-4 w-4" aria-hidden />
                      </NavChip>
                      <span className="whitespace-nowrap">{label}</span>
                    </>
                  );

                  return (
                    <li key={key} className="w-full">
                      {onBuilder ? (
                        <button
                          type="button"
                          onClick={() => {
                            goToStep(index);
                            closeMobileMenu();
                          }}
                          disabled={!reachable}
                          aria-current={active ? "step" : undefined}
                          className={rowClass(active, !reachable)}
                        >
                          {inner}
                        </button>
                      ) : (
                        <Link href={BUILDER_URL} onClick={closeMobileMenu} className={rowClass(false, false)}>
                          {inner}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        </ul>
      </div>

      <div>
        <p className="hidden px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-gray md:block">
          {t("candidate.groupResult")}
        </p>
        <ul className="flex flex-col items-stretch gap-1">
          {RESULT_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <li key={item.href} className="w-full">
                <Link
                  href={item.href}
                  onClick={closeMobileMenu}
                  aria-current={active ? "page" : undefined}
                  className={rowClass(active, false)}
                >
                  <NavChip active={active}>
                    <Icon className="h-4 w-4" aria-hidden />
                  </NavChip>
                  <span className="whitespace-nowrap">{t(item.labelKey)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <p className="hidden px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-gray md:block">
          {t("nav.groupAccount")}
        </p>
        <ul className="flex flex-col items-stretch gap-1">
          <li className="w-full">
            <Link
              href="/candidate/settings"
              onClick={closeMobileMenu}
              aria-current={pathname === "/candidate/settings" ? "page" : undefined}
              className={rowClass(pathname === "/candidate/settings", false)}
            >
              <NavChip active={pathname === "/candidate/settings"}>
                <Settings className="h-4 w-4" aria-hidden />
              </NavChip>
              <span className="whitespace-nowrap">{t("nav.settings")}</span>
            </Link>
          </li>
        </ul>
      </div>
    </>
  );

  return (
    <aside className="flex shrink-0 flex-col border-b border-ocean-100/70 bg-white md:sticky md:top-0 md:h-screen md:w-72 md:overflow-y-auto md:border-b-0 md:border-r">
      <div className="p-4 md:p-5">
        <Link
          href="/"
          className="hidden items-center justify-center gap-1.5 rounded-lg border border-ocean-100 px-3 py-2 text-xs font-medium text-text-gray transition-colors hover:bg-ocean-50 hover:text-ocean-700 md:flex"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> {t("common.back")}
        </Link>

        <div className="flex items-center justify-between md:mt-5">
          <Link href={BUILDER_URL} className="flex items-center gap-2.5">
            <SkillSyncLogo className="h-8 w-8" />
            <p className="font-candidate-heading text-lg font-bold text-text-dark">
              Skill<span className="text-sync-purple-600">sync</span>
            </p>
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={t("nav.menu")}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-ocean-100 text-text-dark md:hidden"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        <p className="mt-4 hidden text-[10px] font-semibold uppercase tracking-[0.12em] text-text-gray md:block">
          {t("candidate.module")}
        </p>
        <p className="mt-2 hidden items-center gap-2 rounded-xl border border-ocean-100 px-3 py-2.5 text-sm font-semibold text-text-dark md:flex">
          <UserRound className="h-4 w-4 shrink-0 text-ocean-600" aria-hidden />
          {t("candidate.portal")}
        </p>
      </div>

      {/* Mobile: collapsed behind the hamburger above instead of always
          rendering every section — five stacked groups with full labels
          would otherwise push the page content off the first screen. */}
      {menuOpen && (
        <div className="space-y-5 border-t border-ocean-100/70 px-3 py-4 md:hidden">
          {navSections}
          <div className="border-t border-ocean-100/70 pt-4">
            <LanguageSwitcher locale={locale} setLocale={setLocale} label={t("nav.language")} />
          </div>
        </div>
      )}

      <div className="hidden flex-1 space-y-5 px-3 pb-4 md:block">{navSections}</div>

      <div className="hidden border-t border-ocean-100/70 p-4 md:block">
        <LanguageSwitcher locale={locale} setLocale={setLocale} label={t("nav.language")} />
      </div>
    </aside>
  );
}

function rowClass(active: boolean, disabled: boolean) {
  const base =
    "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm transition-colors";
  if (active) {
    return `${base} bg-gradient-to-r from-text-dark to-sync-purple-600 font-semibold text-white shadow-card`;
  }
  if (disabled) {
    return `${base} cursor-not-allowed font-medium text-text-gray/50`;
  }
  return `${base} font-medium text-text-dark hover:bg-ocean-50`;
}

function NavChip({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
        active ? "bg-white/20 text-white" : "bg-ocean-50 text-ocean-600"
      }`}
    >
      {children}
    </span>
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
      className="inline-flex rounded-md border border-ocean-100 p-0.5"
    >
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          aria-pressed={locale === code}
          className={`rounded px-2.5 py-1 text-xs transition-colors ${
            locale === code
              ? "bg-ocean-600 font-medium text-white"
              : "text-text-gray hover:text-text-dark"
          }`}
        >
          {LOCALE_LABELS[code]}
        </button>
      ))}
    </div>
  );
}
