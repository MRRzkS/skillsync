import Image from "next/image";
import Link from "next/link";
import AuthForm from "@/components/auth-form";
import { AuthSidePanel } from "@/components/auth-side-panel";

// The candidate's own entrance — role is pinned (nothing to choose), unlike
// the shared /login which offers both. Visual style now follows the UI
// team's design handoff (design-handoff/SkillSync_revisi.html), same as
// /login — this page's logic (Supabase Auth) is unchanged.
export default function CandidateLoginPage() {
  return (
    <div className="flex min-h-screen">
      <AuthSidePanel role="candidate" />
      <div className="flex flex-1 flex-col items-center justify-center gap-8 p-6">
        <Link href="/" className="lg:hidden">
          <Image src="/logo-horizontal.png" alt="Skillsync" width={180} height={60} priority />
        </Link>
        <AuthForm defaultRole="candidate" />
      </div>
    </div>
  );
}
