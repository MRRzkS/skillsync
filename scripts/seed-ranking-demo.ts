// Seeds one job vacancy with several candidates at different match_scores, all
// already "completed", so the HR dashboard ranking can be seen immediately
// without waiting on AI calls for each one.
//
// Usage: npm run seed:ranking

import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { seedRankingDemo } from "../lib/seed-ranking-demo";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing Supabase env vars in .env.local");
  }

  const supabase = createClient(url, serviceRoleKey);
  const { jobId, candidateIds, applicationIds } = await seedRankingDemo(supabase);

  // Printed so these rows can be cleaned up precisely by id later — this
  // Supabase project is shared with the Candidate module team.
  console.log("Seeded job_vacancies:", jobId);
  console.log("Seeded candidate_profiles:", candidateIds.join(", "));
  console.log("Seeded applications:", applicationIds.join(", "));
  console.log("\nDone. Open the ranked dashboard:");
  console.log(`  http://localhost:3000/hr/dashboard/${jobId}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
