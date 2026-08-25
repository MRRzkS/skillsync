import { NextResponse } from "next/server";
import { createApplicationAction } from "@/actions/create-application";

// Programmatic equivalent of createApplicationAction, for the Candidate
// module to call from its own "Submit Application" flow.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const candidateId = String(body?.candidate_id ?? "");
  const jobId = String(body?.job_id ?? "");

  if (!candidateId || !jobId) {
    return NextResponse.json(
      { error: "candidate_id and job_id are required" },
      { status: 400 }
    );
  }

  const result = await createApplicationAction({ candidateId, jobId });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json(result, { status: 201 });
}
