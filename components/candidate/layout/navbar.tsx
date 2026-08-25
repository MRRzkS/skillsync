"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SkillSyncLogo } from "@/components/candidate/layout/skillsync-logo";
import { LogOut, FileText, Briefcase } from "lucide-react";
import { signOut } from "@/actions/sign-out";

const NAV_ITEMS = [
  { label: "CV Builder", href: "/candidate/resume-builder", icon: FileText },
  { label: "Jobs", href: "/candidate/jobs", icon: Briefcase },
];

export function Navbar({ initial }: { initial: string }) {
  const currentPath = usePathname();
  return (
    <header className="sticky top-0 z-20 border-b border-ocean-100/70 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 lg:px-8">
        <Link href="/candidate/resume-builder" className="flex items-center gap-2.5">
          <SkillSyncLogo className="h-8 w-8" />
          <div className="leading-tight">
            <p className="font-candidate-heading text-lg font-bold text-text-dark">
              Skill<span className="text-sync-purple-600">sync</span>
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href;
            return (
              <Link key={item.label} href={item.href}>
                <span
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-ocean-50 text-ocean-700"
                      : "text-text-gray hover:bg-ocean-50/70 hover:text-ocean-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <form action={signOut.bind(null, "/candidate/login")}>
          <button
            type="submit"
            title="Log out"
            className="group flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-ocean-600 to-sync-purple-600 font-candidate-heading text-sm font-semibold text-white"
          >
            <span className="group-hover:hidden">{initial}</span>
            <LogOut className="hidden h-4 w-4 group-hover:block" aria-hidden />
          </button>
        </form>
      </div>
    </header>
  );
}
