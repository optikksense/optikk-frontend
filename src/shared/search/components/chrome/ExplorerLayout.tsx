import { type ReactNode, memo } from "react";

import { cn } from "@shared/lib/utils";

export interface ExplorerLayoutProps {
  readonly header: ReactNode;
  readonly facets?: ReactNode;
  readonly content: ReactNode;
  readonly embedded?: boolean;
  readonly className?: string;
}

/**
 * Shared layout component for Explorer pages (Logs, Traces).
 * Enforces a strict grid layout: full-width header on top, left facet rail, right content area.
 */
function ExplorerLayoutComponent({
  header,
  facets,
  content,
  embedded = false,
  className,
}: ExplorerLayoutProps) {
  return (
    <div
      className={cn(
        "flex flex-col bg-background",
        embedded
          ? "overflow-hidden rounded-lg border border-border shadow-[var(--shadow-sm)]"
          : "min-h-full",
        className
      )}
    >
      <div className="bg-surface-muted">{header}</div>

      <div className={cn("flex-1", facets ? "grid grid-cols-[236px_minmax(0,1fr)]" : "flex")}>
        {facets ?? null}

        <div className="flex min-w-0 flex-1 flex-col bg-background p-4 md:p-[18px_22px]">
          {content}
        </div>
      </div>
    </div>
  );
}

export const ExplorerLayout = memo(ExplorerLayoutComponent);
