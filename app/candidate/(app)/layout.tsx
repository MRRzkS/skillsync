import { redirect } from "next/navigation";
import { Sora, Manrope, IBM_Plex_Mono } from "next/font/google";
import { createAuthServerClient } from "@/lib/supabase/auth-server";
import { Navbar } from "@/components/candidate/layout/navbar";

// Shared shell for every logged-in candidate page (resume-builder, jobs, ...
// more to come). Own font/color choices, separate from the HR side's design
// tokens on purpose (see tailwind.config.ts "Candidate module" block), since
// the real UI/UX for this side isn't final yet — everything here lives in
// its own div rather than touching <html>/<body> from the root layout, so
// re-skinning this later can't affect the HR module.
//
// Auth is checked here (not in middleware.ts) so it doesn't cost every /hr/*
// navigation a round trip — same reasoning as app/hr/layout.tsx.

const sora = Sora({
  subsets: ["latin"],
  variable: "--candidate-font-heading",
  weight: ["500", "600", "700"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--candidate-font-body",
  weight: ["400", "500", "600", "700", "800"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--candidate-font-mono",
  weight: ["400", "500", "600"],
});

export default async function CandidateAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/candidate/login");

  const metadata = user.user_metadata ?? {};
  const name = metadata.full_name ?? metadata.name ?? null;
  const initial = (name || user.email || "?").charAt(0).toUpperCase();

  return (
    <div
      className={`${sora.variable} ${manrope.variable} ${plexMono.variable} min-h-screen bg-cloud font-candidate-sans text-text-dark antialiased`}
    >
      <Navbar initial={initial} />
      {children}
    </div>
  );
}
