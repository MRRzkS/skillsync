import { createGoogleGenerativeAI } from "@ai-sdk/google";

// Fallback provider, only reached when OpenRouter fails (rate limit, outage,
// etc — see lib/ai/openrouter.ts). Not used as a primary provider anywhere.
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
