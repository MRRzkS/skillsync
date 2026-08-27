import { createGoogleGenerativeAI } from "@ai-sdk/google";

// Primary provider — faster than OpenRouter's free-tier models, which matters
// for a live hackathon demo. OpenRouter (lib/ai/openrouter.ts) is now the
// fallback, only reached when Gemini fails (rate limit, outage, etc).
function getApiKey() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing env var: GOOGLE_GENERATIVE_AI_API_KEY");
  }
  return apiKey;
}

export function createGeminiProvider() {
  return createGoogleGenerativeAI({ apiKey: getApiKey() });
}

export const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.6-flash";
