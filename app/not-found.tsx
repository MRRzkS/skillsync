"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

// LocaleProvider now wraps the whole app from the root layout, so this can use
// the hook instead of the default-locale translator it used when /hr was the
// only localized area.
export default function NotFound() {
  const { t } = useTranslation();

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md space-y-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          404
        </p>
        <h1 className="text-xl font-semibold tracking-tight">
          {t("common.notFoundTitle")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("common.notFoundBody")}</p>
        <Button asChild className="mt-2">
          <Link href="/">{t("common.goHome")}</Link>
        </Button>
      </div>
    </main>
  );
}
