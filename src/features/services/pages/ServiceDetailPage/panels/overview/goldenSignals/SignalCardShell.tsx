import type { ReactNode } from "react";

/** Shared chart height for the four Golden Signal cards. */
export const SIGNAL_CHART_HEIGHT = 150;

/** Muted current/avg value shown in a signal card header. */
export function SignalLegend({ children }: { children: ReactNode }) {
  return <span className="font-medium text-[11px] text-foreground-muted">{children}</span>;
}
