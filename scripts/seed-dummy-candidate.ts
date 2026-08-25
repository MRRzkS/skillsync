// Seeds a dummy candidate_profiles row (and optionally a job + application)
// so we can test the HR module end-to-end without waiting for the
// Candidate module (ResumeForge) to be finished.
//
// Usage: npm run seed

import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Missing Supabase env vars in .env.local");
  }

  const supabase = createClient(url, serviceRoleKey);

  const { data: candidate, error: candidateError } = await supabase
    .from("candidate_profiles")
    .insert({
      full_name: "Budi Santoso",
      cv_json: {
        full_name: "Budi Santoso",
        summary: "Fresh graduate backend engineer with a passion for APIs.",
        experience: [
          {
            title: "Backend Intern",
            company: "Startup XYZ",
            period: "Jan 2025 - Jun 2025",
            bullets: [
              "Built REST APIs using Node.js and PostgreSQL",
              "Reduced query latency by 30% by adding indexes",
            ],
          },
        ],
        education: [
          {
            school: "Universitas Contoh",
            degree: "S1 Informatika",
            period: "2021 - 2025",
          },
        ],
        skills: ["Node.js", "PostgreSQL", "TypeScript", "REST API"],
      },
    })
    .select("id")
    .single();

  if (candidateError || !candidate) {
    throw new Error("Failed to seed candidate: " + candidateError?.message);
  }
  console.log("Seeded candidate_profiles:", candidate.id);

  const { data: job, error: jobError } = await supabase
    .from("job_vacancies")
    .insert({
      title: "Backend Engineer",
      jd_text:
        "We are looking for a Backend Engineer experienced with Node.js, " +
        "PostgreSQL, and REST API design. You will build and scale our core " +
        "services, optimize database performance, and collaborate with " +
        "frontend engineers.",
      scenarios: [
        {
          question:
            "A production API endpoint suddenly started responding slowly under load. Walk me through how you would diagnose and fix it.",
          focus_area: "Performance debugging",
        },
        {
          question:
            "You need to design a REST API for a new feature that lets users bookmark items. What endpoints and data model would you propose?",
          focus_area: "API design",
        },
        {
          question:
            "Describe a time you had to optimize a slow database query. What was the situation and what impact did your fix have?",
          focus_area: "Database optimization",
        },
      ],
    })
    .select("id")
    .single();

  if (jobError || !job) {
    throw new Error("Failed to seed job: " + jobError?.message);
  }
  console.log("Seeded job_vacancies:", job.id);

  const { data: application, error: applicationError } = await supabase
    .from("applications")
    .insert({
      candidate_id: candidate.id,
      job_id: job.id,
      status: "pending",
    })
    .select("id")
    .single();

  if (applicationError || !application) {
    throw new Error(
      "Failed to seed application: " + applicationError?.message
    );
  }
  console.log("Seeded applications:", application.id);

  console.log("\nDone. Try these URLs:");
  console.log(`  http://localhost:3000/assess/${application.id}`);
  console.log(`  http://localhost:3000/hr/dashboard/${job.id}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
