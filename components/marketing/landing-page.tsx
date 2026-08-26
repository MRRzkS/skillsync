"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FileText, Sparkles, ShieldCheck, ArrowRight, Star, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { LOCALES, useTranslation, type Locale } from "@/lib/i18n";

// Landing page built from the UI team's design handoff
// (design-handoff/UI_SkillSync/home-page.png) — hero, features, "how it
// works", role picker, testimonials, FAQ, footer. Neutral ground shared by
// both modules, so it uses the HR side's semantic tokens rather than either
// module's own kit.
//
// Client component because every string comes from the i18n dictionaries and
// the locale lives in localStorage. app/page.tsx stays a thin server entry.
export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <Hero />
      <Features />
      <HowItWorks />
      <Roles />
      <Testimonials />
      <Faq />
      <Cta />
      <SiteFooter />
    </div>
  );
}

const LOCALE_LABELS: Record<Locale, string> = { en: "EN", id: "ID" };

const NAV_LINKS = [
  { key: "home.navSolutions", href: "#features" },
  { key: "home.navForCandidates", href: "#roles" },
  { key: "home.navForHr", href: "#roles" },
  { key: "home.navHow", href: "#how" },
] as const;

function SiteNav() {
  const { t, locale, setLocale } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Skillsync" width={28} height={28} />
          <span className="font-heading text-lg font-bold">
            Skill<span className="text-primary">sync</span>
          </span>
        </Link>
        <div className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.key} href={link.href} className="hover:text-foreground">
              {t(link.key)}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div
            role="group"
            aria-label={t("nav.language")}
            className="hidden rounded-md border border-border p-0.5 sm:inline-flex"
          >
            {LOCALES.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLocale(code)}
                aria-pressed={locale === code}
                className={`rounded px-2 py-1 text-xs transition-colors ${
                  locale === code
                    ? "bg-primary font-medium text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {LOCALE_LABELS[code]}
              </button>
            ))}
          </div>
          <Button variant="outline" asChild className="hidden sm:inline-flex">
            <Link href="/login">{t("auth.signIn")}</Link>
          </Button>
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/candidate/login">{t("auth.signUp")}</Link>
          </Button>
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
      </div>

      {menuOpen && (
        <div className="border-t border-border px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3 text-sm font-medium text-foreground">
            {NAV_LINKS.map((link) => (
              <a
                key={link.key}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="py-1"
              >
                {t(link.key)}
              </a>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div
              role="group"
              aria-label={t("nav.language")}
              className="inline-flex rounded-md border border-border p-0.5"
            >
              {LOCALES.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLocale(code)}
                  aria-pressed={locale === code}
                  className={`rounded px-2 py-1 text-xs transition-colors ${
                    locale === code
                      ? "bg-primary font-medium text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {LOCALE_LABELS[code]}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" asChild className="flex-1">
              <Link href="/login">{t("auth.signIn")}</Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/candidate/login">{t("auth.signUp")}</Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}

function Hero() {
  const { t } = useTranslation();
  return (
    <section
      className="relative overflow-hidden py-16 md:py-24"
      style={{
        // Layout ported from the design reference (design-handoff/
        // SkillSync_revisi.html, .hero rule) — four stacked radial glows over
        // a near-white base — but recolored to the official 4-color palette
        // (Ocean Blue, Sync Purple, Mint, Cloud White): the reference's
        // bottom-left glow was amber (rgba(255,204,128)), which isn't in that
        // palette, so it's Sync Purple here instead. Two fixes the
        // prototype's static canvas never had to deal with:
        // - each radial fades to a transparent version of ITS OWN colour
        //   (not the bare `transparent` keyword, which is transparent
        //   *black* — interpolating a solid colour into that produces a
        //   visible dark/muddy band instead of a clean fade);
        // - backgroundRepeat: no-repeat, since this section's height is
        //   content-driven (unlike the fixed-height design mockup) and can
        //   exceed a radial's box, which would otherwise tile it and show
        //   as a hard seam.
        backgroundImage: [
          "radial-gradient(760px 480px at 85% 4%, rgba(26,95,122,.24), rgba(26,95,122,0) 60%)",
          "radial-gradient(600px 460px at 4% 92%, rgba(124,92,252,.20), rgba(124,92,252,0) 60%)",
          "radial-gradient(480px 380px at 42% -6%, rgba(26,95,122,.14), rgba(26,95,122,0) 65%)",
          "radial-gradient(360px 320px at 60% 40%, rgba(166,228,212,.35), rgba(166,228,212,0) 70%)",
          "linear-gradient(165deg, #fff 0%, #fcfdfc 45%, #F6F9F6 100%)",
        ].join(", "),
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Faint grid, masked to a soft circle in the top-right — same as the
          reference's .hero:before. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(rgba(26,95,122,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(26,95,122,.05) 1px, transparent 1px)",
          backgroundSize: "46px 46px",
          maskImage: "radial-gradient(circle at 78% 10%, #000, transparent 62%)",
          WebkitMaskImage: "radial-gradient(circle at 78% 10%, #000, transparent 62%)",
        }}
      />
      <div className="container relative z-[2] mx-auto grid max-w-6xl items-center gap-12 px-4 md:grid-cols-2">
        <div>
          <div className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
            {t("home.heroBadge")}
          </div>
          <h1 className="mt-4 text-4xl font-bold leading-[1.08] tracking-tight md:text-5xl">
            {t("home.heroTitle")}{" "}
            <span className="bg-gradient-to-r from-primary to-[hsl(var(--brand-accent-purple))] bg-clip-text text-transparent">
              {t("home.heroTitleAccent")}
            </span>
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
            {t("home.heroBody")}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="/candidate/login">
                {t("home.heroCtaCandidate")} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">
                {t("home.heroCtaHr")} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-10 flex gap-8">
            <Stat value={t("home.stat1Value")} label={t("home.stat1Label")} />
            <Stat value={t("home.stat2Value")} label={t("home.stat2Label")} />
            <Stat value={t("home.stat3Value")} label={t("home.stat3Label")} />
          </div>
        </div>

        {/* Extra bottom padding reserves room for the floating verification
            chip below, so its overhang stays inside the section instead of
            crossing the hard edge into the next section's plain background. */}
        <div className="relative pb-6 sm:pb-8">
          <div className="pointer-events-none absolute -inset-x-6 -inset-y-10 -z-10 rounded-full bg-gradient-to-br from-primary/10 via-transparent to-[hsl(var(--brand-accent-purple))]/10 blur-2xl" />
          <div className="relative animate-float rounded-2xl border border-border bg-card p-6 shadow-lg">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2 font-heading font-semibold">
                <Image src="/logo.png" alt="" width={20} height={20} />
                Skill<span className="text-primary">sync</span>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-success" />{" "}
                {t("home.cardLive")}
              </span>
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-lg bg-secondary p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  {t("home.cardScore")}
                </p>
                <p className="mt-1 text-3xl font-bold text-primary">
                  87
                  <span className="text-base font-medium text-muted-foreground">/100</span>
                </p>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs font-medium text-muted-foreground">
                  {t("home.cardCase")}
                </p>
                <p className="mt-1 text-sm text-foreground">
                  &ldquo;{t("home.cardCaseQuestion")}&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Decorative floating verification chip, offset on top of the main
              card and animated on its own cycle for a layered feel. Hidden on
              small screens so it never overlaps the stacked hero text. */}
          <div
            className="absolute -bottom-6 -right-6 hidden animate-float rounded-xl border border-border bg-card p-3 shadow-card-lg sm:block"
            style={{ animationDelay: "-2s" }}
          >
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="text-[11px] font-medium text-muted-foreground">
                  {t("home.cardVerifyLabel")}
                </p>
                <p className="text-xs font-semibold text-foreground">{t("home.cardVerifyValue")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-heading text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function Features() {
  const { t } = useTranslation();
  const items = [
    { icon: FileText, key: "feature1" },
    { icon: Sparkles, key: "feature2" },
    { icon: ShieldCheck, key: "feature3" },
  ];
  return (
    <section id="features" className="py-16 md:py-20">
      <div className="container mx-auto max-w-6xl px-4">
        <SectionHead
          eyebrow={t("home.featuresEyebrow")}
          title={t("home.featuresTitle")}
          desc={t("home.featuresBody")}
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {items.map((f) => (
            <div key={f.key} className="rounded-xl border border-border bg-card p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-primary">
                {t(`home.${f.key}Badge`)}
              </p>
              <h3 className="mt-1 font-heading text-lg font-semibold">
                {t(`home.${f.key}Title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t(`home.${f.key}Body`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const { t } = useTranslation();
  return (
    <section id="how" className="scroll-mt-16 bg-secondary/50 py-16 md:py-20">
      <div className="container mx-auto max-w-6xl px-4">
        <SectionHead
          eyebrow={t("home.howEyebrow")}
          title={t("home.howTitle")}
          desc={t("home.howBody")}
        />
        <div className="relative mt-10 grid gap-8 md:grid-cols-3">
          {/* Dashed connector across the row, animated to feel like the claim
              flowing from step to step. Desktop only — on a stacked mobile
              layout the steps read top-to-bottom already. */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-[18px] hidden h-px animate-dash-flow bg-[length:24px_1px] [background-image:repeating-linear-gradient(to_right,hsl(var(--primary))_0,hsl(var(--primary))_10px,transparent_10px,transparent_18px)] opacity-40 md:block"
          />
          {[1, 2, 3].map((n) => (
            <div key={n} className="relative">
              <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-primary font-heading text-sm font-bold text-primary-foreground shadow-card">
                {n}
              </div>
              <h4 className="mt-3 font-heading font-semibold">{t(`home.how${n}Title`)}</h4>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {t(`home.how${n}Body`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Roles() {
  const { t } = useTranslation();
  return (
    <section id="roles" className="py-16 md:py-20">
      <div className="container mx-auto max-w-6xl px-4">
        <SectionHead
          eyebrow={t("home.rolesEyebrow")}
          title={t("home.rolesTitle")}
          desc={t("home.rolesBody")}
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <RoleCard prefix="roleCandidate" href="/candidate/login" />
          <RoleCard prefix="roleHr" href="/login" />
        </div>
      </div>
    </section>
  );
}

function RoleCard({ prefix, href }: { prefix: string; href: string }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl border border-border bg-card p-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
        {t(`home.${prefix}Eyebrow`)}
      </p>
      <h3 className="mt-2 font-heading text-2xl font-bold">{t(`home.${prefix}Title`)}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {t(`home.${prefix}Body`)}
      </p>
      <ul className="mt-4 space-y-2 text-sm text-foreground">
        {[1, 2, 3].map((i) => (
          <li key={i}>• {t(`home.${prefix}Item${i}`)}</li>
        ))}
      </ul>
      <Button className="mt-6" asChild>
        <Link href={href}>
          {t(`home.${prefix}Cta`)} <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

function Testimonials() {
  const { t } = useTranslation();
  return (
    <section className="bg-secondary/50 py-16 md:py-20">
      <div className="container mx-auto max-w-6xl px-4">
        <SectionHead
          eyebrow={t("home.testimonialsEyebrow")}
          title={t("home.testimonialsTitle")}
          desc={t("home.testimonialsBody")}
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((n) => {
            const name = t(`home.t${n}Name`);
            return (
              <div key={n} className="rounded-xl border border-border bg-card p-6">
                <div className="flex gap-0.5 text-warning">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-foreground">
                  &ldquo;{t(`home.t${n}Quote`)}&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {name
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{name}</p>
                    <p className="text-xs text-muted-foreground">{t(`home.t${n}Role`)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const { t } = useTranslation();
  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto max-w-3xl px-4">
        <SectionHead eyebrow={t("home.faqEyebrow")} title={t("home.faqTitle")} />
        <div className="mt-10">
          <FaqAccordion />
        </div>
      </div>
    </section>
  );
}

function Cta() {
  const { t } = useTranslation();
  return (
    <section className="py-8">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center gap-6 rounded-2xl bg-primary px-8 py-12 text-center text-primary-foreground md:flex-row md:justify-between md:text-left">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-foreground/70">
              {t("home.ctaEyebrow")}
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold md:text-3xl">
              {t("home.ctaTitle")}
            </h2>
            <p className="mt-1 text-sm text-primary-foreground/80">{t("home.ctaBody")}</p>
          </div>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/candidate/login">
              {t("home.ctaButton")} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-border py-12">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="Skillsync" width={22} height={22} />
              <span className="font-heading font-semibold">Skillsync</span>
            </div>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-muted-foreground">
              {t("home.footerTagline")}
            </p>
          </div>
          <FooterCol
            title={t("home.footerProduct")}
            links={[
              [t("home.navSolutions"), "#features"],
              [t("home.navForCandidates"), "#roles"],
              [t("home.navForHr"), "#roles"],
              [t("home.footerHowItWorks"), "#features"],
            ]}
          />
          <FooterCol
            title={t("home.footerCompany")}
            links={[
              [t("home.footerAbout"), "#"],
              [t("home.footerCareers"), "#"],
              [t("home.footerContact"), "#"],
            ]}
          />
          <FooterCol
            title={t("home.footerLegal")}
            links={[
              [t("home.footerPrivacy"), "#"],
              [t("home.footerTerms"), "#"],
            ]}
          />
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span>{t("home.footerCopyright")}</span>
          <span>{t("home.footerBuiltFor")}</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h5 className="text-sm font-semibold">{title}</h5>
      <div className="mt-3 flex flex-col gap-2 text-xs text-muted-foreground">
        {links.map(([label, href]) => (
          <a key={label} href={href} className="hover:text-foreground">
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}

function SectionHead({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
      <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight">{title}</h2>
      {desc && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{desc}</p>}
    </div>
  );
}
