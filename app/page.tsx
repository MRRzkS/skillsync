import { LandingPage } from "@/components/marketing/landing-page";

// Thin server entry — the page itself is a client component because every
// string is translated and the locale lives in localStorage.
export default function HomePage() {
  return <LandingPage />;
}
