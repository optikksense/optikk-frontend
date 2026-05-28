import { useMemo } from "react";

import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { firstValue } from "@shared/utils/chartDataUtils";

import { SparklineCell } from "@/features/services/pages/ServiceCatalogPage/catalog/SparklineCell";

import { infraGet } from "../../api/infrastructureApi";

interface ChartRow {
  readonly [key: string]: unknown;
}

interface ContainerDetailKpiCardsProps {
  readonly container: string;
  readonly host: string;
  readonly serviceName: string;
}

type Tone = "ok" | "warn" | "err" | "neutral";

const VALUE_TONE: Record<Tone, string> = {
  ok: "text-[var(--text-primary)]",
  warn: "text-[var(--color-warning)]",
  err: "text-[var(--color-error)]",
  neutral: "text-[var(--text-primary)]",
};

function utilizationTone(v: number, warnAt: number, errAt: number): Tone {
  if (v >= errAt) return "err";
  if (v >= warnAt) return "warn";
  return "ok";
}

function normalizePercent(raw: unknown): number | null {
  const value = Number(raw);
  if (!Number.isFinite(value)) return null;
  return value <= 1 ? value * 100 : value;
}

function usePodSeries(
  metricKey: string,
  endpoint: string,
  host: string,
  pod: string,
  serviceName: string
) {
  return useTimeRangeQuery<ChartRow[]>(
    `container-detail.${metricKey}.${pod}`,
    async (team, s, e) => {
      if (!team || !host || !pod || !serviceName) return [];
      const data = await infraGet<ChartRow[]>(endpoint, team, Number(s), Number(e), {
        host,
        pod,
        serviceName,
      });
      return Array.isArray(data) ? data : [];
    }
  );
}

function extractValues(rows: ChartRow[] | undefined): number[] {
  if (!rows) return [];
  return rows
    .map((row) => normalizePercent(firstValue(row, ["value"], 0)))
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
  readonly container: string;
  readonly host: string;
  readonly serviceName: string;
  readonly warnAt: number;
  readonly errAt: number;
}

function KpiTile({
  label,
  endpoint,
  metricKey,
  container,
  host,
  serviceName,
  warnAt,
  errAt,
}: KpiTileProps) {
  const query = usePodSeries(metricKey, endpoint, host, container, serviceName);
  const values = useMemo(() => extractValues(query.data), [query.data]);
  const last = lastOf(values);
  const valueTone: Tone = last != null ? utilizationTone(last, warnAt, errAt) : "neutral";
  const sparklineTone = last == null ? "info" : last >= errAt ? "err" : last >= warnAt ? "warn" : "info";
  return (
    <div className="flex flex-col gap-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3">
      <div className="text-[10.5px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
        {label}
      </div>
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

export function ContainerDetailKpiCards({
  container,
  host,
  serviceName,
}: ContainerDetailKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <KpiTile
        label="CPU"
        endpoint="/v1/infrastructure/cpu/by-instance"
        metricKey="cpu"
        container={container}
        host={host}
        serviceName={serviceName}
        warnAt={75}
        errAt={90}
      />
      <KpiTile
        label="Memory"
        endpoint="/v1/infrastructure/memory/by-instance"
        metricKey="memory"
        container={container}
        host={host}
        serviceName={serviceName}
        warnAt={80}
        errAt={90}
      />
    </div>
  );
}
