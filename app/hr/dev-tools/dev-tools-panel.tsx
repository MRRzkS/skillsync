"use client";

import { useTransition, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import PageHeader from "@/components/page-header";
import {
  simulateApplicationAction,
  type SimulateApplicationState,
} from "@/actions/simulate-application";
import { seedRankingDemoAction } from "@/actions/seed-ranking-demo";
import { useTranslation } from "@/lib/i18n";

const initialState: SimulateApplicationState = {};

function ErrorNote({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="rounded-md border border-border bg-muted px-3 py-2 text-sm"
    >
      {message}
    </p>
  );
}

function SimulateSubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useTranslation();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? t("devTools.simulateSubmitting") : t("devTools.simulateSubmit")}
    </Button>
  );
}

function SimulateApplicationForm({
  jobs,
}: {
  jobs: { id: string; title: string }[];
}) {
  const { t } = useTranslation();
  const [state, formAction] = useFormState(
    simulateApplicationAction,
    initialState
  );

  if (jobs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("devTools.simulateNoJobs")}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="job_id">{t("nav.jobs")}</Label>
        {/* Native select on purpose: shadcn's Select is a Radix listbox that
            doesn't submit a value with a plain form action. */}
        <select
          id="job_id"
          name="job_id"
          required
          defaultValue=""
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="" disabled>
            {t("devTools.simulateSelectJob")}
          </option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>
      </div>

      {state.error && <ErrorNote message={state.error} />}
      <SimulateSubmitButton />
    </form>
  );
}

function SeedRankingDemoButton() {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await seedRankingDemoAction();
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="space-y-3">
      {error && <ErrorNote message={error} />}
      <Button variant="outline" onClick={handleClick} disabled={isPending}>
        {isPending ? t("devTools.seedSubmitting") : t("devTools.seedSubmit")}
      </Button>
    </div>
  );
}

export default function DevToolsPanel({
  jobs,
}: {
  jobs: { id: string; title: string }[];
}) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6 md:p-10">
      <PageHeader
        eyebrow={
          <span className="inline-flex rounded-full border border-dashed border-border px-2.5 py-0.5 text-xs text-muted-foreground">
            {t("devTools.badge")}
          </span>
        }
        title={t("devTools.title")}
        subtitle={t("devTools.subtitle")}
      />

      <Card className="space-y-3 border-dashed p-6">
        <div className="space-y-1">
          <h2 className="text-sm font-medium">{t("devTools.simulateTitle")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("devTools.simulateBody")}
          </p>
        </div>
        <SimulateApplicationForm jobs={jobs} />
      </Card>

      <Card className="space-y-3 border-dashed p-6">
        <div className="space-y-1">
          <h2 className="text-sm font-medium">{t("devTools.seedTitle")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("devTools.seedBody")}
          </p>
        </div>
        <SeedRankingDemoButton />
      </Card>
    </div>
  );
}
