import { generateJson } from "./openrouter";
import { jdEnhancementSchema } from "./schemas";
import { languageInstruction, resolveLanguage } from "./language";

const SYSTEM_PROMPT = `You are an expert HR copywriter. You expand a short, rough
sketch of a job description into a complete, professional job description with
clear responsibilities and qualifications sections. Do not invent concrete facts
the input didn't mention (salary, company name, benefits, headcount); instead
write plausible, standard responsibilities and qualifications typical for a role
with this title.`;

/**
 * "Enhance with AI" (new-job / edit-job forms): lets HR type a short sketch
 * instead of a full JD and have the model flesh it out. Kept as a separate
 * non-streaming call from scenario generation — the two are independent
 * steps (HR reviews/edits the expanded JD before scenarios are generated).
 */
export function buildJdEnhancementPrompt(params: {
  title: string;
  shortText: string;
  locale?: string | null;
}): { system: string; user: string } {
  const language = resolveLanguage(
    params.locale,
    `${params.title} ${params.shortText}`
  );

  const user = `Job title: ${params.title}
Rough notes / short description:
"""
${params.shortText}
"""

Expand this into a complete job description (roughly 150-300 words) with clear
responsibilities and qualifications, in a professional tone, ready to publish.
${languageInstruction(language)}`;

  return { system: SYSTEM_PROMPT, user };
}

export async function enhanceJobDescription(params: {
  title: string;
  shortText: string;
  locale?: string | null;
}): Promise<string> {
  const { system, user } = buildJdEnhancementPrompt(params);

  const result = await generateJson({
    system,
    user,
    schema: jdEnhancementSchema,
    temperature: 0.5,
  });

  return result.jd_text;
}
