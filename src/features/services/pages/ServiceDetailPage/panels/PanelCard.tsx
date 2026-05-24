import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PanelCardProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly action?: ReactNode;
  readonly children: ReactNode;
  readonly padded?: boolean;
  readonly className?: string;
}

export function PanelCard({
  title,
  subtitle,
  action,
  children,
  padded = true,
  className,
}: PanelCardProps) {
  return (
    <section
      className={cn(
        "rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] shadow-[var(--shadow-sm)]",
        className
      )}
    >
      <header className="flex items-start justify-between gap-4 border-[var(--border-color)] border-b px-4 py-3">
        <div className="min-w-0">
          <div className="font-medium text-[13px] text-[var(--text-primary)]">{title}</div>
          {subtitle && (
            <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">{subtitle}</div>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      <div className={padded ? "p-4" : ""}>{children}</div>
    </section>
  );
}
