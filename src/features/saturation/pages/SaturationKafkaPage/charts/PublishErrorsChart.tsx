import { getPublishErrors } from "@/features/saturation/api/kafkaPanelsApi";
import { fmtNum } from "@/features/services/pages/ServiceDetailPage/formatters";

import { useKafkaErrorRateSeries } from "../hooks/useKafkaErrorRateSeries";
import { SeriesLinePanel } from "./SeriesLinePanel";

export function PublishErrorsChart() {
  const { series } = useKafkaErrorRateSeries(
    "saturation-kafka.publish-errors",
    (s, e) => getPublishErrors(s, e)
  );
  return (
    <SeriesLinePanel
      title="Publish errors"
      subtitle="producer errors / second · all topics"
      timestamps={series.timestamps}
      series={[{ label: "publish err/s", values: series.values, color: "var(--color-error,#ef4444)" }]}
      emptyLabel="No publish errors in this window."
      type="area"
      yFormatter={(v) => fmtNum(v)}
    />
  );
}
