"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, Languages, LogOut, Pencil, User } from "lucide-react";
import { Button } from "@/components/candidate/ui/button";
import { Input } from "@/components/candidate/ui/input";
import { Label } from "@/components/candidate/ui/label";
import { signOut } from "@/actions/sign-out";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { LOCALES, useTranslation, type Locale } from "@/lib/i18n";

// Candidate-side account settings — same shape as the HR one
// (app/hr/settings), drawn with this module's own tokens and UI kit, since the
// two design systems are kept apart on purpose (see CLAUDE.md). Profile fields
// live on the Supabase auth user's metadata, the same place signup writes
// full_name.
type Tab = "profile" | "security" | "language";

const TABS: { id: Tab; labelKey: string; icon: typeof User }[] = [
  { id: "profile", labelKey: "settings.tabProfile", icon: User },
  { id: "security", labelKey: "settings.tabSecurity", icon: KeyRound },
  { id: "language", labelKey: "settings.tabLanguage", icon: Languages },
];

const LOCALE_LABELS: Record<Locale, string> = { en: "English", id: "Bahasa Indonesia" };

const CARD = "rounded-2xl border border-ocean-100/60 bg-white shadow-card";

export function CandidateSettingsView({
  email,
  fullName,
  phone,
  location,
  linkedin,
  portfolio,
}: {
  email: string;
  fullName: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
}) {
  const { t, locale, setLocale } = useTranslation();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("profile");

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-8 lg:px-8">
      <h1 className="font-candidate-heading text-3xl font-bold text-text-dark">
        {t("settings.title")}
      </h1>
      <p className="mt-1 text-sm leading-relaxed text-text-gray">
        {t("settings.subtitle")}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
        <div className={`${CARD} h-fit p-2`}>
          <ul className="space-y-1">
            {TABS.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setTab(item.id)}
                    aria-current={active ? "page" : undefined}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                      active
                        ? "bg-ocean-50 font-semibold text-ocean-700"
                        : "text-text-gray hover:bg-ocean-50/60 hover:text-text-dark"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    {t(item.labelKey)}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-2 border-t border-ocean-100/70 pt-2">
            <form action={signOut.bind(null, "/candidate/login")}>
              <button
                type="submit"
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-red-500 transition-colors hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 shrink-0" aria-hidden />
                {t("candidate.signOut")}
              </button>
            </form>
          </div>
        </div>

        {tab === "profile" && (
          <ProfilePanel
            email={email}
            fullName={fullName}
            phone={phone}
            location={location}
            linkedin={linkedin}
            portfolio={portfolio}
            onSaved={() => router.refresh()}
          />
        )}
        {tab === "security" && <SecurityPanel />}
        {tab === "language" && (
          <div className={`${CARD} space-y-4 p-6`}>
            <h2 className="font-candidate-heading text-lg font-bold text-text-dark">
              {t("settings.languageHeading")}
            </h2>
            <p className="text-sm text-text-gray">{t("settings.languageNote")}</p>
            <div className="flex flex-wrap gap-2">
              {LOCALES.map((code) => (
                <Button
                  key={code}
                  variant={locale === code ? "ai" : "outline-soft"}
                  onClick={() => setLocale(code)}
                >
                  {LOCALE_LABELS[code]}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfilePanel({
  email,
  fullName,
  phone,
  location,
  linkedin,
  portfolio,
  onSaved,
}: {
  email: string;
  fullName: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState(fullName);
  const [tel, setTel] = useState(phone);
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSave() {
    setStatus("saving");
    setMessage(null);
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name, phone: tel },
    });
    if (error) {
      setStatus("error");
      setMessage(t("settings.saveFailed"));
      return;
    }
    setStatus("done");
    setMessage(t("settings.saved"));
    onSaved();
  }

  return (
    <div className={`${CARD} space-y-6 p-6`}>
      <div className="flex items-start justify-between gap-4">
        <h2 className="font-candidate-heading text-lg font-bold text-text-dark">
          {t("settings.profileHeading")}
        </h2>
        <Button variant="ai" onClick={handleSave} disabled={status === "saving"}>
          {status === "saving" ? t("settings.saving") : t("settings.save")}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="cs-name">{t("settings.fullName")}</Label>
          <Input
            id="cs-name"
            className="mt-1.5"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="cs-phone">{t("settings.phone")}</Label>
          <Input
            id="cs-phone"
            className="mt-1.5"
            value={tel}
            onChange={(e) => setTel(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="cs-email">{t("settings.email")}</Label>
          <Input id="cs-email" className="mt-1.5" value={email} disabled readOnly />
          <p className="mt-1 text-xs text-text-gray">{t("settings.emailReadOnly")}</p>
        </div>
      </div>

      {message && (
        <p className={`text-sm ${status === "error" ? "text-red-600" : "text-mint-600"}`}>
          {message}
        </p>
      )}

      {/* Location/LinkedIn/Portfolio live on the CV, not the auth user — shown
          read-only here instead of as a second editable copy that could drift
          out of sync with what the wizard actually saved. */}
      <div className="border-t border-ocean-100/70 pt-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-sm font-semibold text-text-dark">
            {t("settings.cvFieldsHeading")}
          </h3>
          <Link
            href="/candidate/resume-builder"
            className="flex shrink-0 items-center gap-1 text-xs font-medium text-sync-purple-600 hover:text-sync-purple-700"
          >
            <Pencil className="h-3.5 w-3.5" /> {t("settings.cvFieldsEdit")}
          </Link>
        </div>
        <p className="mt-1 text-xs text-text-gray">{t("settings.cvFieldsNote")}</p>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <ReadOnlyField label={t("settings.location")} value={location} />
          <ReadOnlyField label={t("settings.linkedin")} value={linkedin} />
          <div className="sm:col-span-2">
            <ReadOnlyField label={t("settings.portfolio")} value={portfolio} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  const { t } = useTranslation();
  return (
    <div>
      <Label>{label}</Label>
      <p className="mt-1.5 truncate rounded-lg border border-ocean-100 bg-ocean-50/40 px-3 py-2 text-sm text-text-dark">
        {value || t("settings.cvFieldEmpty")}
      </p>
    </div>
  );
}

function SecurityPanel() {
  const { t } = useTranslation();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleUpdate() {
    if (password.length < 8) {
      setStatus("error");
      setMessage(t("settings.passwordTooShort"));
      return;
    }
    if (password !== confirm) {
      setStatus("error");
      setMessage(t("settings.passwordMismatch"));
      return;
    }

    setStatus("saving");
    setMessage(null);
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setStatus("error");
      setMessage(error.message || t("settings.passwordFailed"));
      return;
    }
    setStatus("done");
    setMessage(t("settings.passwordUpdated"));
    setPassword("");
    setConfirm("");
  }

  return (
    <div className={`${CARD} space-y-5 p-6`}>
      <h2 className="font-candidate-heading text-lg font-bold text-text-dark">
        {t("settings.securityHeading")}
      </h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="cs-password">{t("settings.newPassword")}</Label>
          <Input
            id="cs-password"
            type="password"
            className="mt-1.5"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="cs-confirm">{t("settings.confirmPassword")}</Label>
          <Input
            id="cs-confirm"
            type="password"
            className="mt-1.5"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
      </div>

      <Button variant="ai" onClick={handleUpdate} disabled={status === "saving"}>
        {status === "saving" ? t("settings.saving") : t("settings.updatePassword")}
      </Button>

      {message && (
        <p className={`text-sm ${status === "error" ? "text-red-600" : "text-mint-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
