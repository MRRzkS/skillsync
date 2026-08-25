import { cvSchema, type CvData } from "@/lib/candidate/cv-schema";

/**
 * Local wizard state. This is intentionally a superset of what CvData needs
 * (extra local-only fields like `id`, `current`, `noExperience`, and the
 * `desiredTitle` field which has no home in cvSchema) so the multi-step form
 * can manage editable rows. `wizardToCvData` is the single place that maps
 * this state down into the real CvData shape used by CV Preview, Supabase,
 * and the PDF — so preview/save/download can never drift apart.
 */

export interface WizardExperience {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface WizardEducation {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
}

export interface WizardData {
  personal: {
    fullName: string;
    desiredTitle: string; // UI-only context (not part of cvSchema); used for AI prompts & review display
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    portfolio: string;
  };
  summary: string;
  experience: WizardExperience[];
  noExperience: boolean;
  education: WizardEducation[];
  skills: string[];
  languages: string[];
}

let idCounter = 0;
export function makeId() {
  idCounter += 1;
  return `id_${Date.now()}_${idCounter}`;
}

export function emptyExperience(): WizardExperience {
  return {
    id: makeId(),
    role: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    bullets: [""],
  };
}

export function emptyEducation(): WizardEducation {
  return {
    id: makeId(),
    institution: "",
    degree: "",
    fieldOfStudy: "",
    startDate: "",
    endDate: "",
  };
}

export function createEmptyWizardData(): WizardData {
  return {
    personal: {
      fullName: "",
      desiredTitle: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      portfolio: "",
    },
    summary: "",
    experience: [],
    noExperience: false,
    education: [],
    skills: [],
    languages: [],
  };
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Maps wizard state into the real CvData shape. Never invents data — empty
 * fields stay empty, exactly as extract-cv.ts already promises for the AI path.
 */
export function wizardToCvData(wizard: WizardData): CvData {
  const skills = Array.from(new Set(wizard.skills.map((s) => s.trim()).filter(Boolean)));

  return {
    contact: {
      fullName: wizard.personal.fullName.trim(),
      email: wizard.personal.email.trim(),
      phone: wizard.personal.phone.trim(),
      location: wizard.personal.location.trim(),
      linkedin: wizard.personal.linkedin.trim(),
      portfolio: wizard.personal.portfolio.trim(),
    },
    summary: wizard.summary.trim(),
    skills,
    experience: wizard.noExperience
      ? []
      : wizard.experience
          .filter((e) => e.role.trim() || e.company.trim())
          .map((e) => ({
            company: e.company.trim(),
            role: e.role.trim(),
            startDate: e.startDate.trim(),
            endDate: e.current ? "Present" : e.endDate.trim(),
            location: e.location.trim(),
            bullets: e.bullets.map((b) => b.trim()).filter(Boolean),
          })),
    education: wizard.education
      .filter((e) => e.institution.trim() || e.degree.trim())
      .map((e) => ({
        institution: e.institution.trim(),
        degree: e.degree.trim(),
        fieldOfStudy: e.fieldOfStudy.trim(),
        startDate: e.startDate.trim(),
        endDate: e.endDate.trim(),
        gpa: "",
      })),
    projects: [],
    certifications: [],
    languages: Array.from(new Set(wizard.languages.map((l) => l.trim()).filter(Boolean))),
    // Reuses the candidate's own skill list rather than inventing new terms.
    atsKeywords: skills,
  };
}

export function validateWizardCv(wizard: WizardData) {
  return cvSchema.safeParse(wizardToCvData(wizard));
}

/**
 * The inverse of wizardToCvData, for reopening the builder with a
 * previously-saved CV (see app/candidate/(app)/resume-builder/page.tsx) so
 * "Edit Information" doesn't start from a blank form. Lossy in one place:
 * `desiredTitle` has no home in cvSchema, so it comes back empty — everything
 * else round-trips.
 */
export function cvDataToWizardData(cv: CvData): WizardData {
  return {
    personal: {
      fullName: cv.contact.fullName,
      desiredTitle: "",
      email: cv.contact.email,
      phone: cv.contact.phone,
      location: cv.contact.location,
      linkedin: cv.contact.linkedin,
      portfolio: cv.contact.portfolio,
    },
    summary: cv.summary,
    experience: cv.experience.map((e) => ({
      id: makeId(),
      role: e.role,
      company: e.company,
      location: e.location,
      startDate: e.startDate,
      endDate: e.endDate === "Present" ? "" : e.endDate,
      current: e.endDate === "Present",
      bullets: e.bullets.length > 0 ? e.bullets : [""],
    })),
    noExperience: cv.experience.length === 0,
    education: cv.education.map((e) => ({
      id: makeId(),
      institution: e.institution,
      degree: e.degree,
      fieldOfStudy: e.fieldOfStudy,
      startDate: e.startDate,
      endDate: e.endDate,
    })),
    skills: cv.skills,
    languages: cv.languages,
  };
}
