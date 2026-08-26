import { createAuthServerClient } from "@/lib/supabase/auth-server";
import SettingsView from "./settings-view";

export const dynamic = "force-dynamic";

// The HR layout already guarantees a signed-in HR user; this just reads the
// current values so the form doesn't start empty.
export default async function HrSettingsPage() {
  const supabase = createAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const metadata = user?.user_metadata ?? {};

  return (
    <SettingsView
      email={user?.email ?? ""}
      fullName={metadata.full_name ?? metadata.name ?? ""}
      jobTitle={metadata.job_title ?? ""}
      phone={metadata.phone ?? ""}
    />
  );
}
