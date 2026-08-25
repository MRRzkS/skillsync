import { NextResponse } from "next/server";
import { enhanceJobDescription } from "@/lib/ai/jd-enhancer";
import { requireHrUser } from "@/lib/auth-guard";

// Backs the "Enhance with AI" button on new-job/edit-job — our own UI only,
// not part of the external contract, so it's guarded like the other
// HR-only routes.
export async function POST(req: Request) {
  const denied = await requireHrUser();
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  const title = String(body?.title ?? "").trim();
  const shortText = String(body?.jd_text ?? "").trim();
  const locale = typeof body?.locale === "string" ? body.locale : null;

  if (!title || !shortText) {
    return NextResponse.json(
      { error: "title and jd_text are required" },
      { status: 400 }
    );
  }

  try {
    const jdText = await enhanceJobDescription({ title, shortText, locale });
    return NextResponse.json({ jd_text: jdText });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI enhancement failed" },
      { status: 502 }
    );
  }
}
