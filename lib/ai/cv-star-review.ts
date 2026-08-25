import { z } from "zod";
import { generateJson } from "./openrouter";
import type { CvData } from "@/lib/candidate/cv-schema";

// New feature, deliberately separate from the Candidate team's own CV
// pipeline (extract-cv.ts, wizard/types.ts) — their code isn't touched.
// This reviews a CV *after* it's built, using the STAR method (Situation,
// Task, Action, Result), so a candidate can see strengths/weaknesses before
// moving on to job applications and the AI assessment.

export const starReviewSchema = z.object({
  overall_score: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "Overall CV strength as a whole number from 0 to 100 (e.g. 72, NOT 7.2 or 7/10) — a percentage-style score, weighted toward STAR compliance and quantified impact"
    ),
  overall_feedback: z
    .string()
    .describe("2-3 sentence summary of the CV's biggest opportunity for improvement"),
  strengths: z
    .array(z.string())
    .describe("Specific things this CV already does well, 2-4 items"),
  weaknesses: z
    .array(z.string())
    .describe("Specific, actionable gaps — vague bullets, missing metrics, weak verbs, etc, 2-4 items"),
  bullet_feedback: z
    .array(
      z.object({
        role: z.string().describe("The experience entry this bullet belongs to, e.g. 'Software Engineer at Acme'"),
        bullet: z.string().describe("The exact bullet text being reviewed"),
        follows_star: z
          .boolean()
          .describe("Whether it clearly implies Situation/Task, Action, and Result"),
        suggestion: z.string().describe("One concrete rewrite suggestion, or empty string if already strong"),
      })
    )
    .describe("Per-bullet STAR check for each experience bullet in the CV"),
});

export type StarReview = z.infer<typeof starReviewSchema>;

const SYSTEM_PROMPT = `You are a CV coach evaluating a candidate's resume using the
STAR method (Situation, Task, Action, Result). For each experience bullet, judge
whether it implies a situation/task, a concrete action the candidate took, and a
measurable result — not just a duty or responsibility.

Be specific and actionable, never generic ("add more detail" is not useful).
Never invent facts, employers, or numbers the candidate didn't write — only
comment on what's already there or clearly missing.`;

function formatExperience(cv: CvData): string {
  if (cv.experience.length === 0) {
    return "(No work experience listed.)";
  }
  return cv.experience
    .map((exp) => {
      const label = `${exp.role || "Role"} at ${exp.company || "Company"}`;
      const bullets = exp.bullets
        .filter((b) => b.trim())
        .map((b) => `- ${b}`)
        .join("\n");
      return `${label}:\n${bullets || "(no bullets)"}`;
    })
    .join("\n\n");
}

export async function reviewCvWithStar(cv: CvData): Promise<StarReview> {
  const user = `Candidate's professional summary:
"""
${cv.summary || "(none written)"}
"""

Work experience:
"""
${formatExperience(cv)}
"""

Evaluate every experience bullet listed above against the STAR method, then give
overall strengths, weaknesses, and a score. If there's no work experience,
base overall_feedback/strengths/weaknesses on the summary and skills instead, and
return an empty bullet_feedback array.

overall_score must be a whole number on a 0-100 scale (like a percentage) —
for example 72. Do NOT use a 0-10 scale (never return something like 7 or 7.5).`;

  const result = await generateJson({
    system: SYSTEM_PROMPT,
    user,
    schema: starReviewSchema,
    temperature: 0.3,
  });

  // Free-tier models sometimes ignore the 0-100 instruction and score out of
  // 10 anyway (e.g. 7.5) — it still passes the schema's min/max, so correct
  // it defensively instead of showing a candidate a confusingly low number.
  if (result.overall_score > 0 && result.overall_score <= 10) {
    result.overall_score = Math.round(result.overall_score * 10);
  } else {
    result.overall_score = Math.round(result.overall_score);
  }

  return result;
}
