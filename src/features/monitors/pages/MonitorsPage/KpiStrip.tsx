import { memo } from "react";

import type { MonitorListStatusCounts } from "../../api/monitorsApi";

interface Props {
  readonly counts: MonitorListStatusCounts;
}

interface Kpi {
  readonly label: string;
  readonly value: number;
  readonly color: string;
  readonly sub: string;
}

function buildKpis(counts: MonitorListStatusCounts): Kpi[] {
  return [
    { label: "Alerting", value: counts.alert, color: "text-error", sub: "needs response" },
    { label: "Warn", value: counts.warn, color: "text-warning", sub: "approaching threshold" },
    { label: "OK", value: counts.ok, color: "text-success", sub: "within bounds" },
    {
      label: "No data",
      value: counts.no_data,
      color: "text-foreground-secondary",
      sub: "stopped reporting",
    },
    {
      label: "Muted",
      value: counts.muted,
      color: "text-foreground-secondary",
      sub: "alerts suppressed",
    },
  ];
}

function KpiStrip({ counts }: Props) {
  const kpis = buildKpis(counts);
  return (
    <div className="grid grid-cols-5 gap-3">
      {kpis.map((k) => (
        <div key={k.label} className="rounded-lg border border-border bg-card p-3">
          <div className="text-[11px] text-foreground-muted">{k.label}</div>
          <div className={`mt-1 font-semibold text-2xl ${k.color}`}>{k.value}</div>
          <div className="mt-0.5 text-[10px] text-foreground-muted">{k.sub}</div>
        </div>
      ))}
    </div>
  );
}

export default memo(KpiStrip);
