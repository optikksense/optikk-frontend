import { formatNumber } from "@shared/utils/formatters";

import type { PodOverview } from "../../api/podDetailApi";

interface ContainerDetailKpiCardsProps {
  readonly overview: PodOverview | null;
}

type Tone = "ok" | "warn" | "err" | "neutral";

const VALUE_TONE: Record<Tone, string> = {
  ok: "text-foreground",
  warn: "text-warning",
  err: "text-error",
  neutral: "text-foreground-muted",
};

interface KpiTileProps {
  readonly label: string;
  readonly value: string;
  readonly tone: Tone;
  readonly hint?: string;
}

function KpiTile({ label, value, tone, hint }: KpiTileProps) {
  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-border bg-card px-4 py-3">
      <div className="text-[10.5px] text-foreground-muted uppercase tracking-[0.08em]">{label}</div>
      <div className={`font-semibold text-[28px] leading-none ${VALUE_TONE[tone]}`}>{value}</div>
      {hint && <div className="text-[11px] text-foreground-muted">{hint}</div>}
    </div>
  );
}

function fmtMs(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(2)}s`;
  return `${Math.round(v)}ms`;
}

const NO_TRAFFIC: Omit<KpiTileProps, "label"> = {
  value: "—",
  tone: "neutral",
  hint: "no traffic",
};

function buildTiles(overview: PodOverview | null): KpiTileProps[] {
  if (!overview || overview.request_count === 0) {
    return [
      { label: "Requests", ...NO_TRAFFIC },
      { label: "Error rate", ...NO_TRAFFIC },
      { label: "Avg latency", ...NO_TRAFFIC },
      { label: "p95 latency", ...NO_TRAFFIC },
    ];
  }
  const errTone: Tone = overview.error_rate >= 5 ? "err" : overview.error_rate >= 1 ? "warn" : "ok";
  return [
    { label: "Requests", value: formatNumber(overview.request_count), tone: "ok" },
    { label: "Error rate", value: `${overview.error_rate.toFixed(2)}%`, tone: errTone },
    { label: "Avg latency", value: fmtMs(overview.avg_latency_ms), tone: "ok" },
    { label: "p95 latency", value: fmtMs(overview.p95_latency_ms), tone: "ok" },
  ];
}

export function ContainerDetailKpiCards({ overview }: ContainerDetailKpiCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {buildTiles(overview).map((t) => (
        <KpiTile key={t.label} {...t} />
      ))}
    </div>
  );
}
