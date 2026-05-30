import { useMemo } from "react";

import ObservabilityChart from "@shared/components/ui/charts/ObservabilityChart";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { getKafkaE2ELatency } from "@/features/saturation/api/kafkaPanelsApi";
import type { E2ELatencyPoint } from "@/features/saturation/api/kafkaPanelsSchemas";
import { fmtMs } from "@/features/services/pages/ServiceDetailPage/formatters";
import { PanelCard } from "@/features/services/pages/ServiceDetailPage/panels/PanelCard";

interface AggregatedE2ESeries {
  readonly timestamps: number[];
  readonly publishP95: number[];
  readonly receiveP95: number[];
  readonly processP95: number[];
}

function aggregate(points: E2ELatencyPoint[]): AggregatedE2ESeries {
  type Acc = {
    publishSum: number;
    receiveSum: number;
    processSum: number;
    count: number;
  };
  const map = new Map<number, Acc>();
  for (const p of points) {
    const ts = Math.floor(new Date(p.timestamp).getTime() / 1000);
    if (!Number.isFinite(ts)) continue;
    const acc = map.get(ts) ?? { publishSum: 0, receiveSum: 0, processSum: 0, count: 0 };
    acc.publishSum += p.publish_p95_ms;
    acc.receiveSum += p.receive_p95_ms;
    acc.processSum += p.process_p95_ms;
    acc.count += 1;
    map.set(ts, acc);
  }
  const timestamps = Array.from(map.keys()).sort((a, b) => a - b);
  return {
    timestamps,
    publishP95: timestamps.map((t) => (map.get(t)!.publishSum / map.get(t)!.count) || 0),
    receiveP95: timestamps.map((t) => (map.get(t)!.receiveSum / map.get(t)!.count) || 0),
    processP95: timestamps.map((t) => (map.get(t)!.processSum / map.get(t)!.count) || 0),
  };
}

function ChartBody({ series }: { series: AggregatedE2ESeries }) {
  if (series.timestamps.length === 0) {
    return (
      <div className="grid h-[200px] place-items-center text-[12px] text-foreground-muted">
        No e2e latency samples in this window.
      </div>
    );
  }
  return (
    <ObservabilityChart
      timestamps={series.timestamps}
      series={[
        { label: "publish p95", values: series.publishP95, color: "var(--color-info,#3b82f6)" },
        { label: "receive p95", values: series.receiveP95, color: "var(--color-warning,#f59e0b)" },
        { label: "process p95", values: series.processP95, color: "var(--color-error,#ef4444)" },
      ]}
      height={260}
      yFormatter={(v) => fmtMs(v)}
    />
  );
}

export default function E2ELatencyTab() {
  const query = useTimeRangeQuery<E2ELatencyPoint[]>(
    "saturation-kafka.e2e-latency",
    (_team, s, e) => getKafkaE2ELatency(s, e)
  );
  const series = useMemo(() => aggregate(query.data ?? []), [query.data]);
  return (
    <PanelCard
      title="End-to-end latency"
      subtitle="publish · receive · process p95 — averaged across topics"
    >
      <ChartBody series={series} />
    </PanelCard>
  );
}
