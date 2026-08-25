import { NextRequest, NextResponse } from "next/server";
import { generateTextWithFallback } from "@/lib/ai/openrouter";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You polish a candidate-written professional summary for a CV.

Rules:
- Only rephrase, tighten, and clarify what the candidate already wrote.
- Never invent employers, job titles, schools, dates, or metrics that are not present in the candidate's draft or the provided context.
- Keep it to 2-3 concise, ATS-friendly sentences.
- Do not use the word "I"; write in an implied first-person, resume-style voice.
- Return only the rewritten summary text, with no preamble, quotes, or labels.`;

interface ImproveSummaryBody {
  summary: string;
  context?: {
    title?: string;
    topSkills?: string[];
  };
}

export async function POST(req: NextRequest) {
  let body: ImproveSummaryBody;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const summary = (body.summary ?? "").trim();
  if (summary.length < 10) {
    return NextResponse.json(
      { error: "Write a sentence or two first, then AI can help polish it." },
      { status: 400 }
    );
  }

  const title = body.context?.title?.trim();
  const topSkills = (body.context?.topSkills ?? []).filter(Boolean);

  try {
    const text = await generateTextWithFallback({
      system: SYSTEM_PROMPT,
      user: `Candidate's professional title: ${title || "not provided"}
Key skills the candidate listed: ${topSkills.length > 0 ? topSkills.join(", ") : "not provided"}

Candidate's draft summary:
"""
${summary}
"""

Rewrite this summary following the rules.`,
      temperature: 0.4,
    });

    return NextResponse.json({ summary: text.trim() });
  } catch (err) {
    console.error("improve-summary failed:", err);
    const message = err instanceof Error ? err.message : "Couldn't improve the summary right now.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
