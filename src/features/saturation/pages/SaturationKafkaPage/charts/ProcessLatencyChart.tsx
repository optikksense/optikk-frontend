import { fmtMs } from "@/features/services/pages/ServiceDetailPage/formatters";

import { useKafkaProcessLatencySeries } from "../hooks/useKafkaProcessLatencySeries";
import { SeriesLinePanel } from "./SeriesLinePanel";

export function ProcessLatencyChart() {
  const { series } = useKafkaProcessLatencySeries();
  return (
    <SeriesLinePanel
      title="Process latency"
      subtitle="p50 / p95 / p99 · worst across groups"
      timestamps={series.timestamps}
      series={[
        { label: "p50", values: series.p50, color: "var(--color-info,#3b82f6)" },
        { label: "p95", values: series.p95, color: "var(--color-warning,#f59e0b)" },
        { label: "p99", values: series.p99, color: "var(--color-error,#ef4444)" },
      ]}
      emptyLabel="No process-latency data in this window."
      yFormatter={(v) => fmtMs(v)}
    />
  );
}
