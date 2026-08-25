"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_STORAGE_KEY,
  LOCALES,
  translate,
  type Locale,
  type TranslateFn,
} from "./translate";

// Lightweight localization: plain JSON dictionaries + `{variable}`
// interpolation. Deliberately not a routing-based i18n framework — this is an
// internal HR tool with two languages and no SEO requirement, so the locale
// lives in localStorage rather than in the URL.

export { LOCALES, translate };
export type { Locale, TranslateFn };

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslateFn;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // Read after mount rather than during render: the server can't see
  // localStorage, so starting from the default keeps hydration consistent.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      if (isLocale(stored)) setLocaleState(stored);
    } catch {
      // Private mode / blocked storage — stay on the default locale.
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // Persisting is best-effort; the in-memory switch still works.
    }
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, vars) => translate(locale, key, vars),
    }),
    [locale, setLocale]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

/**
 * Returns the active locale and a `t()` translator. Falls back to English
 * outside a LocaleProvider so component trees that are intentionally not
 * localized (the candidate-facing assessment page) don't crash.
 */
export function useTranslation(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (context) return context;
  return {
    locale: DEFAULT_LOCALE,
    setLocale: () => {},
    t: (key, vars) => translate(DEFAULT_LOCALE, key, vars),
  };
}
