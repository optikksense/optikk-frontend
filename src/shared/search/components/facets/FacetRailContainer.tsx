import { type ReactNode, memo } from "react";

export interface FacetRailContainerProps {
  readonly children: ReactNode;
}

/**
 * Shared container for explorer facet panels (Logs, Traces).
 * Enforces the right border, background color, padding, and sticky scrolling behavior.
 */
function FacetRailContainerComponent({ children }: FacetRailContainerProps) {
  return (
    <div className="border-border border-r bg-background" style={{ padding: "16px 14px" }}>
      {/* Sticks under the app header while the row list scrolls the page. */}
      <div className="sticky top-4 max-h-[calc(100vh-var(--space-header-h,56px)-3rem)] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

export const FacetRailContainer = memo(FacetRailContainerComponent);
