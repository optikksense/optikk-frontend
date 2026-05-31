import { fmtNum } from "@/features/services/pages/ServiceDetailPage/formatters";

import { useKafkaProcessRateSeries } from "../hooks/useKafkaProcessRateSeries";
import { SeriesLinePanel } from "./SeriesLinePanel";

export function ProcessRateChart() {
  const { series } = useKafkaProcessRateSeries();
  return (
    <SeriesLinePanel
      title="Process rate"
      subtitle="records processed / second · all groups"
      timestamps={series.timestamps}
      series={[{ label: "processed/s", values: series.values, color: "var(--color-info,#3b82f6)" }]}
      emptyLabel="No process-rate data in this window."
      yFormatter={(v) => fmtNum(v)}
    />
  );
}
