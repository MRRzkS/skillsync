import { createBrowserClient } from "@supabase/ssr";

// Anon-key browser client — used only for auth (sign in/up, OAuth). Data
// reads/writes for HR screens still go through the service-role server
// client in server.ts; this one carries the user's own session instead.
export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
