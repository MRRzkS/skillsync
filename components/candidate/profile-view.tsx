"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Link2, Loader2, Mail, MapPin, Pencil } from "lucide-react";
import { Button } from "@/components/candidate/ui/button";
import { Badge } from "@/components/candidate/ui/badge";
import { useTranslation } from "@/lib/i18n";
import type { CvData } from "@/lib/candidate/cv-schema";

const CARD = "rounded-2xl border border-ocean-100/60 bg-white shadow-card";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function slugifyName(name: string) {
  const cleaned = name
    .trim()
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return cleaned.length > 0 ? cleaned : "Candidate";
}

/** Share of the CV's sections that actually carry content. */
function completeness(cv: CvData) {
  const filled = [
    cv.contact.fullName,
    cv.contact.email,
    cv.contact.location,
    cv.summary,
    cv.skills.length > 0,
    cv.experience.length > 0,
    cv.education.length > 0,
    cv.languages.length > 0,
  ].filter(Boolean).length;
  return Math.round((filled / 8) * 100);
}

export function CandidateProfileView({ cv }: { cv: CvData }) {
  const { t } = useTranslation();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const name = cv.contact.fullName || t("candidate.wizard.yourName");
  const headline = cv.experience[0]?.role ?? "";

  async function handleDownloadPdf() {
    setIsDownloading(true);
    setDownloadError(null);
    try {
      // Must stay a dynamic import inside the handler — @react-pdf/renderer
      // can't be in the server/RSC module graph (see cv-wizard.tsx).
      const [{ pdf }, { CvPdfDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/candidate/cv-pdf"),
      ]);
      const blob = await pdf(<CvPdfDocument cv={cv} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${slugifyName(cv.contact.fullName || "")}-CV.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
      setDownloadError(t("candidate.success.downloadError"));
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-8 lg:px-8">
      <div
        className="rounded-2xl px-6 py-8 text-white lg:px-8"
        style={{ backgroundImage: "linear-gradient(120deg, #172033 0%, #0D47A1 130%)" }}
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl font-candidate-heading text-2xl font-bold text-text-dark bg-[#F57C00]">
          {initials(name)}
        </div>
        <h1 className="mt-5 font-candidate-heading text-3xl font-bold">{name}</h1>
        {headline && <p className="mt-1 text-sm text-white/70">{headline}</p>}
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/80">
          {cv.contact.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" aria-hidden /> {cv.contact.location}
            </span>
          )}
          {cv.contact.email && (
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" aria-hidden /> {cv.contact.email}
            </span>
          )}
          {cv.contact.linkedin && (
            <span className="flex items-center gap-1.5">
              <Link2 className="h-3.5 w-3.5" aria-hidden /> {cv.contact.linkedin}
            </span>
          )}
        </div>
      </div>

      <div className={`${CARD} mt-4 grid grid-cols-2 md:grid-cols-4`}>
        <Stat label={t("candidate.profile.statRoles")} value={String(cv.experience.length)} />
        <Stat label={t("candidate.profile.statSkills")} value={String(cv.skills.length)} />
        <Stat
          label={t("candidate.profile.statLanguages")}
          value={String(cv.languages.length)}
        />
        <Stat
          label={t("candidate.profile.statCompleteness")}
          value={`${completeness(cv)}`}
        />
      </div>

      <div className="mt-4 flex flex-wrap justify-end gap-3">
        <Button variant="outline-soft" asChild className="gap-2">
          <Link href="/candidate/resume-builder">
            <Pencil className="h-4 w-4" /> {t("candidate.profile.edit")}
          </Link>
        </Button>
        <Button variant="ai" onClick={handleDownloadPdf} disabled={isDownloading} className="gap-2">
          {isDownloading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> {t("candidate.success.preparing")}
            </>
          ) : (
            <>
              <Download className="h-4 w-4" /> {t("candidate.profile.download")}
            </>
          )}
        </Button>
      </div>

      {downloadError && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
          {downloadError}
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className={`${CARD} space-y-6 p-6`}>
          {cv.summary && (
            <section>
              <h2 className="font-candidate-heading text-lg font-bold text-text-dark">
                {t("cv.summary")}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-text-gray">{cv.summary}</p>
            </section>
          )}

          {cv.experience.length > 0 && (
            <section>
              <h2 className="font-candidate-heading text-lg font-bold text-text-dark">
                {t("cv.experience")}
              </h2>
              <ol className="mt-3 space-y-5 border-l border-ocean-100 pl-5">
                {cv.experience.map((item, i) => (
                  <li key={i} className="relative">
                    <TimelineDot />
                    <p className="font-semibold text-text-dark">{item.role}</p>
                    <p className="text-xs text-text-gray">
                      {[item.company, [item.startDate, item.endDate].filter(Boolean).join(" — ")]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {item.bullets.length > 0 && (
                      <ul className="mt-1.5 space-y-1 text-sm text-text-gray">
                        {item.bullets.map((bullet, b) => (
                          <li key={b}>{bullet}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {cv.education.length > 0 && (
            <section>
              <h2 className="font-candidate-heading text-lg font-bold text-text-dark">
                {t("cv.education")}
              </h2>
              <ol className="mt-3 space-y-5 border-l border-ocean-100 pl-5">
                {cv.education.map((item, i) => (
                  <li key={i} className="relative">
                    <TimelineDot />
                    <p className="font-semibold text-text-dark">
                      {[item.degree, item.fieldOfStudy].filter(Boolean).join(" ")}
                    </p>
                    <p className="text-xs text-text-gray">
                      {[
                        item.institution,
                        [item.startDate, item.endDate].filter(Boolean).join(" — "),
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {item.gpa && <p className="mt-1 text-sm text-text-gray">{item.gpa}</p>}
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        <div className="space-y-6">
          {cv.skills.length > 0 && (
            <ChipCard title={t("cv.skills")} items={cv.skills} variant="ocean" />
          )}
          {cv.certifications.length > 0 && (
            <ChipCard
              title={t("cv.certifications")}
              items={cv.certifications}
              variant="mint"
            />
          )}
          {cv.languages.length > 0 && (
            <ChipCard title={t("cv.languages")} items={cv.languages} variant="mint" />
          )}
        </div>
      </div>
    </div>
  );
}

function TimelineDot() {
  return (
    <span
      aria-hidden
      className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#F57C00]"
    />
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-5 text-center">
      <p className="font-candidate-heading text-2xl font-bold text-text-dark">{value}</p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-text-gray">
        {label}
      </p>
    </div>
  );
}

function ChipCard({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant: "ocean" | "mint";
}) {
  return (
    <div className={`${CARD} p-6`}>
      <h2 className="font-candidate-heading text-lg font-bold text-text-dark">{title}</h2>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {items.map((item) => (
          <Badge key={item} variant={variant}>
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}
