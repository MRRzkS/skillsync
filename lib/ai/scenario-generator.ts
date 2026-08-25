import { generateJson } from "./openrouter";
import { scenarioQuestionsSchema } from "./schemas";
import { languageInstruction, resolveLanguage } from "./language";
import type { ScenarioQuestion } from "@/lib/types";

const MIN_JD_LENGTH = 50;

const SYSTEM_PROMPT = `You are an expert technical recruiter. You design short, situational
case-study questions used to verify whether a candidate's CV claims match real
competency.`;

/**
 * Builds the user prompt for scenario generation. Shared between the
 * non-streaming path (generateJson) and the streaming route
 * (app/api/hr/jobs/stream) so both always produce the same prompt.
 */
export function buildScenarioPrompt(params: {
  title: string;
  jdText: string;
  locale?: string | null;
}): { system: string; user: string } {
  const isShortJd = params.jdText.trim().length < MIN_JD_LENGTH;
  const language = resolveLanguage(
    params.locale,
    `${params.title} ${params.jdText}`
  );

  const user = `Job title: ${params.title}
Job description:
"""
${params.jdText}
"""
${
  isShortJd
    ? "The job description above is too short/sparse to extract solid qualifications. Fall back to standard industry expectations for this job title."
    : ""
}

Generate exactly 3 adaptive case-scenario questions that test whether a candidate
truly has the key skills implied by this job. Each question should present a
realistic situation/case (not a generic "tell me about yourself" question) so a
candidate's free-text answer can be judged for real competency using the STAR
method (Situation, Task, Action, Result).
${languageInstruction(language)}`;

  return { system: SYSTEM_PROMPT, user };
}

/**
 * FR-002: generates exactly 3 adaptive case-scenario questions from a Job
 * Description, used later to verify candidates' CV claims.
 *
 * Exception per FRD: if the JD is too short to extract real qualifications
 * from, we tell the model to fall back to standard industry expectations for
 * the given job title instead of guessing from noise.
 */
export async function generateScenarioQuestions(params: {
  title: string;
  jdText: string;
  locale?: string | null;
}): Promise<ScenarioQuestion[]> {
  const { system, user } = buildScenarioPrompt(params);

  const result = await generateJson({
    system,
    user,
    schema: scenarioQuestionsSchema,
  });

  return result.questions;
}
