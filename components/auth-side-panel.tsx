"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, FileText, Sparkles, ShieldCheck, Users } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

// Brand panel for the two-column login layout, from the UI team's actual
// reference (design-handoff/UI_SkillSync/login-page.png — a light grid
// pattern over a soft warm-to-cool gradient, not a solid primary-colour
// block). Copy differs by role — kept in i18n so it stays translatable.
export function AuthSidePanel({ role }: { role: "hr" | "candidate" }) {
  const { t } = useTranslation();
  const isCandidate = role === "candidate";

  const Point1Icon = isCandidate ? FileText : Sparkles;
  const Point2Icon = isCandidate ? ShieldCheck : Users;

  return (
    <div className="relative hidden overflow-hidden bg-secondary px-10 py-12 text-foreground lg:flex lg:w-[42%] lg:flex-col lg:justify-between">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(circle at 30% 20%, black, transparent 70%)",
          WebkitMaskImage: "radial-gradient(circle at 30% 20%, black, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full opacity-30 blur-3xl"
        style={{ background: "hsl(var(--warning))" }}
      />

      <Link
        href="/"
        className="relative inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> {t("common.back")}
      </Link>

      <div className="relative mt-8">
        <Image src="/logo.png" alt="Skillsync" width={36} height={36} />
        <p className="mt-8 inline-flex rounded-full bg-background px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary shadow-sm">
          {t(isCandidate ? "auth.candidatePanelEyebrow" : "auth.hrPanelEyebrow")}
        </p>
        <h1 className="mt-4 font-heading text-4xl font-bold leading-[1.1] tracking-tight">
          {t(isCandidate ? "auth.candidatePanelTitle" : "auth.hrPanelTitle")}
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {t(isCandidate ? "auth.candidatePanelBody" : "auth.hrPanelBody")}
        </p>

        <div className="mt-10 space-y-3">
          <PanelPoint
            icon={Point1Icon}
            title={t(isCandidate ? "auth.candidatePanelPoint1Title" : "auth.hrPanelPoint1Title")}
            body={t(isCandidate ? "auth.candidatePanelPoint1Body" : "auth.hrPanelPoint1Body")}
          />
          <PanelPoint
            icon={Point2Icon}
            title={t(isCandidate ? "auth.candidatePanelPoint2Title" : "auth.hrPanelPoint2Title")}
            body={t(isCandidate ? "auth.candidatePanelPoint2Body" : "auth.hrPanelPoint2Body")}
          />
        </div>
      </div>
      <div className="relative" />
    </div>
  );
}

function PanelPoint({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-background/70 p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}
