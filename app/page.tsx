import { redirect } from "next/navigation";

// The HR portal's single entry point. The Candidate module (ResumeForge) will
// own its own routes once the two modules are merged.
export default function HomePage() {
  redirect("/hr/jobs");
}
