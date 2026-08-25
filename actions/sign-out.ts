"use server";

import { redirect } from "next/navigation";
import { createAuthServerClient } from "@/lib/supabase/auth-server";

// Bind the destination at the call site (`signOut.bind(null, "/login")`) so
// each side of the app returns to its own door. The trailing FormData arg is
// what React passes to a form action; it's unused.
export async function signOut(redirectTo: string, _formData?: FormData) {
  const supabase = createAuthServerClient({ writable: true });
  await supabase.auth.signOut();
  redirect(redirectTo);
}
