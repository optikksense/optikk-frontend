import { type ReactNode, memo } from "react";

export interface ExplorerLayoutProps {
  readonly header: ReactNode;
  readonly facets: ReactNode;
  readonly content: ReactNode;
}

/**
 * Shared layout component for Explorer pages (Logs, Traces).
 * Enforces a strict grid layout: full-width header on top, left facet rail, right content area.
 */
function ExplorerLayoutComponent({ header, facets, content }: ExplorerLayoutProps) {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <div className="bg-surface-muted">{header}</div>

      <div className="grid flex-1 grid-cols-[236px_1fr]">
        {facets}

        <div className="flex flex-col bg-background p-4 md:p-[18px_22px] min-w-0">{content}</div>
      </div>
    </div>
  );
}

export const ExplorerLayout = memo(ExplorerLayoutComponent);
