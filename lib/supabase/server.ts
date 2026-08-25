import { createClient } from "@supabase/supabase-js";

// Server-only client using the service role key — bypasses RLS.
// Only import this from Server Components, Server Actions, or Route Handlers.
export function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
    global: {
      // Force every request through this client to bypass Next.js's
      // automatic fetch caching — without this, reads can silently return
      // stale data (e.g. a dashboard not reflecting a just-completed
      // assessment) regardless of route segment `dynamic` config.
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
}
