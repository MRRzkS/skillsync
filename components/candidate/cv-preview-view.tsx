"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/candidate/ui/button";
import { CvPreview } from "@/components/candidate/cv-preview";
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

export function CvPreviewView({ cv }: { cv: CvData }) {
  const { t } = useTranslation();
  const router = useRouter();
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
      const blob = await pdf(<CvPdfDocument cv={cv} />).toBlob();
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

      <div className="mt-6">
        <CvPreview cv={cv} warnings={[]} />
      </div>
    </div>
  );
}
