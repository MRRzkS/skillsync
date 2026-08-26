"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/candidate/ui/button";
import { CvPreview, type CvTemplate } from "@/components/candidate/cv-preview";
import type { CvData } from "@/lib/candidate/cv-schema";
import { useTranslation } from "@/lib/i18n";
import { ArrowLeft, Download, Loader2 } from "lucide-react";

function slugifyName(name: string) {
  const cleaned = name
    .trim()
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return cleaned.length > 0 ? cleaned : "Candidate";
}

const TEMPLATES: { id: CvTemplate; labelKey: string; swatch: string }[] = [
  { id: "classic", labelKey: "candidate.cvPreview.templateClassic", swatch: "bg-ocean-100" },
  { id: "modern", labelKey: "candidate.cvPreview.templateModern", swatch: "bg-sync-purple-600" },
  { id: "minimal", labelKey: "candidate.cvPreview.templateMinimal", swatch: "bg-amber-500" },
];

export function CvPreviewView({ cv }: { cv: CvData }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [template, setTemplate] = useState<CvTemplate>("classic");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  async function handleDownload() {
    setIsDownloading(true);
    setDownloadError(null);
    try {
      // Same constraint as the wizard's download handler: @react-pdf/renderer
      // must stay a dynamic import triggered from a click, never a static
      // top-level import — it breaks SSR/prerender otherwise.
      const [{ pdf }, { CvPdfDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/candidate/cv-pdf"),
      ]);
      const blob = await pdf(<CvPdfDocument cv={cv} template={template} />).toBlob();
      const filename = `${slugifyName(cv.contact.fullName || "")}-CV.pdf`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
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
    <div className="mx-auto max-w-3xl">
      <h1 className="font-candidate-heading text-3xl font-bold text-text-dark">
        {t("candidate.cvPreview.title")}
      </h1>
      <p className="mt-1 text-sm leading-relaxed text-text-gray">
        {t("candidate.cvPreview.subtitle")}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button variant="ai" onClick={handleDownload} disabled={isDownloading} className="gap-2">
          {isDownloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {t("candidate.cvPreview.download")}
        </Button>
        <Button
          variant="outline-soft"
          onClick={() => router.push("/candidate/resume-builder")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> {t("candidate.cvPreview.edit")}
        </Button>
      </div>

      {downloadError && (
        <p className="mt-3 text-xs text-red-600">{downloadError}</p>
      )}

      <div
        role="group"
        aria-label={t("candidate.cvPreview.title")}
        className="mt-6 flex flex-wrap gap-3"
      >
        {TEMPLATES.map((tpl) => (
          <button
            key={tpl.id}
            type="button"
            onClick={() => setTemplate(tpl.id)}
            aria-pressed={template === tpl.id}
            className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
              template === tpl.id
                ? "border-sync-purple-600 bg-sync-purple-50 text-sync-purple-700"
                : "border-ocean-100 text-text-dark hover:bg-ocean-50"
            }`}
          >
            <span className={`h-3 w-3 rounded-full ${tpl.swatch}`} aria-hidden />
            {t(tpl.labelKey)}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <CvPreview cv={cv} warnings={[]} template={template} />
      </div>
    </div>
  );
}
