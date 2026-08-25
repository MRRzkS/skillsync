"use client";

import { useState } from "react";
import { Label } from "@/components/candidate/ui/label";
import { X } from "lucide-react";

function TagInput({
  values,
  onChange,
  placeholder,
  accent = "ocean",
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  accent?: "ocean" | "purple";
}) {
  const [draft, setDraft] = useState("");
  const [dupeWarning, setDupeWarning] = useState(false);

  function commit() {
    const value = draft.trim();
    if (!value) return;
    const exists = values.some((v) => v.toLowerCase() === value.toLowerCase());
    if (exists) {
      setDupeWarning(true);
      setDraft("");
      return;
    }
    onChange([...values, value]);
    setDraft("");
    setDupeWarning(false);
  }

  function remove(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  const chipClass =
    accent === "purple"
      ? "bg-sync-purple-50 text-sync-purple-700"
      : "bg-ocean-50 text-ocean-700";

  return (
    <div>
      <div className="flex min-h-[46px] flex-wrap items-center gap-2 rounded-lg border border-ocean-100 bg-white px-3 py-2">
        {values.map((v, i) => (
          <span
            key={`${v}-${i}`}
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${chipClass}`}
          >
            {v}
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label={`Remove ${v}`}
              className="rounded-full hover:opacity-70"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setDupeWarning(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              commit();
            }
          }}
          onBlur={commit}
          placeholder={values.length === 0 ? placeholder : "Add another..."}
          className="min-w-[120px] flex-1 border-none bg-transparent text-sm text-text-dark outline-none placeholder:text-text-gray/60"
        />
      </div>
      {dupeWarning && (
        <p className="mt-1 text-xs text-amber-600">That one&apos;s already on the list.</p>
      )}
    </div>
  );
}

export function StepSkills({
  skills,
  languages,
  onChangeSkills,
  onChangeLanguages,
}: {
  skills: string[];
  languages: string[];
  onChangeSkills: (next: string[]) => void;
  onChangeLanguages: (next: string[]) => void;
}) {
  return (
    <div>
      <h2 className="font-candidate-heading text-xl font-bold text-text-dark">Show your skills</h2>
      <p className="mt-1.5 text-sm text-text-gray">
        Add skills that best represent your professional abilities.
      </p>

      <div className="mt-6 space-y-6">
        <div>
          <Label>Skills</Label>
          <p className="mb-1.5 mt-0.5 text-xs text-text-gray">
            Type a skill and press Enter — technical or soft skills both welcome.
          </p>
          <TagInput
            values={skills}
            onChange={onChangeSkills}
            placeholder="e.g. React, Communication, Node.js"
            accent="ocean"
          />
        </div>

        <div>
          <Label>Languages (optional)</Label>
          <p className="mb-1.5 mt-0.5 text-xs text-text-gray">
            e.g. English (native), Spanish (fluent)
          </p>
          <TagInput
            values={languages}
            onChange={onChangeLanguages}
            placeholder="e.g. English (native)"
            accent="purple"
          />
        </div>
      </div>
    </div>
  );
}
