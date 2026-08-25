import en from "./en.json";
import id from "./id.json";

// Framework-free translation core. Kept out of the "use client" module so
// server components (e.g. app/not-found.tsx) can translate too.

const DICTIONARIES = { en, id };

export type Locale = keyof typeof DICTIONARIES;
export const LOCALES = Object.keys(DICTIONARIES) as Locale[];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_STORAGE_KEY = "talentpulse.locale";

export type TranslateFn = (
  key: string,
  vars?: Record<string, string | number>
) => string;

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as string[]).includes(value);
}

function lookup(dictionary: unknown, key: string): string | undefined {
  const value = key
    .split(".")
    .reduce<unknown>(
      (acc, part) =>
        acc && typeof acc === "object"
          ? (acc as Record<string, unknown>)[part]
          : undefined,
      dictionary
    );
  return typeof value === "string" ? value : undefined;
}

function interpolate(
  template: string,
  vars?: Record<string, string | number>
): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match
  );
}

/** Falls back to English, then to the key itself, so UI never renders blank. */
export function translate(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>
): string {
  const raw =
    lookup(DICTIONARIES[locale], key) ??
    lookup(DICTIONARIES[DEFAULT_LOCALE], key) ??
    key;
  return interpolate(raw, vars);
}
