import Image from "next/image";
import { LocaleProvider } from "@/lib/i18n";
import AuthForm from "@/components/auth-form";

// Draft login page for the Candidate module team — logic (Supabase Auth,
// same as /login) is real and working; visual ownership belongs to whichever
// team builds the rest of /candidate/*, same convention as /assess/[applicationId].
// The role is pinned here: this is the candidate's own entrance, so there's
// nothing to choose. /login is the shared door that offers both.
export default function CandidateLoginPage() {
  return (
    <LocaleProvider>
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
        <Image src="/logo-horizontal.png" alt="Skillsync" width={220} height={73} priority />
        <AuthForm defaultRole="candidate" />
      </div>
    </LocaleProvider>
  );
}
