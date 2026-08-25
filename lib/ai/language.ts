// Free-tier models don't reliably follow a soft "reply in the same language
// as the input" instruction, especially on short input — they default to
// English. So we detect the language ourselves and tell the model exactly
// which one to use, instead of asking it to infer.
const INDONESIAN_MARKERS =
  /\b(yang|dan|untuk|dengan|minimal|tahun|pengalaman|mampu|bisa|kandidat|kerja|posisi|lowongan|memiliki|menguasai|bertanggung|jawab|mengelola|membuat|karyawan|perusahaan|calon|diutamakan|wajib|gaji|lokasi|pendidikan|jurusan|sarjana|lulusan|kualifikasi|kemampuan)\b/gi;

export type SupportedLanguage = "id" | "en";

export function detectLanguage(text: string): SupportedLanguage {
  const matches = text.match(INDONESIAN_MARKERS);
  return matches && matches.length >= 2 ? "id" : "en";
}

/**
 * Prefers an explicit language over guessing — our own UI knows the HR
 * user's chosen locale (lib/i18n) and should just pass it through instead
 * of relying on keyword detection, which is only a fallback for callers
 * that don't send one (the external API contract, or short/ambiguous text).
 */
export function resolveLanguage(
  explicit: string | null | undefined,
  fallbackText: string
): SupportedLanguage {
  if (explicit === "id" || explicit === "en") return explicit;
  return detectLanguage(fallbackText);
}

export function languageInstruction(language: SupportedLanguage): string {
  return language === "id"
    ? "Write your entire response in Bahasa Indonesia. Do not use English."
    : "Write your entire response in English.";
}
