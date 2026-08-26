"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Languages, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PageHeader from "@/components/page-header";
import UserAvatar from "@/components/user-avatar";
import { signOut } from "@/actions/sign-out";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { LOCALES, useTranslation, type Locale } from "@/lib/i18n";

// Account settings, matching the reference's tab rail
// (design-handoff/UI_SkillSync/hr_pengaturan-akun.png). The reference also
// shows "Company" and "Notifications" tabs — there's no company entity and no
// notification system behind them, so they're left out rather than mocked.
// Profile fields are stored on the Supabase auth user's metadata, which is
// where full_name already lives (see components/auth-form.tsx).
type Tab = "profile" | "security" | "language";

const TABS: { id: Tab; labelKey: string; icon: typeof User }[] = [
  { id: "profile", labelKey: "settings.tabProfile", icon: User },
  { id: "security", labelKey: "settings.tabSecurity", icon: KeyRound },
  { id: "language", labelKey: "settings.tabLanguage", icon: Languages },
];

const LOCALE_LABELS: Record<Locale, string> = { en: "English", id: "Bahasa Indonesia" };

export default function SettingsView({
  email,
  fullName,
  jobTitle,
  phone,
}: {
  email: string;
  fullName: string;
  jobTitle: string;
  phone: string;
}) {
  const { t, locale, setLocale } = useTranslation();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("profile");

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-6 md:p-10">
      <PageHeader
        eyebrow={t("settings.eyebrow")}
        title={t("settings.title")}
        subtitle={t("settings.subtitle")}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[240px_1fr]">
        <Card className="h-fit p-2">
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
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                      active
                        ? "bg-secondary font-medium text-foreground"
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    {t(item.labelKey)}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-2 border-t border-border pt-2">
            <form action={signOut.bind(null, "/login")}>
              <button
                type="submit"
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4 shrink-0" aria-hidden />
                {t("auth.signOut")}
              </button>
            </form>
          </div>
        </Card>

        {tab === "profile" && (
          <ProfilePanel
            email={email}
            fullName={fullName}
            jobTitle={jobTitle}
            phone={phone}
            onSaved={() => router.refresh()}
          />
        )}
        {tab === "security" && <SecurityPanel />}
        {tab === "language" && (
          <Card className="space-y-4 p-6">
            <h2 className="font-heading text-lg font-bold">
              {t("settings.languageHeading")}
            </h2>
            <p className="text-sm text-muted-foreground">{t("settings.languageNote")}</p>
            <div className="flex flex-wrap gap-2">
              {LOCALES.map((code) => (
                <Button
                  key={code}
                  variant={locale === code ? "default" : "outline"}
                  onClick={() => setLocale(code)}
                >
                  {LOCALE_LABELS[code]}
                </Button>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function ProfilePanel({
  email,
  fullName,
  jobTitle,
  phone,
  onSaved,
}: {
  email: string;
  fullName: string;
  jobTitle: string;
  phone: string;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState(fullName);
  const [title, setTitle] = useState(jobTitle);
  const [tel, setTel] = useState(phone);
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSave() {
    setStatus("saving");
    setMessage(null);
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name, job_title: title, phone: tel },
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
    <Card className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <h2 className="font-heading text-lg font-bold">{t("settings.profileHeading")}</h2>
        <Button onClick={handleSave} disabled={status === "saving"}>
          {status === "saving" ? t("settings.saving") : t("settings.save")}
        </Button>
      </div>

      <div className="flex items-center gap-4 border-b border-border pb-6">
        <UserAvatar name={name} email={email} avatarUrl={null} size={56} />
        <div>
          <p className="text-sm font-medium">{t("settings.avatarHeading")}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("settings.avatarNote")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="settings-name">{t("settings.fullName")}</Label>
          <Input
            id="settings-name"
            className="mt-1.5"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="settings-title">{t("settings.jobTitle")}</Label>
          <Input
            id="settings-title"
            className="mt-1.5"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="settings-email">{t("settings.email")}</Label>
          <Input id="settings-email" className="mt-1.5" value={email} disabled readOnly />
          <p className="mt-1 text-xs text-muted-foreground">
            {t("settings.emailReadOnly")}
          </p>
        </div>
        <div>
          <Label htmlFor="settings-phone">{t("settings.phone")}</Label>
          <Input
            id="settings-phone"
            className="mt-1.5"
            value={tel}
            onChange={(e) => setTel(e.target.value)}
          />
        </div>
      </div>

      {message && (
        <p
          className={`text-sm ${status === "error" ? "text-destructive" : "text-success"}`}
        >
          {message}
        </p>
      )}
    </Card>
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
    <Card className="space-y-5 p-6">
      <h2 className="font-heading text-lg font-bold">{t("settings.securityHeading")}</h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="settings-password">{t("settings.newPassword")}</Label>
          <Input
            id="settings-password"
            type="password"
            className="mt-1.5"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="settings-confirm">{t("settings.confirmPassword")}</Label>
          <Input
            id="settings-confirm"
            type="password"
            className="mt-1.5"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
      </div>

      <Button onClick={handleUpdate} disabled={status === "saving"}>
        {status === "saving" ? t("settings.saving") : t("settings.updatePassword")}
      </Button>

      {message && (
        <p
          className={`text-sm ${status === "error" ? "text-destructive" : "text-success"}`}
        >
          {message}
        </p>
      )}
    </Card>
  );
}
