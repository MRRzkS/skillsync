import { createOpenAI } from "@ai-sdk/openai";
import { generateObject, generateText } from "ai";
import type { z } from "zod";
import { createGeminiProvider, GEMINI_MODEL } from "./gemini";

// OpenRouter exposes an OpenAI-compatible API, so we point the official
// Vercel AI SDK OpenAI provider at OpenRouter's base URL with a free model.
function getApiKey() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing env var: OPENROUTER_API_KEY");
  }
  return apiKey;
}

export function createOpenRouterProvider() {
  return createOpenAI({
    apiKey: getApiKey(),
    baseURL: "https://openrouter.ai/api/v1",
    headers: {
      "HTTP-Referer": "https://talentpulse.local",
      "X-Title": "TalentPulse HR Module",
    },
  });
}

export const OPENROUTER_MODEL =
  process.env.OPENROUTER_MODEL ??
  "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free";

/**
 * Non-streaming structured generation, validated against a Zod schema.
 * Used by the generator/scoring functions that back our external API
 * contract (app/api/hr/jobs, app/api/assess/[applicationId]) — those
 * endpoints stay plain request/response JSON for simplicity on the
 * Candidate module's side. Streaming variants live directly in the two
 * dedicated Route Handlers used by our own UI pages.
 */
export async function generateJson<T>(params: {
  system: string;
  user: string;
  schema: z.ZodType<T>;
  temperature?: number;
}): Promise<T> {
  try {
    const openrouter = createOpenRouterProvider();
    const { object } = await generateObject({
      model: openrouter(OPENROUTER_MODEL),
      schema: params.schema,
      temperature: params.temperature ?? 0.4,
      system: params.system,
      prompt: params.user,
    });
    return object;
  } catch (err) {
    // OpenRouter's free tier rate-limits hard — fall back to Gemini rather
    // than surface an error the user can't do anything about.
    console.error("[ai] OpenRouter failed, falling back to Gemini:", err);
    const gemini = createGeminiProvider();
    const { object } = await generateObject({
      model: gemini(GEMINI_MODEL),
      schema: params.schema,
      temperature: params.temperature ?? 0.4,
      system: params.system,
      prompt: params.user,
    });
    return object;
  }
}

/** Same OpenRouter-then-Gemini fallback as generateJson, for plain text output. */
export async function generateTextWithFallback(params: {
  system: string;
  user: string;
  temperature?: number;
}): Promise<string> {
  try {
    const openrouter = createOpenRouterProvider();
    const { text } = await generateText({
      model: openrouter(OPENROUTER_MODEL),
      temperature: params.temperature ?? 0.4,
      system: params.system,
      prompt: params.user,
    });
    return text;
  } catch (err) {
    console.error("[ai] OpenRouter failed, falling back to Gemini:", err);
    const gemini = createGeminiProvider();
    const { text } = await generateText({
      model: gemini(GEMINI_MODEL),
      temperature: params.temperature ?? 0.4,
      system: params.system,
      prompt: params.user,
    });
    return text;
  }
}
