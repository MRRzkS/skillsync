"use client";

import Image from "next/image";
import { LocaleProvider } from "@/lib/i18n";
import AuthForm from "@/components/auth-form";

export default function LoginView({ redirectTo }: { redirectTo?: string }) {
  return (
    <LocaleProvider>
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
        <Image src="/logo-horizontal.png" alt="Skillsync" width={220} height={73} priority />
        <AuthForm defaultRole="hr" allowRoleChoice redirectTo={redirectTo} />
      </div>
    </LocaleProvider>
  );
}
