import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import AssessmentChat from "./assessment-chat";

// Application status/transcript changes as the candidate progresses, so
// this page must never serve a cached Next.js fetch response (Supabase's
// client uses fetch under the hood, which Next.js caches by default).
export const dynamic = "force-dynamic";

export default async function AssessPage({
  params,
}: {
  params: { applicationId: string };
}) {
  const supabase = createServerSupabaseClient();

  const { data: application } = await supabase
    .from("applications")
    .select("id, job_id, status, transcript")
    .eq("id", params.applicationId)
    .single();

  if (!application) notFound();

  const { data: job } = await supabase
    .from("job_vacancies")
    .select("title, scenarios")
    .eq("id", application.job_id)
    .single();

  if (!job) notFound();

  if (application.status === "completed") {
    return (
      <main className="mx-auto flex max-w-xl flex-col gap-4 p-10">
        <h1 className="text-xl font-semibold">Assessment already submitted</h1>
        <p className="text-slate-600">
          You&apos;ve already completed this assessment. The HR team will review
          your results.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 p-10">
      {/*
        NOTE: bare-bones placeholder UI (no styling investment) — the
        Candidate module team will restyle this once the design system is
        ready. The logic here (progressive save, submit, scoring) is the
        part owned by the HR module.
      */}
      <div>
        <h1 className="text-xl font-semibold">Verification Assessment</h1>
        <p className="text-slate-600">{job.title} — answer these 3 case questions.</p>
      </div>
      <AssessmentChat
        applicationId={application.id}
        questions={job.scenarios}
        savedDraftAnswers={
          application.transcript?.entries?.map((e: { answer: string }) => e.answer) ?? []
        }
      />
    </main>
  );
}
