"use client";

import { useState } from "react";
import { Textarea } from "@/components/candidate/ui/textarea";
import { Label } from "@/components/candidate/ui/label";
import { Button } from "@/components/candidate/ui/button";
import type { WizardData } from "@/components/candidate/wizard/types";
import { Sparkles, Loader2, AlertTriangle } from "lucide-react";

export function StepProfile({
  data,
  onChange,
}: {
  data: WizardData;
  onChange: (summary: string) => void;
}) {
  const [isImproving, setIsImproving] = useState(false);
  const [improveError, setImproveError] = useState<string | null>(null);

  async function handleImproveWithAi() {
    if (data.summary.trim().length < 10) {
      setImproveError("Write a sentence or two first, then AI can help polish it.");
      return;
    }
    setIsImproving(true);
    setImproveError(null);
    try {
      const res = await fetch("/api/candidate/improve-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: data.summary,
          context: {
            title: data.personal.desiredTitle,
            topSkills: data.skills.slice(0, 8),
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Couldn't improve the summary right now.");
      }
      onChange(json.summary);
    } catch (err) {
      setImproveError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setIsImproving(false);
    }
  }

  return (
    <div>
      <h2 className="font-candidate-heading text-xl font-bold text-text-dark">Your Professional Profile</h2>
      <p className="mt-1.5 text-sm text-text-gray">
        A short summary that appears right at the top of your CV.
      </p>

      <div className="mt-6">
        <div className="mb-1.5 flex items-center justify-between">
          <Label htmlFor="summary">Professional Summary</Label>
          <span className="text-xs text-text-gray">{data.summary.length} characters</span>
        </div>
        <p className="mb-2 text-xs text-text-gray">
          Briefly describe your professional background, strengths, and career goals.
        </p>
        <Textarea
          id="summary"
          className="min-h-[180px] resize-none text-sm leading-relaxed"
          placeholder="Backend-leaning full stack engineer with 5 years building payments infrastructure..."
          value={data.summary}
          onChange={(e) => onChange(e.target.value)}
        />

        <div className="mt-3 flex items-center gap-3">
          <Button
            type="button"
            variant="outline-soft"
            size="sm"
            onClick={handleImproveWithAi}
            disabled={isImproving}
            className="gap-2"
          >
            {isImproving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Improving...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" /> Improve with AI
              </>
            )}
          </Button>
        </div>

        {improveError && (
          <p className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {improveError}
          </p>
        )}
      </div>
    </div>
  );
}
