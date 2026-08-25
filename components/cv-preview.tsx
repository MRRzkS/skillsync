"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "@/lib/i18n";
import type {
  CvEducation,
  CvExperience,
  CvJson,
  CvProject,
} from "@/lib/types";

// Renders a candidate's cv_json as something a recruiter can actually read.
// Every section is skipped entirely when its data is missing, since the
// Candidate module's output varies per candidate.

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function cleanList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter(isNonEmptyString) : [];
}

/** Accepts either a single `period` string or split start/end dates. */
function formatPeriod(item: {
  period?: string;
  startDate?: string;
  endDate?: string;
}): string | null {
  if (isNonEmptyString(item.period)) return item.period;
  const parts = [item.startDate, item.endDate].filter(isNonEmptyString);
  return parts.length > 0 ? parts.join(" – ") : null;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h4>
      {children}
    </section>
  );
}

function ExperienceItem({ item }: { item: CvExperience }) {
  const role = item.role ?? item.title;
  const period = formatPeriod(item);
  const bullets = cleanList(item.bullets);
  const meta = [item.company, item.location].filter(isNonEmptyString).join(" · ");

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        {isNonEmptyString(role) && (
          <p className="text-sm font-medium">{role}</p>
        )}
        {period && (
          <p className="text-xs text-muted-foreground">{period}</p>
        )}
      </div>
      {meta && <p className="text-xs text-muted-foreground">{meta}</p>}
      {bullets.length > 0 && (
        <ul className="list-disc space-y-1 pl-4 text-sm text-foreground/80">
          {bullets.map((bullet, i) => (
            <li key={i}>{bullet}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EducationItem({ item }: { item: CvEducation }) {
  const school = item.institution ?? item.school;
  const period = formatPeriod(item);
  const degree = [item.degree, item.fieldOfStudy]
    .filter(isNonEmptyString)
    .join(", ");

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        {isNonEmptyString(school) && (
          <p className="text-sm font-medium">{school}</p>
        )}
        {period && (
          <p className="text-xs text-muted-foreground">{period}</p>
        )}
      </div>
      {degree && <p className="text-xs text-muted-foreground">{degree}</p>}
      {isNonEmptyString(item.gpa) && (
        <p className="text-xs text-muted-foreground">GPA {item.gpa}</p>
      )}
    </div>
  );
}

function ProjectItem({ item }: { item: CvProject }) {
  const name = item.name ?? item.title;
  const bullets = cleanList(item.bullets);

  return (
    <div className="space-y-1">
      {isNonEmptyString(name) && (
        <p className="text-sm font-medium">{name}</p>
      )}
      {isNonEmptyString(item.description) && (
        <p className="text-sm text-foreground/80">{item.description}</p>
      )}
      {isNonEmptyString(item.link) && (
        <p className="break-all text-xs text-muted-foreground">{item.link}</p>
      )}
      {bullets.length > 0 && (
        <ul className="list-disc space-y-1 pl-4 text-sm text-foreground/80">
          {bullets.map((bullet, i) => (
            <li key={i}>{bullet}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function BadgeList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <Badge key={i} variant="secondary" className="font-normal">
          {item}
        </Badge>
      ))}
    </div>
  );
}

export default function CvPreview({ cv }: { cv: CvJson | null | undefined }) {
  const { t } = useTranslation();

  if (!cv || typeof cv !== "object") {
    return <p className="text-sm text-muted-foreground">{t("cv.empty")}</p>;
  }

  const contactLines = [
    cv.contact?.email,
    cv.contact?.phone,
    cv.contact?.location,
    cv.contact?.linkedin,
    cv.contact?.portfolio,
  ].filter(isNonEmptyString);

  const experience = Array.isArray(cv.experience) ? cv.experience : [];
  const education = Array.isArray(cv.education) ? cv.education : [];
  const projects = Array.isArray(cv.projects) ? cv.projects : [];
  const skills = cleanList(cv.skills);
  const languages = cleanList(cv.languages);
  const certifications = cleanList(cv.certifications);
  const keywords = cleanList(cv.atsKeywords);

  const sections = [
    isNonEmptyString(cv.summary) && (
      <Section key="summary" title={t("cv.summary")}>
        <p className="text-sm text-foreground/80">{cv.summary}</p>
      </Section>
    ),
    contactLines.length > 0 && (
      <Section key="contact" title={t("cv.contact")}>
        <ul className="space-y-0.5 text-sm text-foreground/80">
          {contactLines.map((line, i) => (
            <li key={i} className="break-all">
              {line}
            </li>
          ))}
        </ul>
      </Section>
    ),
    experience.length > 0 && (
      <Section key="experience" title={t("cv.experience")}>
        <div className="space-y-4">
          {experience.map((item, i) => (
            <ExperienceItem key={i} item={item} />
          ))}
        </div>
      </Section>
    ),
    education.length > 0 && (
      <Section key="education" title={t("cv.education")}>
        <div className="space-y-4">
          {education.map((item, i) => (
            <EducationItem key={i} item={item} />
          ))}
        </div>
      </Section>
    ),
    projects.length > 0 && (
      <Section key="projects" title={t("cv.projects")}>
        <div className="space-y-4">
          {projects.map((item, i) => (
            <ProjectItem key={i} item={item} />
          ))}
        </div>
      </Section>
    ),
    skills.length > 0 && (
      <Section key="skills" title={t("cv.skills")}>
        <BadgeList items={skills} />
      </Section>
    ),
    certifications.length > 0 && (
      <Section key="certifications" title={t("cv.certifications")}>
        <ul className="list-disc space-y-1 pl-4 text-sm text-foreground/80">
          {certifications.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </Section>
    ),
    languages.length > 0 && (
      <Section key="languages" title={t("cv.languages")}>
        <p className="text-sm text-foreground/80">{languages.join(", ")}</p>
      </Section>
    ),
    keywords.length > 0 && (
      <Section key="keywords" title={t("cv.keywords")}>
        <BadgeList items={keywords} />
      </Section>
    ),
  ].filter(Boolean);

  if (sections.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("cv.empty")}</p>;
  }

  return (
    <div className="space-y-4">
      {sections.map((section, i) => (
        <div key={i} className="space-y-4">
          {i > 0 && <Separator />}
          {section}
        </div>
      ))}
    </div>
  );
}
