import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import EditJobForm from "./edit-job-form";

export const dynamic = "force-dynamic";

export default async function EditJobPage({
  params,
}: {
  params: { jobId: string };
}) {
  const supabase = createServerSupabaseClient();
  const { data: job } = await supabase
    .from("job_vacancies")
    .select("id, title, jd_text")
    .eq("id", params.jobId)
    .single();

  if (!job) notFound();

  return <EditJobForm job={job} />;
}
