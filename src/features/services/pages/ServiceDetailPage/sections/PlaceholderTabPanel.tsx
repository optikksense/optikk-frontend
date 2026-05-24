interface PlaceholderTabPanelProps {
  readonly title: string;
  readonly description: string;
}

export function PlaceholderTabPanel({ title, description }: PlaceholderTabPanelProps) {
  return (
    <section className="rounded-md border border-[var(--border-color)] border-dashed bg-[var(--bg-card)] px-6 py-12 text-center">
      <div className="font-medium text-[14px] text-[var(--text-primary)]">{title}</div>
      <p className="mx-auto mt-1 max-w-[420px] text-[12px] text-[var(--text-muted)]">
        {description}
      </p>
    </section>
  );
}
