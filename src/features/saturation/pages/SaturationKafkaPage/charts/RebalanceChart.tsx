import { fmtNum } from "@/features/services/pages/ServiceDetailPage/formatters";

import { useKafkaRebalanceSeries } from "../hooks/useKafkaRebalanceSeries";
import { SeriesLinePanel } from "./SeriesLinePanel";

export function RebalanceChart() {
  const { series } = useKafkaRebalanceSeries();
  return (
    <SeriesLinePanel
      title="Rebalance signals"
      subtitle="rebalance · join · sync · failed-heartbeat rates"
      timestamps={series.timestamps}
      series={[
        { label: "rebalance/s", values: series.rebalanceRate, color: "var(--color-error,#ef4444)" },
        { label: "join/s", values: series.joinRate, color: "var(--color-info,#3b82f6)" },
        { label: "sync/s", values: series.syncRate, color: "var(--chart-5,#c084fc)" },
        {
          label: "failed hb/s",
          values: series.failedHeartbeatRate,
          color: "var(--color-warning,#f59e0b)",
        },
      ]}
      emptyLabel="No rebalance signals in this window."
      yFormatter={(v) => fmtNum(v)}
    />
  );
}
