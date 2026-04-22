import { memo, type ReactNode } from "react";

export interface SummaryKPI {
  readonly label: string;
  readonly value: ReactNode;
  readonly tone?: "default" | "error" | "success" | "warn";
  readonly hint?: string;
}

interface Props {
  readonly kpis: readonly SummaryKPI[];
}

/**
 * Compact KPI strip for the explorer header. Plugs into `ExplorerHeader`'s
 * `kpiStrip` slot so the chrome remains responsible for layout; this
 * component is purely presentational.
 */
function SummaryStripComponent({ kpis }: Props) {
  if (kpis.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-4">
      {kpis.map((kpi) => (
        <div key={kpi.label} className="flex flex-col" title={kpi.hint}>
          <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
            {kpi.label}
          </span>
          <span className={`text-base font-semibold ${toneClass(kpi.tone)}`}>{kpi.value}</span>
        </div>
      ))}
    </div>
  );
}

function toneClass(tone: SummaryKPI["tone"]): string {
  switch (tone) {
    case "error":
      return "text-[#e8494d]";
    case "warn":
      return "text-[#e0b400]";
    case "success":
      return "text-[#73bf69]";
    default:
      return "text-[var(--text-primary)]";
  }
}

export const SummaryStrip = memo(SummaryStripComponent);
