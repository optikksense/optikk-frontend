import { useMemo } from "react";

import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { firstValue } from "@shared/utils/chartDataUtils";

import { SparklineCell } from "@shared/components/ui/charts/micro/SparklineCell";

import { infraGet } from "../../api/infrastructureApi";

interface ChartRow {
  readonly [key: string]: unknown;
}

interface HostDetailKpiCardsProps {
  readonly host: string;
}

type Tone = "ok" | "warn" | "err" | "neutral";

const VALUE_TONE: Record<Tone, string> = {
  ok: "text-foreground",
  warn: "text-warning",
  err: "text-error",
  neutral: "text-foreground",
};

function cpuTone(v: number): Tone {
  if (v >= 90) return "err";
  if (v >= 75) return "warn";
  return "ok";
}

function memoryTone(v: number): Tone {
  if (v >= 90) return "err";
  if (v >= 80) return "warn";
  return "ok";
}

function normalizePercent(raw: unknown): number | null {
  const value = Number(raw);
  if (!Number.isFinite(value)) return null;
  return value <= 1 ? value * 100 : value;
}

function useHostSeries(metricKey: string, endpoint: string, host: string) {
  return useTimeRangeQuery<ChartRow[]>(`host-detail.${metricKey}.${host}`, async (team, s, e) => {
    if (!team) return [];
    const data = await infraGet<ChartRow[]>(endpoint, Number(s), Number(e), { host });
    return Array.isArray(data) ? data : [];
  });
}

function extractValues(rows: ChartRow[] | undefined): number[] {
  if (!rows) return [];
  return rows
    .map((row) => normalizePercent(firstValue(row, ["value", "request_count"], 0)))
    .filter((v): v is number => v != null);
}

function lastOf(values: number[]): number | null {
  if (values.length === 0) return null;
  const last = values[values.length - 1];
  return Number.isFinite(last) ? last : null;
}

interface KpiTileProps {
  readonly label: string;
  readonly endpoint: string;
  readonly metricKey: string;
  readonly host: string;
  readonly tone: (v: number) => Tone;
}

function KpiTile({ label, endpoint, metricKey, host, tone }: KpiTileProps) {
  const query = useHostSeries(metricKey, endpoint, host);
  const values = useMemo(() => extractValues(query.data), [query.data]);
  const last = lastOf(values);
  const valueTone: Tone = last != null ? tone(last) : "neutral";
  const sparklineTone = last == null ? "info" : last >= 90 ? "err" : last >= 75 ? "warn" : "info";
  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-card px-4 py-3">
      <div className="text-[10.5px] text-foreground-muted uppercase tracking-[0.08em]">{label}</div>
      <div
        className={`flex items-baseline gap-1.5 font-semibold text-[32px] leading-none ${VALUE_TONE[valueTone]}`}
      >
        {last != null ? `${last.toFixed(0)}%` : "—"}
      </div>
      <div className="mt-1 px-0.5">
        <SparklineCell values={values} tone={sparklineTone} width={220} height={36} />
      </div>
    </div>
  );
}

export function HostDetailKpiCards({ host }: HostDetailKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <KpiTile
        label="CPU"
        endpoint="/v1/infrastructure/cpu/by-instance"
        metricKey="cpu"
        host={host}
        tone={cpuTone}
      />
      <KpiTile
        label="Memory"
        endpoint="/v1/infrastructure/memory/by-instance"
        metricKey="memory"
        host={host}
        tone={memoryTone}
      />
    </div>
  );
}
