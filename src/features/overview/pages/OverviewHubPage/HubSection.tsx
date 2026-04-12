import type { ReactNode } from "react";

interface HubSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function HubSection({ title, description, children, actions }: HubSectionProps) {
  return (
    <section className="mb-6">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-semibold text-[15px] text-[var(--text-primary)] tracking-tight">{title}</h2>
          {description ? (
            <p className="mt-0.5 max-w-3xl text-[12px] text-[var(--text-muted)] leading-relaxed">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}
