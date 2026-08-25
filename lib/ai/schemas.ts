import { z } from "zod";

// Single source of truth for AI output shapes — used by both the
// non-streaming generateObject path (external API contract) and the
// streaming streamObject routes (our own UI pages), so prompts and output
// shape never drift between the two.

export const jdEnhancementSchema = z.object({
  jd_text: z.string(),
});

export const scenarioQuestionsSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string(),
        focus_area: z.string(),
      })
    )
    .length(3),
});

// Field order matters for streaming: `entries` is emitted before
// `match_score`/`pitch_summary` so per-question feedback appears first and
// the overall score "reveals" last.
export const scoringResultSchema = z.object({
  entries: z.array(
    z.object({
      question: z.string(),
      focus_area: z.string(),
      answer: z.string(),
      feedback: z.string(),
    })
  ),
  match_score: z.number().min(0).max(100),
  pitch_summary: z.string(),
});
