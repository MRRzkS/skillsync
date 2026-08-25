import Link from "next/link";
import { Button } from "@/components/ui/button";
import { translate } from "@/lib/i18n/translate";

// Rendered outside the /hr layout (and therefore outside LocaleProvider), so
// this uses the default-locale translator rather than the hook.
export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md space-y-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          404
        </p>
        <h1 className="text-xl font-semibold tracking-tight">
          {translate("en", "common.notFoundTitle")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {translate("en", "common.notFoundBody")}
        </p>
        <Button asChild className="mt-2">
          <Link href="/hr/jobs">{translate("en", "common.goToJobs")}</Link>
        </Button>
      </div>
    </main>
  );
}
