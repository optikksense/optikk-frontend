import type { ReactNode } from "react";

/**
 * Shared chart height for the four Golden Signal cards. Sized for the
 * per-endpoint cards, whose legend carries one row per endpoint.
 */
export const SIGNAL_CHART_HEIGHT = 190;

export function SignalLegend({ children }: { children: ReactNode }) {
  return <span className="font-medium text-[11px] text-foreground-muted">{children}</span>;
}
