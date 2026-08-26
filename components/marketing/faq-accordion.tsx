"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

// FAQ copy lives in the i18n dictionaries (home.faq1Q … home.faq5A), same as
// the rest of the landing page. Toggle-in-place accordion — no external
// library needed for five items.
const FAQ_COUNT = 5;

export function FaqAccordion() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-border rounded-xl border border-border bg-card">
      {Array.from({ length: FAQ_COUNT }, (_, i) => i + 1).map((n, i) => {
        const open = openIndex === i;
        return (
          <div key={n}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-foreground"
              aria-expanded={open}
            >
              {t(`home.faq${n}Q`)}
              <Plus
                className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-45" : ""}`}
              />
            </button>
            {open && (
              <p className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">
                {t(`home.faq${n}A`)}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
