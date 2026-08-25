"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

export default function EnhanceJdButton({
  title,
  jdText,
  onEnhanced,
  disabled,
}: {
  title: string;
  jdText: string;
  onEnhanced: (jdText: string) => void;
  disabled?: boolean;
}) {
  const { t, locale } = useTranslation();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);

    if (!title.trim()) {
      setError(t("newJob.enhanceNeedsTitle"));
      return;
    }
    if (!jdText.trim()) {
      setError(t("newJob.enhanceNeedsNotes"));
      return;
    }

    setIsPending(true);
    try {
      const res = await fetch("/api/hr/jobs/enhance-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, jd_text: jdText, locale }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(body?.error ?? t("newJob.enhanceFailed"));
        return;
      }
      onEnhanced(body.jd_text);
    } catch {
      setError(t("newJob.enhanceFailed"));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={disabled || isPending}
      >
        <Sparkles className="h-3.5 w-3.5" aria-hidden />
        {isPending ? t("newJob.enhancing") : t("newJob.enhance")}
      </Button>
      {error && (
        <p role="alert" className="text-xs text-muted-foreground">
          {error}
        </p>
      )}
    </div>
  );
}
