import type { DrawerSectionProps } from "./types";

export function DrawerSection({ title, subtitle, children }: DrawerSectionProps) {
  return (
    <section className="rounded-[var(--card-radius)] border border-border bg-card p-4">
      <div className="mb-3">
        <h3 className="font-semibold text-[14px] text-foreground">{title}</h3>
        {subtitle ? <p className="mt-1 text-[12px] text-foreground-secondary">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}
