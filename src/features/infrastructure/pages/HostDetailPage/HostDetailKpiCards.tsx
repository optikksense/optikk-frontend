import { KpiCard, type KpiTone } from "@shared/components/ui/cards/StatCard";

import type { HostOverview } from "../../api/hostDetailApi";

interface HostDetailKpiCardsProps {
  readonly overview: HostOverview | null;
}

function percentTone(v: number, warnAt: number, errAt: number): KpiTone {
  if (v >= errAt) return "err";
  if (v >= warnAt) return "warn";
  return "ok";
}

interface Tile {
  readonly label: string;
  readonly value: string;
  readonly tone: KpiTone;
  readonly hint?: string;
}

function pctTile(label: string, v: number | null, warnAt: number, errAt: number): Tile {
  if (v == null) return { label, value: "—", tone: "muted", hint: "not reported" };
  return { label, value: `${v.toFixed(0)}%`, tone: percentTone(v, warnAt, errAt) };
}

export function HostDetailKpiCards({ overview }: HostDetailKpiCardsProps) {
  const tiles: Tile[] = [
    pctTile("CPU", overview?.cpuPct ?? null, 75, 90),
    pctTile("Memory", overview?.memoryPct ?? null, 80, 90),
    pctTile("Disk (max volume)", overview?.diskPct ?? null, 80, 90),
    overview?.load1m != null
      ? { label: "Load (1m)", value: overview.load1m.toFixed(2), tone: "ok" }
      : { label: "Load (1m)", value: "—", tone: "muted", hint: "not reported" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tiles.map((t) => (
        <KpiCard key={t.label} label={t.label} value={t.value} tone={t.tone} subtext={t.hint} />
      ))}
    </div>
  );
}
