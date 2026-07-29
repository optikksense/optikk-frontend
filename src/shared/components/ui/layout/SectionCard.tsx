interface SectionCardProps {
  readonly title: string;
  /** Optional muted line under the title. */
  readonly description?: string;
  /** Optional control rendered on the right of the header (a button, a link…). */
  readonly action?: React.ReactNode;
  readonly children: React.ReactNode;
}

/**
 * The bordered card used for the titled sections of a detail page (services,
 * containers, logs, about…). Use this instead of repeating the card classes so
 * every section keeps the same frame, title weight, and header spacing.
 */
export function SectionCard({
  title,
  description,
  action,
  children,
}: SectionCardProps): JSX.Element {
  return (
    <section className="rounded-md border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="font-semibold text-[13px] text-foreground">{title}</div>
          {description !== undefined && (
            <div className="text-[11px] text-foreground-muted">{description}</div>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
