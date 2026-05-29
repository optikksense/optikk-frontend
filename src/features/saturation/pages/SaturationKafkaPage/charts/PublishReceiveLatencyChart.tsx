import { useMemo } from "react";

import {
  getPublishLatencyByTopic,
  getReceiveLatencyByTopic,
} from "@/features/saturation/api/kafkaPanelsApi";
import { mergeTwoSeries } from "@/features/saturation/series/mergeTwoSeries";
import { fmtMs } from "@/features/services/pages/ServiceDetailPage/formatters";

import { useKafkaTopicLatencySeries } from "../hooks/useKafkaTopicLatencySeries";
import { SeriesLinePanel } from "./SeriesLinePanel";

export function PublishReceiveLatencyChart() {
  const publish = useKafkaTopicLatencySeries("saturation-kafka.publish-latency-by-topic", (s, e) =>
    getPublishLatencyByTopic(s, e)
  );
  const receive = useKafkaTopicLatencySeries("saturation-kafka.receive-latency-by-topic", (s, e) =>
    getReceiveLatencyByTopic(s, e)
  );
  const merged = useMemo(
    () =>
      mergeTwoSeries(
        publish.series.timestamps,
        publish.series.p95,
        receive.series.timestamps,
        receive.series.p95
      ),
    [publish.series, receive.series]
  );
  return (
    <SeriesLinePanel
      title="Publish / receive latency"
      subtitle="p95 · worst across topics"
      timestamps={merged.timestamps}
      series={[
        { label: "publish p95", values: merged.a, color: "var(--color-info,#3b82f6)" },
        { label: "receive p95", values: merged.b, color: "var(--color-warning,#f59e0b)" },
      ]}
      emptyLabel="No publish/receive latency in this window."
      yFormatter={(v) => fmtMs(v)}
    />
  );
}
