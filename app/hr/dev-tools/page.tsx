import { createServerSupabaseClient } from "@/lib/supabase/server";
import DevToolsPanel from "./dev-tools-panel";

export const dynamic = "force-dynamic";

// Development/demo utilities only — these exist because the Candidate module
// (ResumeForge) has no UI yet, so there is otherwise no way to trigger a real
// "Submit Application". Not part of the product surface.
export default async function DevToolsPage() {
  const supabase = createServerSupabaseClient();

  const { data: jobs } = await supabase
    .from("job_vacancies")
    .select("id, title")
    .order("created_at", { ascending: false })
    .limit(20);

  return <DevToolsPanel jobs={jobs ?? []} />;
}
