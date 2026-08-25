import { generateJson } from "./openrouter";
import { scoringResultSchema } from "./schemas";
import { languageInstruction, resolveLanguage } from "./language";
import type { CvJson, ScenarioQuestion, TranscriptEntry } from "@/lib/types";

export type ScoringResult = {
  match_score: number;
  pitch_summary: string;
  entries: TranscriptEntry[];
};

const SYSTEM_PROMPT = `You are a senior technical recruiter AI. You verify whether a
candidate's CV claims hold up against their answers to case-scenario questions.
Judge each answer using the STAR method (Situation, Task, Action, Result) —
reward concrete, specific, measurable answers and penalize vague or generic
ones that don't match the CV's claimed experience.`;

/**
 * Builds the user prompt for scoring. Shared between the non-streaming path
 * (generateJson) and the streaming route (app/api/assess/[applicationId]/stream)
 * so both always produce the same prompt.
 */
export function buildScoringPrompt(params: {
  cvJson: CvJson;
  jdText: string;
  jobTitle: string;
  questions: ScenarioQuestion[];
  answers: string[];
  locale?: string | null;
}): { system: string; user: string } {
  const { cvJson, jdText, jobTitle, questions, answers } = params;

  const qaPairs = questions
    .map(
      (q, i) =>
        `Q${i + 1} (${q.focus_area}): ${q.question}\nCandidate answer: ${
          answers[i] ?? "(no answer given)"
        }`
    )
    .join("\n\n");

  // Feedback should read in the candidate's own language, not the JD's —
  // an HR reader wants to check the feedback against what the candidate
  // actually wrote. `locale`, when given, forces a specific language (used
  // to generate the non-detected half of the EN/ID pair).
  const language = resolveLanguage(params.locale, answers.join(" ") || jdText);

  const user = `Job title: ${jobTitle}
Job description:
"""
${jdText}
"""

Candidate CV (JSON):
${JSON.stringify(cvJson)}

Case-scenario Q&A:
${qaPairs}

Evaluate how well the candidate's answers verify their CV claims and match the
job requirements. Produce one feedback entry per question (in the same order,
${questions.length} entries total), a combined 0-100 match_score (CV relevance +
answer quality), and a 2-3 sentence pitch_summary an HR recruiter can read to
quickly decide if this candidate is worth interviewing.
${languageInstruction(language)}`;

  return { system: SYSTEM_PROMPT, user };
}

/**
 * `scoringResultSchema` carries question / focus_area / answer alongside the
 * model's feedback, but only `feedback` is genuinely the model's to write —
 * nothing in the prompt makes it echo the other three faithfully, and a
 * free-tier model will happily paraphrase or truncate a candidate's answer.
 * Persisting that would show HR an AI-rewritten version of what someone
 * actually said, so rebuild every entry from ground truth and keep only the
 * feedback.
 *
 * Driving the loop off `questions` also absorbs a model that returns the
 * wrong number of entries — the transcript stays aligned with the job's
 * scenarios either way.
 */
export function buildTranscriptEntries(params: {
  questions: ScenarioQuestion[];
  answers: string[];
  modelEntries?: { feedback?: string }[];
}): TranscriptEntry[] {
  return params.questions.map((question, i) => ({
    question: question.question,
    focus_area: question.focus_area,
    answer: params.answers[i] ?? "",
    feedback: params.modelEntries?.[i]?.feedback ?? "",
  }));
}

/**
 * FR-003/FR-004: evaluates a candidate's free-text answers to the 3
 * scenario questions against their CV claims and the job description,
 * using STAR as the evaluation lens (case study "Should Have" scope), and
 * produces a combined 0-100 match_score plus a short pitch summary for HR.
 */
export async function scoreCandidateAssessment(params: {
  cvJson: CvJson;
  jdText: string;
  jobTitle: string;
  questions: ScenarioQuestion[];
  answers: string[];
  locale?: string | null;
}): Promise<ScoringResult> {
  const { system, user } = buildScoringPrompt(params);

  const result = await generateJson({
    system,
    user,
    schema: scoringResultSchema,
    temperature: 0.2,
  });

  return {
    match_score: Math.round(result.match_score),
    pitch_summary: result.pitch_summary,
    entries: buildTranscriptEntries({
      questions: params.questions,
      answers: params.answers,
      modelEntries: result.entries,
    }),
  };
}
