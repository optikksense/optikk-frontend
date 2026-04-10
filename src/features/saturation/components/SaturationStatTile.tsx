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
    <Card
      padding="lg"
      className="min-h-[108px] border-[var(--border-color)] bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.01))]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
            {label}
          </div>
          <div className="mt-3 font-semibold text-[28px] text-[var(--text-primary)] leading-none">
            {value}
          </div>
          {meta ? (
            <div className="mt-2 text-[11px] text-[var(--text-secondary)] leading-5">{meta}</div>
          ) : null}
        </div>
        <div className="rounded-full border border-[var(--border-color)] bg-[rgba(255,255,255,0.04)] p-2 text-[var(--text-secondary)]">
          {icon}
        </div>
      </div>
    </Card>
  );
}
