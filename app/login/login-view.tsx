"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AuthForm from "@/components/auth-form";
import { AuthSidePanel } from "@/components/auth-side-panel";

// LocaleProvider lives in the root layout — no local one needed here.
//
// Role lives here, not inside AuthForm, so the side panel switches copy in
// step with the Kandidat/HR toggle instead of staying pinned to whichever
// role the page started on — this is the one login page that offers the
// choice, so it's the one place the panel needs to react to it.
export default function LoginView({ redirectTo }: { redirectTo?: string }) {
  const [role, setRole] = useState<"hr" | "candidate">("hr");

  return (
    <div className="flex min-h-screen">
      <AuthSidePanel role={role} />
      <div className="flex flex-1 flex-col items-center justify-center gap-8 p-6">
        <Link href="/" className="lg:hidden">
          <Image src="/logo-horizontal.png" alt="Skillsync" width={180} height={60} priority />
        </Link>
        <AuthForm
          defaultRole="hr"
          allowRoleChoice
          redirectTo={redirectTo}
          role={role}
          onRoleChange={setRole}
        />
      </div>
    </div>
  );
}
