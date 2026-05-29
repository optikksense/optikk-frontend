import { useMemo } from "react";

import { getConsumeErrors, getProcessErrors } from "@/features/saturation/api/kafkaPanelsApi";
import { mergeTwoSeries } from "@/features/saturation/series/mergeTwoSeries";
import { fmtNum } from "@/features/services/pages/ServiceDetailPage/formatters";

import { useKafkaErrorRateSeries } from "../hooks/useKafkaErrorRateSeries";
import { SeriesLinePanel } from "./SeriesLinePanel";

export function GroupErrorsChart() {
  const process = useKafkaErrorRateSeries("saturation-kafka.process-errors", (s, e) =>
    getProcessErrors(s, e)
  );
  const consume = useKafkaErrorRateSeries("saturation-kafka.consume-errors", (s, e) =>
    getConsumeErrors(s, e)
  );
  const merged = useMemo(
    () =>
      mergeTwoSeries(
        process.series.timestamps,
        process.series.values,
        consume.series.timestamps,
        consume.series.values
      ),
    [process.series, consume.series]
  );
  return (
    <SeriesLinePanel
      title="Consumer-group errors"
      subtitle="process · consume errors / second"
      timestamps={merged.timestamps}
      series={[
        { label: "process err/s", values: merged.a, color: "var(--color-error,#ef4444)" },
        { label: "consume err/s", values: merged.b, color: "var(--color-warning,#f59e0b)" },
      ]}
      emptyLabel="No consumer-group errors in this window."
      yFormatter={(v) => fmtNum(v)}
    />
  );
}
