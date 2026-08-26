"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

// Client component so it can translate — locale lives in localStorage.
export default function CvReviewLoading() {
  const { t } = useTranslation();

  return (
    // The (app) layout already provides <main> and the page background.
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-8 lg:px-8">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-ocean-600 to-sync-purple-600">
          <Sparkles className="h-[18px] w-[18px] text-white" />
        </div>
        <h1 className="font-candidate-heading text-xl font-bold text-text-dark">
          {t("candidate.review.title")}
        </h1>
      </div>
      <div className="mt-16 flex flex-col items-center gap-3 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-sync-purple-600" />
        <p className="text-sm text-text-gray">{t("candidate.review.loading")}</p>
      </div>
    </div>
  );
}
