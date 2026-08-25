import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Anon-key server client bound to the request's cookies — use it to ask *who*
 * is signed in. Data reads for HR screens still go through the service-role
 * client in server.ts, which has no notion of a user at all.
 *
 * Pass `writable: true` only from Server Actions and Route Handlers; Server
 * Components can't set cookies, so there the writes are dropped on purpose
 * (Next throws otherwise).
 */
export function createAuthServerClient({ writable = false } = {}) {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          if (!writable) return;
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}
