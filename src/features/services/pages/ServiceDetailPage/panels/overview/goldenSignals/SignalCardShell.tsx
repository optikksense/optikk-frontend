import type { ReactNode } from "react";

export const SIGNAL_CHART_HEIGHT = 190;

export function SignalLegend({ children }: { children: ReactNode }) {
  return <span className="font-medium text-[11px] text-foreground-muted">{children}</span>;
}
