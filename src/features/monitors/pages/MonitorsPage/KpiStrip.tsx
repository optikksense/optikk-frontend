import { memo } from "react";

import { KpiCard, type KpiTone } from "@shared/components/ui/cards/StatCard";

import type { MonitorListStatusCounts } from "../../api/monitorsApi";

interface Props {
  readonly counts: MonitorListStatusCounts;
}

interface Kpi {
  readonly label: string;
  readonly value: number;
  readonly tone: KpiTone;
  readonly sub: string;
}

function buildKpis(counts: MonitorListStatusCounts): Kpi[] {
  return [
    { label: "Alerting", value: counts.alert, tone: "err", sub: "needs response" },
    { label: "Warn", value: counts.warn, tone: "warn", sub: "approaching threshold" },
    { label: "OK", value: counts.ok, tone: "success", sub: "within bounds" },
    { label: "No data", value: counts.noData, tone: "muted", sub: "stopped reporting" },
    { label: "Muted", value: counts.muted, tone: "muted", sub: "alerts suppressed" },
  ];
}

function KpiStrip({ counts }: Props) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {buildKpis(counts).map((k) => (
        <KpiCard
          key={k.label}
          label={k.label}
          value={String(k.value)}
          tone={k.tone}
          subtext={k.sub}
        />
      ))}
    </div>
  );
}

export default memo(KpiStrip);
