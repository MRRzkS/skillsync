import type { Metadata } from "next";
import { Sora, Manrope } from "next/font/google";
import { LocaleProvider } from "@/lib/i18n";
import "./globals.css";

// Sora (headings) + Manrope (body) — from the UI team's design handoff
// (design-handoff/SkillSync_revisi.html). Loaded at the root so both the
// homepage and every /hr/* page share one font system; see globals.css'
// base layer for how h1-h4 pick up --font-heading.
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700", "800"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Skillsync",
  description: "Where CVs and job needs finally sync. AI-powered CV building for candidates and AI-powered screening & validation for HR recruiters.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sora.variable} ${manrope.variable}`}>
      {/* One provider for the whole app. It used to sit in the /hr and
          /candidate layouts only, which left the landing page and both login
          screens permanently English (useTranslation falls back rather than
          throwing, so the gap was silent). Wrapping here is free: children
          passed through a client component stay server components. */}
      <body className="min-h-screen bg-background text-foreground antialiased">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
