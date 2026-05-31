import type { ReactNode } from "react";

import { Card } from "@shared/components/primitives/ui";

export function SaturationStatTile({
  label,
  value,
  meta,
  icon,
}: {
  label: string;
  value: string;
  meta?: string;
  icon: ReactNode;
}): JSX.Element {
  return (
    <Card padding="lg" className="min-h-[108px] border-border bg-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] text-foreground-muted uppercase tracking-[0.08em]">
            {label}
          </div>
          <div className="mt-3 font-semibold text-[28px] text-foreground leading-none">{value}</div>
          {meta ? (
            <div className="mt-2 text-[11px] text-foreground-secondary leading-5">{meta}</div>
          ) : null}
        </div>
        <div className="rounded-full border border-border bg-[var(--bg-2)] p-2 text-foreground-secondary">
          {icon}
        </div>
      </div>
    </Card>
  );
}
