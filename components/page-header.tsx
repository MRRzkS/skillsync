// Presentational only — takes already-translated strings so it works from
// both server and client components. Typography follows the UI team's
// "dash-head" pattern (design-handoff/SkillSync_revisi.html): a small
// uppercase eyebrow label, a bold heading, and an optional action on the
// right — reused across every HR page so the pattern stays consistent.
export default function PageHeader({
  title,
  subtitle,
  action,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  eyebrow?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 space-y-1.5">
        {typeof eyebrow === "string" ? (
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {eyebrow}
          </p>
        ) : (
          eyebrow
        )}
        <h1 className="font-heading text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="max-w-prose text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {action}
    </header>
  );
}
