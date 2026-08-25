import { Badge } from "@/components/candidate/ui/badge";
import type { CvData } from "@/lib/candidate/cv-schema";
import { normalizeUrl } from "@/lib/utils";
import { AlertTriangle, Mail, Phone, MapPin, Link2, Globe } from "lucide-react";

export function CvPreview({ cv, warnings }: { cv: CvData; warnings: string[] }) {
  return (
    <div id="cv-document" className="flex flex-1 flex-col gap-5 animate-fade-up">
      {warnings.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <ul className="space-y-0.5">
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Document card */}
      <div className="rounded-2xl border border-ocean-100/60 bg-white p-6 shadow-card-lg lg:p-8">
        {/* Identity block */}
        <div>
          <h1 className="font-candidate-heading text-2xl font-bold text-text-dark">
            {cv.contact.fullName || "—"}
          </h1>
          {cv.experience[0]?.role && (
            <p className="mt-0.5 text-sm font-medium text-sync-purple-600">
              {cv.experience[0].role}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-text-gray">
            {cv.contact.email && (
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" /> {cv.contact.email}
              </span>
            )}
            {cv.contact.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" /> {cv.contact.phone}
              </span>
            )}
            {cv.contact.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {cv.contact.location}
              </span>
            )}
            {cv.contact.linkedin && (
              <a
                href={normalizeUrl(cv.contact.linkedin)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-ocean-700 underline-offset-2 hover:text-sync-purple-600 hover:underline"
              >
                <Link2 className="h-3.5 w-3.5" /> {cv.contact.linkedin}
              </a>
            )}
            {cv.contact.portfolio && (
              <a
                href={normalizeUrl(cv.contact.portfolio)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-ocean-700 underline-offset-2 hover:text-sync-purple-600 hover:underline"
              >
                <Globe className="h-3.5 w-3.5" /> {cv.contact.portfolio}
              </a>
            )}
          </div>
        </div>

        <div className="my-6 h-px bg-ocean-100/70" />

        <div className="space-y-6">
          {cv.summary && (
            <section>
              <h2 className="font-candidate-heading text-xs font-bold uppercase tracking-wide text-ocean-700">
                Professional Summary
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-text-dark/90">{cv.summary}</p>
            </section>
          )}

          {cv.experience.length > 0 && (
            <section>
              <h2 className="font-candidate-heading text-xs font-bold uppercase tracking-wide text-ocean-700">
                Experience
              </h2>
              <div className="mt-3 space-y-4">
                {cv.experience.map((exp, i) => (
                  <div key={i}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <p className="text-sm font-semibold text-text-dark">
                        {exp.role} <span className="text-text-gray">· {exp.company}</span>
                      </p>
                      <p className="text-xs text-text-gray">
                        {exp.startDate} – {exp.endDate}
                      </p>
                    </div>
                    {exp.location && <p className="text-xs text-text-gray">{exp.location}</p>}
                    <ul className="mt-1.5 space-y-1">
                      {exp.bullets.map((b, j) => (
                        <li key={j} className="flex gap-2 text-sm leading-relaxed text-text-dark/90">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-sync-purple-600" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {cv.education.length > 0 && (
            <section>
              <h2 className="font-candidate-heading text-xs font-bold uppercase tracking-wide text-ocean-700">
                Education
              </h2>
              <div className="mt-3 space-y-2">
                {cv.education.map((ed, i) => (
                  <div key={i} className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <p className="text-sm font-medium text-text-dark">
                      {ed.degree}
                      {ed.fieldOfStudy ? `, ${ed.fieldOfStudy}` : ""}{" "}
                      <span className="text-text-gray">· {ed.institution}</span>
                    </p>
                    <p className="text-xs text-text-gray">
                      {ed.startDate} – {ed.endDate}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {cv.projects.length > 0 && (
            <section>
              <h2 className="font-candidate-heading text-xs font-bold uppercase tracking-wide text-ocean-700">
                Projects
              </h2>
              <div className="mt-3 space-y-3">
                {cv.projects.map((p, i) => (
                  <div key={i}>
                    <p className="text-sm font-medium text-text-dark">{p.name}</p>
                    {p.description && (
                      <p className="text-sm text-text-dark/80">{p.description}</p>
                    )}
                    {p.technologies.length > 0 && (
                      <p className="mt-1 text-xs text-text-gray">{p.technologies.join(" · ")}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {cv.skills.length > 0 && (
            <section>
              <h2 className="font-candidate-heading text-xs font-bold uppercase tracking-wide text-ocean-700">
                Skills
              </h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {cv.skills.map((skill) => (
                  <Badge key={skill} variant="ocean">
                    {skill}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {(cv.certifications.length > 0 || cv.languages.length > 0) && (
            <section>
              <h2 className="font-candidate-heading text-xs font-bold uppercase tracking-wide text-ocean-700">
                Additional
              </h2>
              <div className="mt-2 space-y-1 text-sm text-text-dark/90">
                {cv.certifications.length > 0 && (
                  <p>
                    <span className="text-text-gray">Certifications: </span>
                    {cv.certifications.join(", ")}
                  </p>
                )}
                {cv.languages.length > 0 && (
                  <p>
                    <span className="text-text-gray">Languages: </span>
                    {cv.languages.join(", ")}
                  </p>
                )}
              </div>
            </section>
          )}

          {cv.atsKeywords.length > 0 && (
            <section>
              <h2 className="font-candidate-heading text-xs font-bold uppercase tracking-wide text-ocean-700">
                ATS Keywords
              </h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {cv.atsKeywords.map((k) => (
                  <Badge key={k} variant="outline-soft">
                    {k}
                  </Badge>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
