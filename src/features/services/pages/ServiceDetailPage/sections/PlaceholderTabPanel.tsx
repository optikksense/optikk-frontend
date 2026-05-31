interface PlaceholderTabPanelProps {
  readonly title: string;
  readonly description: string;
}

export function PlaceholderTabPanel({ title, description }: PlaceholderTabPanelProps) {
  return (
    <section className="rounded-md border border-border border-dashed bg-card px-6 py-12 text-center">
      <div className="font-medium text-[14px] text-foreground">{title}</div>
      <p className="mx-auto mt-1 max-w-[420px] text-[12px] text-foreground-muted">{description}</p>
    </section>
  );
}
