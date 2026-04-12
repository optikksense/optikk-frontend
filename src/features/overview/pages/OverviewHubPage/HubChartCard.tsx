import type { ReactNode } from "react";

import { Surface } from "@/components/ui";

interface HubChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function HubChartCard({ title, description, children, className }: HubChartCardProps) {
  return (
    <Surface
      elevation={1}
      padding="xs"
      className={`flex min-h-[260px] flex-col overflow-hidden ${className ?? ""}`}
    >
      <div className="chart-card__title shrink-0">{title}</div>
      {description ? (
        <p className="mb-1 px-0.5 text-[11px] text-[var(--text-muted)] leading-snug">{description}</p>
      ) : null}
      <div className="min-h-0 flex-1">{children}</div>
    </Surface>
  );
}
