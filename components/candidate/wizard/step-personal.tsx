"use client";

import { Input } from "@/components/candidate/ui/input";
import { Label } from "@/components/candidate/ui/label";
import type { WizardData } from "@/components/candidate/wizard/types";
import { isValidEmail } from "@/components/candidate/wizard/types";

export function StepPersonal({
  data,
  onChange,
  showErrors,
}: {
  data: WizardData;
  onChange: (patch: Partial<WizardData["personal"]>) => void;
  showErrors: boolean;
}) {
  const p = data.personal;
  const nameError = showErrors && !p.fullName.trim() ? "Full name is required." : null;
  const emailError = showErrors
    ? !p.email.trim()
      ? "Email is required."
      : !isValidEmail(p.email)
      ? "Enter a valid email address."
      : null
    : null;

  return (
    <div>
      <h2 className="font-candidate-heading text-xl font-bold text-text-dark">Tell us about yourself</h2>
      <p className="mt-1.5 text-sm text-text-gray">
        Let&apos;s start with the basic information for your CV.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            className="mt-1.5"
            placeholder="Jordan Alvarez"
            value={p.fullName}
            error={!!nameError}
            onChange={(e) => onChange({ fullName: e.target.value })}
          />
          {nameError && <p className="mt-1 text-xs text-red-600">{nameError}</p>}
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="desiredTitle">Professional Title / Desired Position</Label>
          <Input
            id="desiredTitle"
            className="mt-1.5"
            placeholder="Senior Software Engineer"
            value={p.desiredTitle}
            onChange={(e) => onChange({ desiredTitle: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            className="mt-1.5"
            placeholder="you@email.com"
            value={p.email}
            error={!!emailError}
            onChange={(e) => onChange({ email: e.target.value })}
          />
          {emailError && <p className="mt-1 text-xs text-red-600">{emailError}</p>}
        </div>

        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            className="mt-1.5"
            placeholder="(555) 019-2231"
            value={p.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            className="mt-1.5"
            placeholder="Austin, TX"
            value={p.location}
            onChange={(e) => onChange({ location: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="linkedin">LinkedIn URL (optional)</Label>
          <Input
            id="linkedin"
            className="mt-1.5"
            placeholder="linkedin.com/in/you"
            value={p.linkedin}
            onChange={(e) => onChange({ linkedin: e.target.value })}
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="portfolio">Portfolio / Website (optional)</Label>
          <Input
            id="portfolio"
            className="mt-1.5"
            placeholder="yourname.dev"
            value={p.portfolio}
            onChange={(e) => onChange({ portfolio: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
