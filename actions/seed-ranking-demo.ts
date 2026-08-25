"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { seedRankingDemo } from "@/lib/seed-ranking-demo";

/**
 * Fallback for live demos: instantly populates a dashboard with several
 * candidates at different match scores, with no AI calls involved — used when a
 * live AI walkthrough is too slow or unavailable to demo safely.
 */
export async function seedRankingDemoAction(): Promise<{ error?: string }> {
  const supabase = createServerSupabaseClient();

  let jobId: string;
  try {
    ({ jobId } = await seedRankingDemo(supabase));
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to seed demo data" };
  }

  redirect(`/hr/dashboard/${jobId}`);
}
