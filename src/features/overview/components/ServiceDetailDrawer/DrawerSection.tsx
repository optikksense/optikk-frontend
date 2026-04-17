import type { DrawerSectionProps } from "./types";

export function DrawerSection({ title, subtitle, children }: DrawerSectionProps) {
  return (
    <section className="rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-card)] p-4">
      <div className="mb-3">
        <h3 className="font-semibold text-[14px] text-[var(--text-primary)]">{title}</h3>
        {subtitle ? (
          <p className="mt-1 text-[12px] text-[var(--text-secondary)]">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
